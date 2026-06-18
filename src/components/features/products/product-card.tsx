"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";
import { ProductCardQuickAdd } from "@/components/features/products/product-card-quick-add";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export const ProductCard = ({
  product,
  priority = false,
}: ProductCardProps) => {
  const image = product.images[0] ?? null;
  const secondImage = product.images[1] ?? null;
  const isNew = product.isNew ?? false;

  return (
    <article className="group relative flex flex-col">
      {/* Image container — uses a stretched link (below) for navigation so no
          anchor is nested inside another anchor. */}
      <div className="relative aspect-3/4 overflow-hidden bg-secondary">
        {image ? (
          <>
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              className={cn(
                "object-cover transition-opacity duration-500",
                secondImage && "group-hover:opacity-0",
              )}
              priority={priority}
            />
            {secondImage && (
              <Image
                src={secondImage}
                alt={`${product.name} — alternate view`}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ShoppingBag size={32} strokeWidth={1} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="text-label bg-foreground text-background px-2 py-1">
              New
            </span>
          )}
          {product.status === "draft" && (
            <span className="text-label bg-muted text-muted-foreground px-2 py-1">
              Draft
            </span>
          )}
        </div>

        {/* Stretched link — makes the whole image clickable without nesting
            anchors. Hidden from tab order; the title link below is the focus stop. */}
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 z-10"
          tabIndex={-1}
          aria-hidden
        />

        {/* Quick-add overlay — sits above the stretched link (z-20) so its
            buttons receive clicks instead of navigating. Revealed on hover or
            keyboard focus; always shown on touch devices (no hover). */}
        <div
          className={cn(
            "hidden lg:block",
            "absolute inset-x-0 bottom-0 z-20 p-3 transition-all duration-200",
            "opacity-0 translate-y-2",
            "group-hover:opacity-100 group-hover:translate-y-0",
            "focus-within:opacity-100 focus-within:translate-y-0",
            "[@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0",
          )}
        >
          <ProductCardQuickAdd product={product} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 pt-3">
        {product.category && (
          <p className="text-label text-muted-foreground">
            {product.category.name}
          </p>
        )}

        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium leading-snug hover:underline underline-offset-2 line-clamp-2"
        >
          {product.name}
        </Link>

        <p className="text-sm text-foreground font-medium tabular-nums">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
};
