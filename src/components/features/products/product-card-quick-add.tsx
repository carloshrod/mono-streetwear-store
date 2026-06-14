"use client";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useCartUI } from "@/store/cart-ui";
import type { Product, ProductVariant } from "@/types/product";

type ProductCardQuickAddProps = {
  product: Product;
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "OS"];

const sortBySize = (a: ProductVariant, b: ProductVariant) => {
  const ai = SIZE_ORDER.indexOf(a.size);
  const bi = SIZE_ORDER.indexOf(b.size);
  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
};

const chipClasses = (disabled: boolean) =>
  cn(
    "flex-1 min-w-9 h-9 px-2 flex items-center justify-center",
    "text-[0.7rem] font-medium uppercase tracking-[0.1em] transition-colors cursor-pointer border",
    "bg-background text-foreground hover:bg-foreground hover:text-background",
    disabled &&
      "opacity-40 cursor-not-allowed line-through hover:bg-background hover:text-foreground",
  );

export const ProductCardQuickAdd = ({ product }: ProductCardQuickAddProps) => {
  const variants = [...(product.variants ?? [])].sort(sortBySize);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartUI((s) => s.open);

  if (variants.length === 0) return null;

  const isSoldOut = variants.every((v) => v.stock === 0);

  const handleAdd = (variant: ProductVariant) => {
    if (variant.stock === 0) return;
    addItem(product, variant, 1);
    openCart();
  };

  if (isSoldOut) {
    return (
      <div className="flex h-11 w-full items-center justify-center bg-muted text-muted-foreground text-xs font-medium uppercase tracking-[0.15em]">
        Sold out
      </div>
    );
  }

  // Single variant (e.g. "One Size") — one full-width add button.
  if (variants.length === 1) {
    return (
      <button
        type="button"
        onClick={() => handleAdd(variants[0])}
        className="flex h-11 w-full items-center justify-center bg-foreground text-background text-xs font-medium uppercase tracking-[0.15em] hover:bg-foreground/80 transition-colors cursor-pointer"
      >
        Add to cart
      </button>
    );
  }

  return (
    <div className="bg-foreground p-1.5 flex flex-col gap-1.5">
      <span className="text-[0.65rem] text-background font-medium uppercase tracking-[0.15em] text-center">
        Add
      </span>
      <div className="flex gap-1">
        {variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            disabled={variant.stock === 0}
            onClick={() => handleAdd(variant)}
            aria-label={`Add size ${variant.size} to cart`}
            className={chipClasses(variant.stock === 0)}
          >
            {variant.size}
          </button>
        ))}
      </div>
    </div>
  );
};
