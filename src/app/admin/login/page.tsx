import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminLoginForm } from "@/components/features/admin/login-form";

const AdminLoginPage = async () => {
  const user = await getUser();

  if (user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <p className="text-[11px] font-medium tracking-widest text-white/30 uppercase mb-1">
            MONO
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Admin access
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Sign in with your admin credentials.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
};

export default AdminLoginPage;
