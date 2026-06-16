import { Toaster } from "sonner";
import { requireAdmin } from "@/lib/supabase/auth";
import { AdminSidebar } from "@/components/features/admin/sidebar";

const AdminPanelLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar />
      <main className="flex-1 ml-60 p-8 min-h-screen">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
};

export default AdminPanelLayout;
