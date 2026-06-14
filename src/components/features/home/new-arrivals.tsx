import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getFeaturedProducts } from "@/lib/services/products.server";
import { ProductCard } from "@/components/features/products/product-card";

export const NewArrivals = async () => {
  const products = await getFeaturedProducts(4);

  if (products.length === 0) return null;

  return (
    <section className="max-w-360 mx-auto px-6 py-20">
      {/* Section header */}
      <div className="flex items-end justify-between mb-10 pb-5 border-b border-border">
        <div>
          <p className="text-label text-muted-foreground mb-2">Just dropped</p>
          <h2 className="text-2xl font-bold tracking-tight">New Arrivals</h2>
        </div>
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-1.5 text-label text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>

      {/* Grid — reuses the same column structure as ProductGrid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 2} />
        ))}
      </div>

      {/* Mobile "view all" */}
      <div className="mt-10 flex justify-center sm:hidden">
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-label text-muted-foreground hover:text-foreground transition-colors"
        >
          View all products
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
};
