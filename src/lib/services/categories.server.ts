import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/product";

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
  return (data ?? []) as Category[];
});

export type CategoryWithCover = Category & {
  coverImage: string | null;
  gender: "men" | "women";
};

/**
 * Fetches 2 random men + 2 random women categories, each with a cover image
 * sourced from a product of the matching gender — used for the landing page.
 */
export const getGenderedCategoryCovers = cache(async (): Promise<{
  women: CategoryWithCover[];
  men: CategoryWithCover[];
}> => {
  const supabase = await createClient();

  const [{ data: cats, error: catsError }, { data: products, error: prodsError }] =
    await Promise.all([
      supabase.from("categories").select("id, name, slug").order("name"),
      supabase
        .from("products")
        .select("category_id, images, gender")
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ]);

  if (catsError) throw new Error(`Failed to fetch categories: ${catsError.message}`);
  if (prodsError) throw new Error(`Failed to fetch category covers: ${prodsError.message}`);

  // First image seen per (gender, category_id).
  // Unisex products populate both men and women slots.
  const coverMap = new Map<string, string>();
  for (const p of products ?? []) {
    const slots = p.gender === "unisex" ? ["men", "women"] : [p.gender as string];
    for (const g of slots) {
      const key = `${g}:${p.category_id}`;
      if (!coverMap.has(key) && p.images?.[0]) {
        coverMap.set(key, p.images[0] as string);
      }
    }
  }

  const allCats = (cats ?? []) as Category[];

  const buildList = (gender: "men" | "women"): CategoryWithCover[] =>
    allCats
      .map((c) => ({
        ...c,
        gender,
        coverImage: coverMap.get(`${gender}:${c.id}`) ?? null,
      }))
      .filter((c) => c.coverImage !== null);

  // Shuffle and pick 2 per gender (random selection on each request)
  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  return {
    women: shuffle(buildList("women")).slice(0, 2),
    men: shuffle(buildList("men")).slice(0, 2),
  };
});
