"use client";

import { PackageOpen, AlertCircle } from "lucide-react";

import { ProductCard } from "@/components/features/products/product-card";
import { ProductCardSkeleton } from "@/components/features/products/product-card-skeleton";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

type ProductGridProps = {
  products: Product[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
};

const GRID_CLASSES =
  "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10";

const SKELETON_COUNT = 8;

export const ProductGrid = ({
  products,
  isLoading,
  isError,
  onRetry,
}: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className={GRID_CLASSES}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <AlertCircle size={32} strokeWidth={1.5} className="text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Something went wrong</p>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load the products. Please try again.
          </p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <PackageOpen size={32} strokeWidth={1.5} className="text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">No products found</p>
          <p className="text-sm text-muted-foreground">
            Check back soon — new drops are on the way.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={GRID_CLASSES}>
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
};
