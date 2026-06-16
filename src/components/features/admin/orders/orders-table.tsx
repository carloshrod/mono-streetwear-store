import Link from "next/link";
import { Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "./order-status-select";
import type { AdminOrder } from "@/lib/services/admin.server";

export const OrdersTable = ({ orders }: { orders: AdminOrder[] }) => (
  <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
    <div className="px-6 py-4 border-b border-neutral-200">
      <h2 className="text-sm font-semibold text-black">
        All Orders{" "}
        <span className="font-normal text-neutral-400">({orders.length})</span>
      </h2>
    </div>

    {orders.length === 0 ? (
      <p className="px-6 py-16 text-center text-sm text-neutral-400">
        No orders yet.
      </p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-6 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                Order
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                Customer
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                Date
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                Items
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                Shipping
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                Total
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-6 py-3">
                  <span className="font-mono text-xs font-medium text-black">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-black leading-tight">
                    {o.customer.full_name ?? o.shipping_address.full_name}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {o.customer.email ?? "Unknown email"}
                  </p>
                </td>
                <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                  {new Date(o.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {o.items?.length ?? 0}
                </td>
                <td className="px-4 py-3 text-neutral-600 tabular-nums">
                  {o.shipping_amount === 0 ? "Free" : formatPrice(o.shipping_amount)}
                </td>
                <td className="px-4 py-3 font-semibold tabular-nums text-black">
                  {formatPrice(o.total_amount)}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors inline-flex"
                    title="View order"
                  >
                    <Eye size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
