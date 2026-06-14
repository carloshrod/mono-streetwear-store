"use server";

import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/types/user";

export type CheckoutItem = {
  product_id: string;
  variant_id: string;
  quantity: number;
};

export type CreateOrderResult = { orderId: string };

/**
 * Creates an order in the database. Prices are re-fetched server-side to
 * prevent client-side manipulation — the client only sends product/variant IDs
 * and quantities.
 */
export const createOrder = async (
  items: CheckoutItem[],
  shippingAddress: Address,
): Promise<CreateOrderResult> => {
  if (items.length === 0) throw new Error("Cart is empty");

  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();

  // Re-fetch prices to prevent client-side price manipulation
  const productIds = [...new Set(items.map((i) => i.product_id))];
  const { data: products, error: priceError } = await supabase
    .from("products")
    .select("id, price")
    .in("id", productIds)
    .eq("status", "active");

  if (priceError || !products?.length) {
    throw new Error("Failed to validate product prices");
  }

  const priceMap = new Map(products.map((p) => [p.id as string, p.price as number]));

  for (const item of items) {
    if (!priceMap.has(item.product_id)) {
      throw new Error("One or more products are unavailable");
    }
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + priceMap.get(item.product_id)! * item.quantity,
    0,
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      shipping_address: shippingAddress,
      total_amount: totalAmount,
      stripe_payment_intent_id: null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error("Failed to create order");
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: priceMap.get(item.product_id)!,
    })),
  );

  if (itemsError) throw new Error("Failed to save order items");

  return { orderId: order.id as string };
};
