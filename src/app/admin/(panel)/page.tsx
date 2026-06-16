import { getAdminStats, getAdminOrders } from "@/lib/services/admin.server";
import { StatsCards } from "@/components/features/admin/dashboard/stats-cards";
import { RecentOrders } from "@/components/features/admin/dashboard/recent-orders";

const AdminDashboardPage = async () => {
  const [stats, orders] = await Promise.all([
    getAdminStats(),
    getAdminOrders(8),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Overview of your store.
        </p>
      </div>

      <StatsCards data={stats} />

      <RecentOrders orders={orders} />
    </div>
  );
};

export default AdminDashboardPage;
