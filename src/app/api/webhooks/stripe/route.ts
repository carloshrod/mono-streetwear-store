import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import {
  sendOrderConfirmationEmail,
  sendAdminNewOrderEmail,
} from "@/lib/email/order-emails";

export const POST = async (request: NextRequest) => {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: updatedOrder } = await supabase
      .from("orders")
      .update({
        status: "processing",
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq("id", orderId)
      .eq("status", "pending") // idempotency guard
      .select("id, total_amount, shipping_amount, shipping_address")
      .maybeSingle();

    // Only the request that actually flips pending -> processing sends
    // notifications, so Stripe's automatic webhook retries never
    // double-send the confirmation emails.
    if (updatedOrder) {
      const customerEmail =
        session.customer_details?.email ?? session.customer_email ?? null;

      type OrderItemRow = {
        quantity: number;
        unit_price: number;
        product: { name: string } | null;
        variant: { size: string } | null;
      };

      const { data: items } = await supabase
        .from("order_items")
        .select(
          "quantity, unit_price, product:products(name), variant:product_variants(size)"
        )
        .eq("order_id", orderId);

      const itemRows = (items ?? []) as unknown as OrderItemRow[];

      const emailData = {
        orderId: updatedOrder.id as string,
        totalAmount: updatedOrder.total_amount as number,
        shippingAmount: updatedOrder.shipping_amount as number,
        shippingAddress: updatedOrder.shipping_address,
        items: itemRows.map((item) => ({
          name: item.product?.name ?? "Product",
          size: item.variant?.size ?? null,
          quantity: item.quantity,
          unitPrice: item.unit_price,
        })),
      };

      try {
        if (customerEmail) {
          await sendOrderConfirmationEmail(customerEmail, emailData);
        }
        await sendAdminNewOrderEmail({
          ...emailData,
          customerEmail: customerEmail ?? "unknown",
        });
      } catch (emailError) {
        // Don't fail the webhook over email delivery issues — the order is
        // already correctly updated, and a non-2xx response here would
        // make Stripe retry the whole event.
        console.error("Failed to send order notification emails", emailError);
      }
    }

    // Decrement stock on every delivery, including Stripe's automatic
    // retries — decrement_order_stock claims the order atomically via
    // stock_decremented_at, so repeated calls for the same order are
    // safe. Returning a 500 here makes Stripe retry the event later if
    // this fails (e.g. a transient DB error), recovering automatically
    // instead of leaving stock permanently un-decremented.
    const { error: stockError } = await supabase.rpc("decrement_order_stock", {
      p_order_id: orderId,
    });

    if (stockError) {
      console.error("Failed to decrement stock for order", orderId, stockError);
      return NextResponse.json({ error: "Stock decrement failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
};
