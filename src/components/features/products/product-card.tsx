"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export const ProductCard = ({ product, priority = false }: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);

  const image = product.images[0] ?? null;
  const secondImage = product.images[1] ?? null;
  const isNew =
    Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000;

  return (
    <article
      className="group relative flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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
                "object-cover transition-all duration-500",
                secondImage && hovered ? "opacity-0" : "opacity-100"
              )}
              priority={priority}
            />
            {secondImage && (
              <Image
                src={secondImage}
                alt={`${product.name} — alternate view`}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                className={cn(
                  "object-cover transition-all duration-500",
                  hovered ? "opacity-100" : "opacity-0"
                )}
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

        {/* Quick view overlay — visual affordance only (pointer-events-none),
            navigation is handled by the stretched link above. */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-20 p-3 transition-all duration-200 pointer-events-none",
            hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
          aria-hidden
        >
          <span className="flex h-11 w-full items-center justify-center bg-foreground text-background text-xs font-medium uppercase tracking-[0.15em]">
            Quick View
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 pt-3">
        {product.category && (
          <p className="text-label text-muted-foreground">{product.category.name}</p>
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
