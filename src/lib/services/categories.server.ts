import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/product";

export type CategoryWithCover = Category & {
  coverImage: string | null;
};

/**
 * Fetches all categories (ordered by name) with one representative product
 * image each — used for the landing page category grid.
 *
 * Two queries: categories first (stable ordering), then one product image
 * per category from the most recently created active products.
 */
export const getCategoriesWithCovers = cache(
  async (): Promise<CategoryWithCover[]> => {
    const supabase = await createClient();

    const [{ data: cats, error: catsError }, { data: products, error: prodsError }] =
      await Promise.all([
        supabase.from("categories").select("id, name, slug").order("name"),
        supabase
          .from("products")
          .select("category_id, images")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
      ]);

    if (catsError) throw new Error(`Failed to fetch categories: ${catsError.message}`);
    if (prodsError) throw new Error(`Failed to fetch category covers: ${prodsError.message}`);

    // First product image seen per category_id
    const coverMap = new Map<string, string>();
    for (const p of products ?? []) {
      if (!coverMap.has(p.category_id) && p.images?.[0]) {
        coverMap.set(p.category_id, p.images[0] as string);
      }
    }

    return (cats ?? []).map((c) => ({
      id: c.id as string,
      name: c.name as string,
      slug: c.slug as string,
      coverImage: coverMap.get(c.id as string) ?? null,
    }));
  },
);
