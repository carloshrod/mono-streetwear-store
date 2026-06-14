"use client";

import { useCallback, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, ChevronDown } from "lucide-react";

import type { Category, ProductGender } from "@/types/product";
import type { ProductSort } from "@/lib/services/products";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

interface ProductsFiltersProps {
  categories: Category[];
  activeCategory?: string;
  activeSearch?: string;
  activeSort: ProductSort;
  activeGender?: ProductGender;
}

export const ProductsFilters = ({
  categories,
  activeCategory,
  activeSearch,
  activeSort,
  activeGender,
}: ProductsFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Builds a URL preserving all active params, merging overrides
  const buildUrl = useCallback(
    (
      overrides: {
        category?: string | null;
        search?: string | null;
        sort?: ProductSort | null;
      } = {},
    ) => {
      const params = new URLSearchParams();
      const category =
        "category" in overrides ? overrides.category : activeCategory;
      const search = "search" in overrides ? overrides.search : activeSearch;
      const sort = "sort" in overrides ? overrides.sort : activeSort;
      if (activeGender) params.set("gender", activeGender);
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (sort && sort !== "recommended") params.set("sort", sort);
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, activeCategory, activeSearch, activeSort, activeGender],
  );

  const handleCategoryClick = (slug: string) => {
    startTransition(() => {
      router.push(
        buildUrl({ category: activeCategory === slug ? null : slug }),
      );
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => {
      router.push(buildUrl({ sort: e.target.value as ProductSort }));
    });
  };

  const handleClearAll = () => {
    // Preserve gender — only clear category / search / sort
    const params = new URLSearchParams();
    if (activeGender) params.set("gender", activeGender);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const hasActiveFilters = !!activeCategory || !!activeSearch;

  return (
    <div className="mb-10 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {/* Category chips */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`text-label px-3 py-1.5 border transition-colors ${
                  isActive
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="ml-2 flex items-center gap-1 text-label text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={13} strokeWidth={1.5} aria-hidden />
              Clear
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden sm:block text-label text-muted-foreground">
            Sort
          </span>
          <div className="relative">
            <select
              value={activeSort}
              onChange={handleSortChange}
              className="appearance-none pl-3 pr-8 py-1.5 text-label bg-transparent border border-border hover:border-foreground focus:outline-none focus:border-foreground transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              strokeWidth={1.5}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden
            />
          </div>
        </div>
      </div>

      {isPending && (
        <p className="text-label text-muted-foreground animate-pulse">
          Filtering…
        </p>
      )}
    </div>
  );
};
