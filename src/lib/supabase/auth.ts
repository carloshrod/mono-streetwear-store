import { redirect } from "next/navigation";
import { createClient } from "./server";

/**
 * Returns the authenticated user from the server session, or null.
 * Always uses getUser() (not getSession()) so the JWT is validated server-side.
 */
export const getUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

/**
 * Use inside Server Components or Route Handlers that require authentication.
 * Redirects to /login if no valid session exists.
 */
export const requireAuth = async () => {
  const user = await getUser();
  // ?signin=1 tells the store layout to auto-open the auth modal
  if (!user) redirect("/?signin=1");
  return user;
};

/**
 * Use inside Server Components or Route Handlers that require admin access.
 * Extend this with your own role check (e.g. a `profiles` table with a `role` column).
 */
export const requireAdmin = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return user;
};
