"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartHydrated } from "@/hooks/use-cart-hydrated";
import { useCartStore, selectTotalItems } from "@/store/cart";
import { CartItemRow } from "@/components/features/cart/cart-item-row";
import { CartSummary } from "@/components/features/cart/cart-summary";

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
    <ShoppingBag size={40} strokeWidth={1} className="text-muted-foreground" />
    <div className="flex flex-col gap-1">
      <p className="text-base font-medium">Your cart is empty</p>
      <p className="text-sm text-muted-foreground">
        Add some pieces to get started.
      </p>
    </div>
    <Link href="/products" className={cn(buttonVariants({ size: "lg" }))}>
      Shop all
    </Link>
  </div>
);

export const CartView = () => {
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore(selectTotalItems);
  const clearCart = useCartStore((s) => s.clearCart);

  // Wait for localStorage rehydration so SSR and first client render agree.
  if (!hydrated) {
    return <div className="py-24" aria-hidden />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
      {/* Items */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <p className="text-label text-muted-foreground">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
          <button
            type="button"
            onClick={clearCart}
            className="text-label text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Clear all
          </button>
        </div>

        <ul className="divide-y divide-border">
          {items.map((item) => (
            <CartItemRow
              key={`${item.product.id}-${item.variant.id}`}
              item={item}
            />
          ))}
        </ul>
      </div>

      {/* Summary */}
      <CartSummary />
    </div>
  );
};
