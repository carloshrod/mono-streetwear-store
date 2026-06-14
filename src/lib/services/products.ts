import { createClient } from "@/lib/supabase/client";
import { PRODUCT_SELECT, markIsNew } from "@/lib/services/product-select";
import type { Product } from "@/types/product";

export type ProductFilters = {
  categorySlug?: string;
  search?: string;
};

/**
 * Fetch active products for the storefront, newest first.
 * Throws on error so TanStack Query can surface it to the UI.
 */
export const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
  const supabase = createClient();

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters.categorySlug) {
    query = query.eq("category.slug", filters.categorySlug);
  }

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return ((data ?? []) as Product[]).map(markIsNew);
};

/**
 * Fetch a single active product by slug, or null if not found.
 */
export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch product "${slug}": ${error.message}`);
  }

  return (data as Product | null) ?? null;
};
