import { getAdminProducts } from "@/lib/services/admin.server";
import { ProductsTable } from "@/components/features/admin/products/products-table";

const AdminProductsPage = async () => {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Products
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your product catalog.
        </p>
      </div>
      <ProductsTable products={products} />
    </div>
  );
};

export default AdminProductsPage;
