"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/auth";
import { createServiceClient } from "@/lib/supabase/service";

const emailSchema = z.string().email("Enter a valid email");

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Updates the admin's email directly via the Supabase admin API.
 * Skips Supabase's "secure email change" confirmation flow (which requires
 * confirming both old and new addresses) — the caller is already
 * authenticated as admin and re-verified their password client-side.
 */
export const updateAdminEmail = async (newEmail: string): Promise<ActionResult> => {
  const user = await requireAdmin();

  const parsed = emailSchema.safeParse(newEmail);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    email: parsed.data,
    email_confirm: true,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
};
