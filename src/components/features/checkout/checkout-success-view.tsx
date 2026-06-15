"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

import { useCartStore } from "@/store/cart";
import { buttonVariants } from "@/lib/button-variants";

type Props = {
  orderId: string | null;
};

export const CheckoutSuccessView = ({ orderId }: Props) => {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center flex flex-col items-center gap-6">
      <CheckCircle
        size={48}
        strokeWidth={1}
        className="text-foreground"
        aria-hidden
      />

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Order confirmed
        </h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. We&apos;ll send you shipping updates by
          email.
        </p>
      </div>

      {orderId && (
        <p className="text-xs text-muted-foreground font-mono border border-border px-4 py-2">
          Order #{orderId.slice(0, 8).toUpperCase()}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link href="/products" className={buttonVariants()}>
          Continue shopping
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to home
        </Link>
      </div>
    </div>
  );
};
