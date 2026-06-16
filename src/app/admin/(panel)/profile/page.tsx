import { getUser } from "@/lib/supabase/auth";
import { ProfileForm } from "@/components/features/admin/profile/profile-form";

const AdminProfilePage = async () => {
  const user = await getUser();

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Profile
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your admin account credentials.
        </p>
      </div>

      <ProfileForm currentEmail={user?.email ?? ""} />
    </div>
  );
};

export default AdminProfilePage;
