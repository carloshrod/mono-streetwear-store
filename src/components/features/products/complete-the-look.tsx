import { getComplementaryProducts } from "@/lib/services/products.server";
import { ProductCard } from "@/components/features/products/product-card";
import type { Product } from "@/types/product";

type CompleteTheLookProps = {
  product: Product;
};

export const CompleteTheLook = async ({ product }: CompleteTheLookProps) => {
  const products = await getComplementaryProducts(product.category_id, product.gender);

  if (products.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-border">
      <h2 className="text-xl font-bold tracking-tight mb-8">Complete the look</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};
