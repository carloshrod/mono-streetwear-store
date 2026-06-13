import { useQuery } from "@tanstack/react-query";

import {
  getProducts,
  getProductBySlug,
  type ProductFilters,
} from "@/lib/services/products";

/**
 * Centralized query keys — keeps cache invalidation consistent across the app.
 */
export const productKeys = {
  all: ["products"] as const,
  list: (filters: ProductFilters) => [...productKeys.all, "list", filters] as const,
  detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
};

export const useProducts = (filters: ProductFilters = {}) =>
  useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
  });

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  });
