import Image from "next/image";
import { ShoppingBag } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { calculateShipping, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/types/cart";

type OrderSummaryProps = {
  items: CartItem[];
  total: number;
  isSubmitting?: boolean;
};

export const OrderSummary = ({ items, total, isSubmitting }: OrderSummaryProps) => {
  const shipping = calculateShipping(total);
  const grandTotal = total + shipping;
  const remaining = FREE_SHIPPING_THRESHOLD - total;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-label text-muted-foreground">Order summary</h2>

      <ul className="flex flex-col divide-y divide-border">
        {items.map((item) => {
          const image = item.product.images[0] ?? null;
          return (
            <li
              key={`${item.product.id}-${item.variant.id}`}
              className="flex gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="relative size-16 shrink-0 overflow-hidden bg-secondary">
                {image ? (
                  <Image
                    src={image}
                    alt={item.product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <ShoppingBag size={20} strokeWidth={1} />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-sm font-medium leading-snug">
                  {item.product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.variant.size} · Qty {item.quantity}
                </p>
              </div>

              <p className="text-sm font-medium tabular-nums shrink-0">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-border pt-4 flex flex-col gap-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Shipping</span>
          <span className="tabular-nums">
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-muted-foreground">
            Add {formatPrice(remaining)} more for free shipping
          </p>
        )}
        <div className="flex justify-between text-base font-semibold mt-2 pt-2 border-t border-border">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {isSubmitting !== undefined && (
        <Button
          type="submit"
          form="checkout-form"
          className="w-full h-12 mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Redirecting to payment…" : "Proceed to payment"}
        </Button>
      )}
    </div>
  );
};
