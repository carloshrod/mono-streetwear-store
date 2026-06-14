import type { Metadata } from "next";

import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { AccountView } from "@/components/features/account/account-view";

export const metadata: Metadata = {
  title: "My Account — MONO",
};

const AccountPage = async () => {
  const user = await requireAuth();
  const supabase = await createClient();

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single(),
    supabase
      .from("orders")
      .select("id, status, total_amount, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <AccountView user={user} profile={profile} orders={orders ?? []} />
  );
};

export default AccountPage;
