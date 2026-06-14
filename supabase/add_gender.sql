-- ============================================================
-- MONO — Add gender to products
-- Run this in Supabase SQL Editor BEFORE re-running seed.sql
-- ============================================================

alter table public.products
  add column if not exists gender text not null default 'men'
  check (gender in ('men', 'women', 'unisex'));

create index if not exists products_gender_idx on public.products(gender);
