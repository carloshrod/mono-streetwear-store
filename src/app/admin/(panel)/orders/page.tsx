import { getAdminOrdersList } from "@/lib/services/admin.server";
import { OrdersTable } from "@/components/features/admin/orders/orders-table";

const AdminOrdersPage = async () => {
  const orders = await getAdminOrdersList();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Orders
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          View and manage customer orders.
        </p>
      </div>
      <OrdersTable orders={orders} />
    </div>
  );
};

export default AdminOrdersPage;
