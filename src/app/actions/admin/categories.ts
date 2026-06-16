"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createServiceClient } from "@/lib/supabase/service";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export const createCategory = async (
  input: CategoryInput
): Promise<ActionResult<{ id: string }>> => {
  await requireAdmin();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("categories")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true, data: { id: data.id } };
};

export const updateCategory = async (
  id: string,
  input: CategoryInput
): Promise<ActionResult> => {
  await requireAdmin();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}/edit`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true, data: undefined };
};

export const deleteCategory = async (id: string): Promise<ActionResult> => {
  await requireAdmin();

  // products.category_id is ON DELETE SET NULL, so this is always safe —
  // affected products just lose their category, never blocked or cascaded.
  const supabase = createServiceClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true, data: undefined };
};
