import { getCategories } from "@/lib/services/categories.server";
import { ProductForm } from "@/components/features/admin/products/product-form";

const AdminNewProductPage = async () => {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          New Product
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Fill in the details to add a new product.
        </p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
};

export default AdminNewProductPage;
