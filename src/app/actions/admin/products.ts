"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createServiceClient } from "@/lib/supabase/service";

const variantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"), // in cents
  category_id: z.string().uuid("Invalid category"),
  gender: z.enum(["men", "women", "unisex"]),
  status: z.enum(["active", "draft", "archived"]),
  images: z
    .array(z.string())
    .min(2, "At least 2 images are required")
    .max(5, "A maximum of 5 images is allowed"),
  variants: z
    .array(variantSchema)
    .min(1, "At least one size variant is required")
    .refine(
      (variants) => new Set(variants.map((v) => v.size)).size === variants.length,
      { message: "Duplicate sizes are not allowed" }
    ),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export const createProduct = async (
  input: ProductInput
): Promise<ActionResult<{ id: string }>> => {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { variants, ...productData } = parsed.data;
  const supabase = createServiceClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert(productData)
    .select("id")
    .single();

  if (productError) {
    return { success: false, error: productError.message };
  }

  const { error: variantError } = await supabase
    .from("product_variants")
    .insert(variants.map((v) => ({ ...v, product_id: product.id })));

  if (variantError) {
    await supabase.from("products").delete().eq("id", product.id);
    return { success: false, error: variantError.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true, data: { id: product.id } };
};

export const updateProduct = async (
  id: string,
  input: ProductInput
): Promise<ActionResult> => {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { variants, ...productData } = parsed.data;
  const supabase = createServiceClient();

  const { error: productError } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id);

  if (productError) {
    return { success: false, error: productError.message };
  }

  // Sync variants without a blanket delete: order_items.variant_id has an
  // ON DELETE RESTRICT FK to product_variants, so wiping and re-inserting
  // would fail (and previously failed silently) whenever a size had order
  // history. Instead: only delete sizes that are safe to remove, and
  // upsert the rest (insert new sizes, update stock on existing ones).
  const { data: existing, error: existingError } = await supabase
    .from("product_variants")
    .select("id, size")
    .eq("product_id", id);

  if (existingError) {
    return { success: false, error: existingError.message };
  }

  const newSizes = new Set(variants.map((v) => v.size));
  const toRemove = (existing ?? []).filter((v) => !newSizes.has(v.size));

  if (toRemove.length > 0) {
    const { data: referenced } = await supabase
      .from("order_items")
      .select("variant_id")
      .in(
        "variant_id",
        toRemove.map((v) => v.id)
      );

    const referencedIds = new Set((referenced ?? []).map((r) => r.variant_id));
    const blocked = toRemove.filter((v) => referencedIds.has(v.id));

    if (blocked.length > 0) {
      return {
        success: false,
        error: `Cannot remove size${blocked.length > 1 ? "s" : ""} ${blocked
          .map((v) => v.size)
          .join(", ")} — already used in existing orders.`,
      };
    }

    const { error: deleteError } = await supabase
      .from("product_variants")
      .delete()
      .in(
        "id",
        toRemove.map((v) => v.id)
      );

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }
  }

  const { error: upsertError } = await supabase
    .from("product_variants")
    .upsert(
      variants.map((v) => ({ ...v, product_id: id })),
      { onConflict: "product_id,size" }
    );

  if (upsertError) {
    return { success: false, error: upsertError.message };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true, data: undefined };
};

export const deleteProduct = async (id: string): Promise<ActionResult> => {
  await requireAdmin();

  const supabase = createServiceClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true, data: undefined };
};

export const uploadProductImage = async (
  formData: FormData
): Promise<ActionResult<{ url: string }>> => {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided" };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createServiceClient();

  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(path, buffer, { contentType: file.type });

  if (error) return { success: false, error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(data.path);

  return { success: true, data: { url: publicUrl } };
};
