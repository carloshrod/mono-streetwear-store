import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { PRODUCT_SELECT, markIsNew } from "@/lib/services/product-select";
import type { Product } from "@/types/product";

/**
 * Server-side single-product fetch for the detail page.
 *
 * Wrapped in React `cache()` so that `generateMetadata` and the page component
 * share a single database round-trip per request.
 */
export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    const supabase = await createClient();

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
  }
);

export const getFeaturedProducts = cache(
  async (limit = 4): Promise<Product[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch featured products: ${error.message}`);
    }

    return ((data ?? []) as Product[]).map(markIsNew);
  }
);
