import { notFound } from "next/navigation";
import { getAdminProductById } from "@/lib/services/admin.server";
import { getCategories } from "@/lib/services/categories.server";
import { ProductForm } from "@/components/features/admin/products/product-form";

type Props = { params: Promise<{ id: string }> };

const AdminEditProductPage = async ({ params }: Props) => {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Edit Product
        </h1>
        <p className="text-sm text-neutral-500 mt-1">{product.name}</p>
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
};

export default AdminEditProductPage;
