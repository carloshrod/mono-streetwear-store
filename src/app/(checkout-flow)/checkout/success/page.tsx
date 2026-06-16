import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { stripe } from "@/lib/stripe";
import { CheckoutSuccessView } from "@/components/features/checkout/checkout-success-view";

export const metadata: Metadata = {
  title: "Order Confirmed — MONO",
};

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

const CheckoutSuccessPage = async ({ searchParams }: Props) => {
  const { session_id } = await searchParams;

  if (!session_id) redirect("/");

  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== "paid") redirect("/checkout");

  const orderId = session.metadata?.orderId ?? null;

  return <CheckoutSuccessView orderId={orderId} />;
};

export default CheckoutSuccessPage;
