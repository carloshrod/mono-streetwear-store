import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getCategoriesWithCovers, type CategoryWithCover } from "@/lib/services/categories.server";

const CategoryCard = ({ category }: { category: CategoryWithCover }) => (
  <Link
    href={`/products?category=${category.slug}`}
    className="group relative block aspect-square overflow-hidden bg-secondary"
    aria-label={`Shop ${category.name}`}
  >
    {/* Cover image */}
    {category.coverImage ? (
      <Image
        src={category.coverImage}
        alt={category.name}
        fill
        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 33vw, 50vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    ) : (
      <div className="absolute inset-0 bg-secondary" />
    )}

    {/* Gradient overlay — deepens on hover */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

    {/* Label */}
    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
      <p className="text-label text-white">{category.name}</p>
      <ArrowUpRight
        size={16}
        strokeWidth={1.5}
        className="text-white/70 transition-all duration-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
    </div>
  </Link>
);

export const CategoriesSection = async () => {
  const categories = await getCategoriesWithCovers();

  if (categories.length === 0) return null;

  return (
    <section className="max-w-360 mx-auto px-6 py-20">
      {/* Header */}
      <div className="mb-10 pb-5 border-b border-border">
        <p className="text-label text-muted-foreground mb-2">Explore</p>
        <h2 className="text-2xl font-bold tracking-tight">Shop by Category</h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
};
