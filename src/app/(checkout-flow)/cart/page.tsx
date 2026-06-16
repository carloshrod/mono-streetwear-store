import type { Metadata } from "next";

import { CartView } from "@/components/features/cart/cart-view";
import { ContinueShopping } from "@/components/shared/continue-shopping";

export const metadata: Metadata = {
  title: "Cart — MONO",
  description: "Review the items in your shopping bag.",
};

const CartPage = () => (
  <>
    <div className="max-w-360 mx-auto px-6 py-12">
      <header className="pb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Cart</h1>
      </header>
      <CartView />
    </div>
    <ContinueShopping />
  </>
);

export default CartPage;
