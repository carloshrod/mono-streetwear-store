import { getAdminCustomers } from "@/lib/services/admin.server";
import { CustomersTable } from "@/components/features/admin/customers/customers-table";

const AdminCustomersPage = async () => {
  const customers = await getAdminCustomers();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Customers
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          View your customers and their order history.
        </p>
      </div>
      <CustomersTable customers={customers} />
    </div>
  );
};

export default AdminCustomersPage;
