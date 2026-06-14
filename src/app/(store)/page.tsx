import type { Metadata } from "next";
import { Suspense } from "react";

import { Hero } from "@/components/features/home/hero";
import { NewArrivals } from "@/components/features/home/new-arrivals";
import { CategoriesSection } from "@/components/features/home/categories-section";
import { BrandSection } from "@/components/features/home/brand-section";
import { ProductGrid } from "@/components/features/products/product-grid";

export const metadata: Metadata = {
  title: "MONO — Premium Streetwear",
  description:
    "Curated streetwear for those who move with intention. Premium pieces, zero compromise.",
};

const StorePage = () => {
  return (
    <>
      <Hero />

      <Suspense
        fallback={
          <div className="max-w-360 mx-auto px-6 py-20">
            <ProductGrid products={undefined} isLoading isError={false} />
          </div>
        }
      >
        <NewArrivals />
      </Suspense>

      <Suspense fallback={null}>
        <CategoriesSection />
      </Suspense>

      <BrandSection />
    </>
  );
};

export default StorePage;
