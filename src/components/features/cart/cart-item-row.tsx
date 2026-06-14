"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ImageOff } from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { CartItem } from "@/types/cart";

type CartItemRowProps = {
  item: CartItem;
};

export const CartItemRow = ({ item }: CartItemRowProps) => {
  const { product, variant, quantity } = item;
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const image = product.images[0] ?? null;
  const atMaxStock = quantity >= variant.stock;
  const lineTotal = product.price * quantity;

  return (
    <li className="flex gap-4 py-6">
      {/* Thumbnail */}
      <Link
        href={`/products/${product.slug}`}
        className="relative shrink-0 w-24 aspect-3/4 bg-secondary overflow-hidden"
        aria-label={product.name}
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageOff size={20} strokeWidth={1} />
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-4">
          <div className="flex flex-col gap-1">
            {product.category && (
              <p className="text-label text-muted-foreground">
                {product.category.name}
              </p>
            )}
            <Link
              href={`/products/${product.slug}`}
              className="text-sm font-medium leading-snug hover:underline underline-offset-2"
            >
              {product.name}
            </Link>
            <p className="text-xs text-muted-foreground">Size: {variant.size}</p>
          </div>

          <button
            type="button"
            onClick={() => removeItem(product.id, variant.id)}
            aria-label={`Remove ${product.name} from cart`}
            className="size-8 -mt-1 -mr-2 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Quantity stepper + line total */}
        <div className="flex items-end justify-between mt-auto pt-4">
          <div className="flex items-center border border-border">
            <button
              type="button"
              onClick={() => updateQuantity(product.id, variant.id, quantity - 1)}
              aria-label="Decrease quantity"
              className="size-9 flex items-center justify-center text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <Minus size={14} strokeWidth={1.5} />
            </button>
            <span
              className="w-9 text-center text-sm tabular-nums select-none"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              disabled={atMaxStock}
              onClick={() => updateQuantity(product.id, variant.id, quantity + 1)}
              aria-label="Increase quantity"
              className={cn(
                "size-9 flex items-center justify-center text-foreground hover:bg-secondary transition-colors cursor-pointer",
                atMaxStock && "opacity-30 cursor-not-allowed hover:bg-transparent"
              )}
            >
              <Plus size={14} strokeWidth={1.5} />
            </button>
          </div>

          <p className="text-sm font-medium tabular-nums">
            {formatPrice(lineTotal)}
          </p>
        </div>

        {atMaxStock && (
          <p className="text-xs text-muted-foreground pt-2 text-right">
            Max available reached
          </p>
        )}
      </div>
    </li>
  );
};
