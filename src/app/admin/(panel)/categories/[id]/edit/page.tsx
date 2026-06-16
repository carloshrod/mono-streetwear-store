import { notFound } from "next/navigation";
import { getAdminCategoryById } from "@/lib/services/admin.server";
import { CategoryForm } from "@/components/features/admin/categories/category-form";

type Props = { params: Promise<{ id: string }> };

const AdminEditCategoryPage = async ({ params }: Props) => {
  const { id } = await params;
  const category = await getAdminCategoryById(id);

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Edit Category
        </h1>
        <p className="text-sm text-neutral-500 mt-1">{category.name}</p>
      </div>
      <CategoryForm category={category} />
    </div>
  );
};

export default AdminEditCategoryPage;
