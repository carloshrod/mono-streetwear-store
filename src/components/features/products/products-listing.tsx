"use client";

import { useProducts } from "@/hooks/use-products";
import { ProductGrid } from "@/components/features/products/product-grid";

/**
 * Client boundary for the products listing — owns the TanStack Query call
 * and hands state to the presentational ProductGrid.
 */
export const ProductsListing = () => {
  const { data, isLoading, isError, refetch } = useProducts();

  return (
    <ProductGrid
      products={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    />
  );
};
