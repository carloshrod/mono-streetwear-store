import { getAdminCategories } from "@/lib/services/admin.server";
import { CategoriesTable } from "@/components/features/admin/categories/categories-table";

const AdminCategoriesPage = async () => {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Categories
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your product categories.
        </p>
      </div>
      <CategoriesTable categories={categories} />
    </div>
  );
};

export default AdminCategoriesPage;
