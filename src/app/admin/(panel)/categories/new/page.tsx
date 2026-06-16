import { CategoryForm } from "@/components/features/admin/categories/category-form";

const AdminNewCategoryPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          New Category
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Add a new product category.
        </p>
      </div>
      <CategoryForm />
    </div>
  );
};

export default AdminNewCategoryPage;
