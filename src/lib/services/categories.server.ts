import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { categoryCovers } from "@/lib/config/category-covers";
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
 * picked at random from the static config in `lib/config/category-covers.ts`
 * — used for the landing page.
 */
export const getGenderedCategoryCovers = cache(async (): Promise<{
  women: CategoryWithCover[];
  men: CategoryWithCover[];
}> => {
  const supabase = await createClient();

  const { data: cats, error: catsError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (catsError) throw new Error(`Failed to fetch categories: ${catsError.message}`);

  const allCats = (cats ?? []) as Category[];

  const pickRandom = (urls?: string[]): string | null =>
    urls && urls.length > 0 ? urls[Math.floor(Math.random() * urls.length)] : null;

  const buildList = (gender: "men" | "women"): CategoryWithCover[] =>
    allCats
      .map((c) => ({
        ...c,
        gender,
        coverImage: pickRandom(categoryCovers[c.slug]?.[gender]),
      }))
      .filter((c) => c.coverImage !== null);

  // Shuffle and pick 2 per gender (random selection on each request)
  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  return {
    women: shuffle(buildList("women")).slice(0, 2),
    men: shuffle(buildList("men")).slice(0, 2),
  };
});
