"use client";

import { useProducts } from "@/hooks/use-products";
import { ProductGrid } from "@/components/features/products/product-grid";
import type { ProductFilters } from "@/lib/services/products";

interface ProductsListingProps {
  filters?: ProductFilters;
}

export const ProductsListing = ({ filters = {} }: ProductsListingProps) => {
  const { data, isLoading, isError, refetch } = useProducts(filters);

  return (
    <ProductGrid
      products={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    />
  );
};
