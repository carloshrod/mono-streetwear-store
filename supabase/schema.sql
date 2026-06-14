-- ============================================================
-- MONO — reference schema
-- Run in Supabase SQL Editor or via: supabase db push
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
-- Extends auth.users. Created automatically on sign-up (see trigger below).
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        text        not null default 'customer'
                          check (role in ('customer', 'admin')),
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
  id           uuid        primary key default gen_random_uuid(),
  slug         text        not null unique,
  name         text        not null,
  description  text        not null default '',
  price        integer     not null check (price >= 0),    -- in cents
  category_id  uuid        references public.categories(id) on delete set null,
  images       text[]      not null default '{}',          -- Supabase Storage URLs
  status       text        not null default 'draft'
                           check (status in ('active', 'draft', 'archived')),
  gender       text        not null default 'men'
                           check (gender in ('men', 'women', 'unisex')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
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
  id                        uuid        primary key default gen_random_uuid(),
  user_id                   uuid        not null references auth.users(id) on delete restrict,
  status                    text        not null default 'pending'
                                        check (status in ('pending','processing','shipped','delivered','cancelled')),
  shipping_address          jsonb       not null,           -- type: Address
  total_amount              integer     not null check (total_amount >= 0), -- in cents
  stripe_payment_intent_id  text        unique,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
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
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

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
