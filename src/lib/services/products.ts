import { createClient } from "@/lib/supabase/client";
import { PRODUCT_SELECT, markIsNew } from "@/lib/services/product-select";
import type { Product, ProductGender } from "@/types/product";

export type ProductSort = "recommended" | "newest" | "price_asc" | "price_desc";

export type ProductFilters = {
  categorySlug?: string;
  search?: string;
  sort?: ProductSort;
  gender?: ProductGender;
};

export const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
  const supabase = createClient();

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active");

  if (filters.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (filters.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Resolve slug → category_id before filtering — PostgREST alias dot-notation is unreliable
  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();

    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }

  // Men/women pages include unisex products; unisex-only filter stays exact
  if (filters.gender === "men") {
    query = query.in("gender", ["men", "unisex"]);
  } else if (filters.gender === "women") {
    query = query.in("gender", ["women", "unisex"]);
  } else if (filters.gender) {
    query = query.eq("gender", filters.gender);
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
