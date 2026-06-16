import type { Metadata } from "next";

import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { CheckoutView } from "@/components/features/checkout/checkout-view";
import { ContinueShopping } from "@/components/shared/continue-shopping";
import type { Address } from "@/types/user";

export const metadata: Metadata = {
  title: "Checkout — MONO",
};

const CheckoutPage = async () => {
  const user = await getUser();

  let savedAddress: Address | null = null;

  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("shipping_address")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data?.shipping_address) {
      savedAddress = data.shipping_address as Address;
    }
  }

  return (
    <>
      <CheckoutView savedAddress={savedAddress} />
      <ContinueShopping />
    </>
  );
};

export default CheckoutPage;
