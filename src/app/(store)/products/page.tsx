import type { Metadata } from "next";

import { ProductsListing } from "@/components/features/products/products-listing";

export const metadata: Metadata = {
  title: "Shop — MONO",
  description: "Browse the full MONO collection of premium streetwear.",
};

const ProductsPage = () => {
  return (
    <div className="max-w-360 mx-auto px-6 py-12">
      <header className="flex flex-col gap-2 pb-10">
        <p className="text-label text-muted-foreground">Collection</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Shop All</h1>
      </header>

      <ProductsListing />
    </div>
  );
};

export default ProductsPage;
