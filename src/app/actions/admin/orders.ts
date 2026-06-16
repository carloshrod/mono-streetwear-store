"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createServiceClient } from "@/lib/supabase/service";

const statusSchema = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export const updateOrderStatus = async (
  id: string,
  status: string
): Promise<ActionResult> => {
  await requireAdmin();

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) {
    return { success: false, error: "Invalid order status" };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");

  return { success: true, data: undefined };
};
