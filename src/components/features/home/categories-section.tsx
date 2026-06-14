import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  getGenderedCategoryCovers,
  type CategoryWithCover,
} from "@/lib/services/categories.server";

const CategoryCard = ({ category }: { category: CategoryWithCover }) => (
  <Link
    href={`/products?gender=${category.gender}&category=${category.slug}`}
    className="group relative block aspect-square overflow-hidden bg-secondary"
    aria-label={`Shop ${category.name}`}
  >
    {category.coverImage ? (
      <Image
        src={category.coverImage}
        alt={category.name}
        fill
        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    ) : (
      <div className="absolute inset-0 bg-secondary" />
    )}

    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

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

const GenderRow = ({
  label,
  gender,
  categories,
}: {
  label: string;
  gender: "men" | "women";
  categories: CategoryWithCover[];
}) => {
  if (categories.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-label text-muted-foreground">{label}</p>
        <Link
          href={`/products?gender=${gender}`}
          className="text-label text-muted-foreground hover:text-foreground transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <CategoryCard key={`${gender}-${category.id}`} category={category} />
        ))}
      </div>
    </div>
  );
};

export const CategoriesSection = async () => {
  const { women, men } = await getGenderedCategoryCovers();

  if (women.length === 0 && men.length === 0) return null;

  return (
    <section className="max-w-360 mx-auto px-6 py-20">
      <div className="mb-10 pb-5 border-b border-border">
        <p className="text-label text-muted-foreground mb-2">Explore</p>
        <h2 className="text-2xl font-bold tracking-tight">Shop by Category</h2>
      </div>

      <div className="flex flex-col gap-12">
        <GenderRow label="Women" gender="women" categories={women} />
        <GenderRow label="Men" gender="men" categories={men} />
      </div>
    </section>
  );
};
