"use server";

import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import type { Address } from "@/types/user";

export type CheckoutItem = {
  product_id: string;
  variant_id: string;
  quantity: number;
};

export type CreateOrderResult = {
  orderId: string;
  checkoutUrl: string;
};

/**
 * Creates an order in the database and a Stripe Checkout Session.
 * Prices are re-fetched server-side to prevent client-side manipulation —
 * the client only sends product/variant IDs and quantities.
 */
export const createOrder = async (
  items: CheckoutItem[],
  shippingAddress: Address,
): Promise<CreateOrderResult> => {
  if (items.length === 0) throw new Error("Cart is empty");

  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();

  // Re-fetch prices and names to prevent client-side manipulation
  const productIds = [...new Set(items.map((i) => i.product_id))];
  const { data: products, error: priceError } = await supabase
    .from("products")
    .select("id, price, name")
    .in("id", productIds)
    .eq("status", "active");

  if (priceError || !products?.length) {
    throw new Error("Failed to validate product prices");
  }

  const priceMap = new Map(products.map((p) => [p.id as string, p.price as number]));
  const nameMap = new Map(products.map((p) => [p.id as string, p.name as string]));

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: items.map((item) => ({
      price_data: {
        currency: "usd",
        unit_amount: priceMap.get(item.product_id)!,
        product_data: { name: nameMap.get(item.product_id)! },
      },
      quantity: item.quantity,
    })),
    metadata: { orderId: order.id as string },
    payment_intent_data: { metadata: { orderId: order.id as string } },
    customer_email: user.email ?? undefined,
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout`,
  });

  await supabase
    .from("orders")
    .update({ stripe_session_id: session.id })
    .eq("id", order.id);

  return { orderId: order.id as string, checkoutUrl: session.url! };
};
