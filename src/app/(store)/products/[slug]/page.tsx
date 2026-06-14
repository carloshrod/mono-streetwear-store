import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductBySlug } from "@/lib/services/products.server";
import { ProductGallery } from "@/components/features/products/product-gallery";
import { AddToCartForm } from "@/components/features/products/add-to-cart-form";
import { formatPrice } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
  params,
}: ProductPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found — MONO" };
  }

  return {
    title: `${product.name} — MONO`,
    description: product.description || `Shop ${product.name} at MONO.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
};

const ProductPage = async ({ params }: ProductPageProps) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-360 mx-auto px-6 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="pb-8">
        <ol className="flex items-center gap-2 text-label text-muted-foreground">
          <li>
            <Link href="/products" className="hover:text-foreground transition-colors">
              Shop
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Details */}
        <div className="flex flex-col md:py-2">
          {product.category && (
            <p className="text-label text-muted-foreground">
              {product.category.name}
            </p>
          )}

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2">
            {product.name}
          </h1>

          <p className="text-lg mt-4 tabular-nums">
            {formatPrice(product.price)}
          </p>

          <div className="mt-8">
            <AddToCartForm product={product} />
          </div>

          {product.description && (
            <section className="mt-10 border-t border-border pt-8">
              <h2 className="text-label text-muted-foreground mb-3">Description</h2>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                {product.description}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
