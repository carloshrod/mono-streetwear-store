-- ============================================================
-- MONO — reference schema
-- Run in the Supabase SQL Editor (or via: supabase db push).
-- See README.md in this folder for the full setup order.
-- ============================================================

-- ── Enums ───────────────────────────────────────────────────
create type user_role      as enum ('customer', 'admin');
create type product_status as enum ('active', 'draft', 'archived');
create type product_gender as enum ('men', 'women', 'unisex');
create type order_status   as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- ── Profiles ────────────────────────────────────────────────
-- Extends auth.users. Created automatically on sign-up (see trigger below).
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        user_role   not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Categories ──────────────────────────────────────────────
create table public.categories (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        not null unique,
  created_at  timestamptz not null default now()
);

-- ── Products ────────────────────────────────────────────────
create table public.products (
  id           uuid           primary key default gen_random_uuid(),
  slug         text           not null unique,
  name         text           not null,
  description  text           not null default '',
  price        integer        not null check (price >= 0),    -- in cents
  category_id  uuid           references public.categories(id) on delete set null,
  images       text[]         not null default '{}',          -- Supabase Storage URLs
  status       product_status not null default 'draft',
  gender       product_gender not null default 'men',
  created_at   timestamptz    not null default now(),
  updated_at   timestamptz    not null default now()
);

-- ── Product variants (size × stock per product) ─────────────
create table public.product_variants (
  id          uuid        primary key default gen_random_uuid(),
  product_id  uuid        not null references public.products(id) on delete cascade,
  size        text        not null,
  stock       integer     not null default 0 check (stock >= 0),
  created_at  timestamptz not null default now(),
  unique (product_id, size)
);

-- ── Orders ──────────────────────────────────────────────────
create table public.orders (
  id                        uuid          primary key default gen_random_uuid(),
  user_id                   uuid          not null references auth.users(id) on delete restrict,
  status                    order_status  not null default 'pending',
  shipping_address          jsonb         not null,           -- type: Address
  shipping_amount           integer       not null default 0 check (shipping_amount >= 0),
  total_amount              integer       not null check (total_amount >= 0), -- in cents
  stripe_payment_intent_id  text          unique,
  stripe_session_id         text          unique,
  stock_decremented_at      timestamptz,
  created_at                timestamptz   not null default now(),
  updated_at                timestamptz   not null default now()
);

-- ── Order items ─────────────────────────────────────────────
-- Snapshot of product + variant at purchase time; never joins live product price.
create table public.order_items (
  id          uuid     primary key default gen_random_uuid(),
  order_id    uuid     not null references public.orders(id) on delete cascade,
  product_id  uuid     not null references public.products(id) on delete restrict,
  variant_id  uuid     not null references public.product_variants(id) on delete restrict,
  quantity    integer  not null check (quantity > 0),
  unit_price  integer  not null check (unit_price >= 0)  -- cents, frozen at checkout
);

-- ── Indexes ─────────────────────────────────────────────────
create index on public.products(slug);
create index on public.products(category_id);
create index on public.products(status);
create index on public.products(gender);
create index on public.product_variants(product_id);
create index on public.orders(user_id);
create index on public.orders(status);
create index on public.order_items(order_id);

-- ── updated_at trigger ──────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute function update_updated_at();
create trigger set_updated_at before update on public.products
  for each row execute function update_updated_at();
create trigger set_updated_at before update on public.orders
  for each row execute function update_updated_at();

-- ── Auto-create profile on sign-up ──────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Stock decrement on order fulfillment ─────────────────────
-- Called from the Stripe webhook every time checkout.session.completed
-- is delivered for an order — including Stripe's automatic retries,
-- which is exactly what makes this safe to call repeatedly. The orders
-- claim (stock_decremented_at) and the variant decrement run in the
-- same implicit function transaction, so a concurrent or repeated call
-- for the same order either claims the row and decrements exactly
-- once, or finds it already claimed and no-ops. The variant update is
-- clamped at zero so it can never violate the `stock >= 0` check
-- constraint on product_variants.
create or replace function decrement_order_stock(p_order_id uuid)
returns void as $$
declare
  claimed int;
begin
  update public.orders
  set stock_decremented_at = now()
  where id = p_order_id
    and stock_decremented_at is null;

  get diagnostics claimed = row_count;

  if claimed = 0 then
    return;
  end if;

  update public.product_variants pv
  set stock = greatest(pv.stock - oi.quantity, 0)
  from public.order_items oi
  where oi.order_id = p_order_id
    and oi.variant_id = pv.id;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function decrement_order_stock(uuid) from public;
grant execute on function decrement_order_stock(uuid) to service_role;

-- ── Row Level Security ──────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;

-- profiles
create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- categories (public read)
create policy "Anyone can view categories"
  on public.categories for select using (true);

-- products (public read for active; admin full access)
create policy "Anyone can view active products"
  on public.products for select using (status = 'active');
create policy "Admins can manage products"
  on public.products for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- product variants
create policy "Anyone can view variants of active products"
  on public.product_variants for select using (
    exists (select 1 from public.products where id = product_id and status = 'active')
  );
create policy "Admins can manage variants"
  on public.product_variants for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- orders
create policy "Users can view their own orders"
  on public.orders for select using (auth.uid() = user_id);
create policy "Users can create their own orders"
  on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can manage all orders"
  on public.orders for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- order items
create policy "Users can view their own order items"
  on public.order_items for select using (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );
create policy "Users can insert order items for their own orders"
  on public.order_items for insert with check (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );
create policy "Admins can manage all order items"
  on public.order_items for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── Storage ─────────────────────────────────────────────────
-- Product images bucket — public so images are servable via their public
-- URL directly (no signed URLs needed on the storefront). Uploads only
-- happen server-side through the service-role client (see
-- uploadProductImage action), which bypasses storage RLS — no
-- additional INSERT/UPDATE/DELETE policies are required.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
