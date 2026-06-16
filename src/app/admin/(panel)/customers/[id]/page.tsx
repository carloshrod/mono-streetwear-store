import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminCustomerById } from "@/lib/services/admin.server";
import { CustomerOrders } from "@/components/features/admin/customers/customer-orders";
import { formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const AdminCustomerDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const customer = await getAdminCustomerById(id);

  if (!customer) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black transition-colors mb-3"
        >
          <ArrowLeft size={13} />
          Back to customers
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          {customer.full_name ?? "Customer"}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {customer.email ?? "Unknown email"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
            Joined
          </p>
          <p className="text-lg font-bold text-black">
            {new Date(customer.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
            Orders
          </p>
          <p className="text-lg font-bold text-black">{customer.ordersCount}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
            Total spent
          </p>
          <p className="text-lg font-bold text-black">
            {formatPrice(customer.totalSpent)}
          </p>
        </div>
      </div>

      {customer.phone && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
            Phone
          </p>
          <p className="text-sm text-black">{customer.phone}</p>
        </div>
      )}

      <CustomerOrders orders={customer.orders} />
    </div>
  );
};

export default AdminCustomerDetailPage;
