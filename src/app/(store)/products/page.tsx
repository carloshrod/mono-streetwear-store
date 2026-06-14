import type { Metadata } from "next";

import { ProductsListing } from "@/components/features/products/products-listing";
import { ProductsFilters } from "@/components/features/products/products-filters";
import { getCategories } from "@/lib/services/categories.server";
import type { ProductGender } from "@/types/product";
import type { ProductSort } from "@/lib/services/products";

type SearchParams = Promise<{
  category?: string;
  search?: string;
  sort?: string;
  gender?: string;
}>;

const VALID_SORTS: ProductSort[] = ["recommended", "newest", "price_asc", "price_desc"];
const VALID_GENDERS: ProductGender[] = ["men", "women", "unisex"];

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> => {
  const { category, search, gender } = await searchParams;
  const activeGender = VALID_GENDERS.includes(gender as ProductGender)
    ? (gender as ProductGender)
    : undefined;

  let title = "Shop — MONO";

  if (search) {
    title = `"${search}" — MONO`;
  } else if (activeGender) {
    if (category) {
      const categories = await getCategories();
      const cat = categories.find((c) => c.slug === category);
      title = cat
        ? `${cat.name} · ${activeGender === "men" ? "Men" : "Women"} — MONO`
        : `${activeGender === "men" ? "Men" : "Women"} — MONO`;
    } else {
      title = `${activeGender === "men" ? "Men" : "Women"} — MONO`;
    }
  }

  return {
    title,
    description: "Browse the full MONO collection of premium streetwear.",
  };
};

const ProductsPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const { category, search, sort: rawSort, gender: rawGender } = await searchParams;
  const categories = await getCategories();

  const sort: ProductSort = VALID_SORTS.includes(rawSort as ProductSort)
    ? (rawSort as ProductSort)
    : "recommended";

  const activeGender: ProductGender | undefined = VALID_GENDERS.includes(
    rawGender as ProductGender,
  )
    ? (rawGender as ProductGender)
    : undefined;

  const activeCategoryObj = categories.find((c) => c.slug === category);

  // Heading logic per spec
  let eyebrow: string;
  let heading: string;

  if (search) {
    eyebrow = "Search results";
    heading = `"${search}"`;
  } else if (activeGender) {
    const genderLabel = activeGender === "men" ? "Men" : "Women";
    eyebrow = activeCategoryObj ? `${activeCategoryObj.name} for` : "Collection";
    heading = genderLabel;
  } else {
    eyebrow = "Collection";
    heading = "Shop All";
  }

  const filters = { categorySlug: category, search, sort, gender: activeGender };

  return (
    <div className="max-w-360 mx-auto px-6 py-12">
      <header className="flex flex-col gap-2 pb-10">
        <p className="text-label text-muted-foreground">{eyebrow}</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{heading}</h1>
      </header>

      <ProductsFilters
        categories={categories}
        activeCategory={category}
        activeSearch={search}
        activeSort={sort}
        activeGender={activeGender}
      />

      <ProductsListing filters={filters} />
    </div>
  );
};

export default ProductsPage;
