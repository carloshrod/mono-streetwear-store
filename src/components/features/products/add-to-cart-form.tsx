"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { Product, ProductVariant } from "@/types/product";

type AddToCartFormProps = {
  product: Product;
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "OS"];

const sortBySize = (a: ProductVariant, b: ProductVariant) => {
  const ai = SIZE_ORDER.indexOf(a.size);
  const bi = SIZE_ORDER.indexOf(b.size);
  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
};

export const AddToCartForm = ({ product }: AddToCartFormProps) => {
  const variants = [...(product.variants ?? [])].sort(sortBySize);
  const addItem = useCartStore((state) => state.addItem);

  // Auto-select when there is only one variant (e.g. "One Size" accessories).
  const [selectedId, setSelectedId] = useState<string | null>(
    variants.length === 1 ? variants[0].id : null
  );
  const [justAdded, setJustAdded] = useState(false);

  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const isSoldOut = variants.length > 0 && variants.every((v) => v.stock === 0);

  const handleAddToCart = () => {
    if (!selected || selected.stock === 0) return;
    addItem(product, selected, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  };

  const buttonLabel = () => {
    if (justAdded) return (<><Check /> Added to cart</>);
    if (isSoldOut) return "Sold out";
    if (!selected) return "Select a size";
    return (<><ShoppingBag /> Add to cart</>);
  };

  return (
    <div className="flex flex-col gap-6">
      {variants.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-label text-muted-foreground">Size</span>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const disabled = variant.stock === 0;
              const isSelected = variant.id === selectedId;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedId(variant.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "min-w-12 h-11 px-4 border text-xs font-medium uppercase tracking-[0.1em] transition-colors cursor-pointer",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground",
                    disabled &&
                      "opacity-40 cursor-not-allowed line-through hover:border-border"
                  )}
                >
                  {variant.size}
                </button>
              );
            })}
          </div>
          {selected && selected.stock > 0 && selected.stock <= 5 && (
            <p className="text-xs text-muted-foreground">
              Only {selected.stock} left in stock
            </p>
          )}
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={isSoldOut || !selected}
      >
        {buttonLabel()}
      </Button>
    </div>
  );
};
