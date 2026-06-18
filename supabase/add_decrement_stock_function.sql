-- ============================================================
-- MONO — decrement variant stock on order fulfillment
-- Run in the Supabase SQL Editor.
-- ============================================================

alter table public.orders
  add column if not exists stock_decremented_at timestamptz;

-- Called from the Stripe webhook every time checkout.session.completed
-- is delivered for an order — including Stripe's automatic retries, which
-- is exactly what makes this safe to call repeatedly. The orders claim
-- (stock_decremented_at) and the variant decrement run in the same
-- implicit function transaction, so a concurrent or repeated call for the
-- same order either claims the row and decrements exactly once, or finds
-- it already claimed and no-ops. The variant update itself is clamped at
-- zero so it can never violate the `stock >= 0` check constraint.
create or replace function public.decrement_order_stock(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
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
$$;

revoke all on function public.decrement_order_stock(uuid) from public;
grant execute on function public.decrement_order_stock(uuid) to service_role;
