"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore, selectTotalItems, selectTotalPrice } from "@/store/cart";

export const CartSummary = () => {
  const subtotal = useCartStore(selectTotalPrice);
  const count = useCartStore(selectTotalItems);

  return (
    <aside className="lg:sticky lg:top-24 h-fit border border-border p-6 flex flex-col gap-6">
      <h2 className="text-label text-muted-foreground">Order Summary</h2>

      <div className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Subtotal ({count} {count === 1 ? "item" : "items"})
          </span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">Calculated at checkout</span>
        </div>
      </div>

      <div className="flex justify-between border-t border-border pt-4 text-base font-medium">
        <span>Total</span>
        <span className="tabular-nums">{formatPrice(subtotal)}</span>
      </div>

      <Link
        href="/checkout"
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        Checkout
      </Link>

      <Link
        href="/products"
        className="text-label text-muted-foreground hover:text-foreground text-center transition-colors"
      >
        Continue shopping
      </Link>
    </aside>
  );
};
