"use client";

import Image from "next/image";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { X, ShoppingBag, ImageOff } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useCartHydrated } from "@/hooks/use-cart-hydrated";
import {
  useCartStore,
  selectTotalItems,
  selectTotalPrice,
} from "@/store/cart";
import { useCartUI } from "@/store/cart-ui";
import type { CartItem } from "@/types/cart";

const DrawerLine = ({ item }: { item: CartItem }) => {
  const { product, variant, quantity } = item;
  const removeItem = useCartStore((s) => s.removeItem);
  const image = product.images[0] ?? null;

  return (
    <li className="flex gap-3 py-4">
      <Link
        href={`/products/${product.slug}`}
        className="relative shrink-0 w-16 aspect-3/4 bg-secondary overflow-hidden"
        aria-label={product.name}
      >
        {image ? (
          <Image src={image} alt={product.name} fill sizes="64px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageOff size={16} strokeWidth={1} />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-medium leading-snug hover:underline underline-offset-2"
          >
            {product.name}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(product.id, variant.id)}
            aria-label={`Remove ${product.name}`}
            className="shrink-0 size-6 -mr-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Size: {variant.size}</p>
        <div className="flex items-center justify-between mt-auto pt-2 text-sm">
          <span className="text-muted-foreground tabular-nums">
            {quantity} × {formatPrice(product.price)}
          </span>
          <span className="font-medium tabular-nums">
            {formatPrice(product.price * quantity)}
          </span>
        </div>
      </div>
    </li>
  );
};

export const CartDrawer = () => {
  const isOpen = useCartUI((s) => s.isOpen);
  const setOpen = useCartUI((s) => s.setOpen);

  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore(selectTotalItems);
  const subtotal = useCartStore(selectTotalPrice);

  const isEmpty = !hydrated || items.length === 0;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-[100] bg-black/50 transition-opacity duration-300",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed right-0 top-0 z-[100] flex h-dvh w-full max-w-md flex-col bg-background shadow-xl",
            "transition-transform duration-300 ease-out",
            "data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
            <Dialog.Title className="text-label">
              Cart {hydrated && totalItems > 0 ? `(${totalItems})` : ""}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close cart"
              className="size-9 -mr-2 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={18} strokeWidth={1.5} />
            </Dialog.Close>
          </div>

          {isEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
              <ShoppingBag size={36} strokeWidth={1} className="text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <p className="text-base font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">
                  Add some pieces to get started.
                </p>
              </div>
              <Dialog.Close
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Continue shopping
              </Dialog.Close>
            </div>
          ) : (
            <>
              {/* Items (scrollable) */}
              <ul className="flex-1 overflow-y-auto px-6 divide-y divide-border">
                {items.map((item) => (
                  <DrawerLine
                    key={`${item.product.id}-${item.variant.id}`}
                    item={item}
                  />
                ))}
              </ul>

              {/* Footer */}
              <div className="border-t border-border px-6 py-5 flex flex-col gap-4 shrink-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground -mt-2">
                  Shipping calculated at checkout.
                </p>

                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
                >
                  View cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ size: "lg" }), "w-full")}
                >
                  Checkout
                </Link>
              </div>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
