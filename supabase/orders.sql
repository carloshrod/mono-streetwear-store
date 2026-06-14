-- Run this in the Supabase SQL Editor.
-- Creates the profiles, orders, and order_items tables with RLS policies.

-- ─── Profiles ────────────────────────────────────────────────────────────────

create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        text not null default 'customer'
                check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- ─── Orders ──────────────────────────────────────────────────────────────────

create table if not exists orders (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users (id),
  status                    text not null default 'pending'
                              check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address          jsonb not null,
  total_amount              integer not null check (total_amount >= 0),
  stripe_payment_intent_id  text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

alter table orders enable row level security;

create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can create own orders"
  on orders for insert
  with check (auth.uid() = user_id);

-- ─── Order items ─────────────────────────────────────────────────────────────

create table if not exists order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders (id) on delete cascade,
  product_id  uuid not null references products (id),
  variant_id  uuid not null references product_variants (id),
  quantity    integer not null check (quantity > 0),
  unit_price  integer not null check (unit_price >= 0)
);

alter table order_items enable row level security;

create policy "Users can view own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert own order items"
  on order_items for insert
  with check (
    exists (
      select 1 from orders
      where orders.id = order_id
        and orders.user_id = auth.uid()
    )
  );
