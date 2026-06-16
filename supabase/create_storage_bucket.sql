-- ============================================================
-- MONO — Product images storage bucket
-- Run in the Supabase SQL Editor.
-- Safe to re-run: idempotent via ON CONFLICT.
--
-- The bucket is public so product images are servable via their
-- public URL directly (no signed URLs needed on the storefront).
-- Uploads only happen server-side through the service-role client
-- (see uploadProductImage action), which bypasses storage RLS —
-- no additional INSERT/UPDATE/DELETE policies are required.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ── Verify ────────────────────────────────────────────────────
select id, name, public from storage.buckets where id = 'product-images';
