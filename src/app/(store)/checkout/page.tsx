import type { Metadata } from "next";

import { CheckoutView } from "@/components/features/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Checkout — MONO",
};

const CheckoutPage = () => {
  return <CheckoutView />;
};

export default CheckoutPage;
