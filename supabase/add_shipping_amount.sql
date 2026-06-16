-- ============================================================
-- MONO — add shipping_amount to orders
-- Run in the Supabase SQL Editor.
-- ============================================================

alter table public.orders
  add column if not exists shipping_amount integer not null default 0
    check (shipping_amount >= 0);
