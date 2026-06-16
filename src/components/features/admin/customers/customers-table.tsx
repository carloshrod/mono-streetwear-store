import Link from "next/link";
import { Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { AdminCustomer } from "@/lib/services/admin.server";

export const CustomersTable = ({ customers }: { customers: AdminCustomer[] }) => (
  <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
    <div className="px-6 py-4 border-b border-neutral-200">
      <h2 className="text-sm font-semibold text-black">
        All Customers{" "}
        <span className="font-normal text-neutral-400">({customers.length})</span>
      </h2>
    </div>

    {customers.length === 0 ? (
      <p className="px-6 py-16 text-center text-sm text-neutral-400">
        No customers yet.
      </p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-6 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                Customer
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                Joined
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                Orders
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                Total spent
              </th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-3">
                  <p className="font-medium text-black leading-tight">
                    {c.full_name ?? "—"}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {c.email ?? "Unknown email"}
                  </p>
                </td>
                <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-neutral-600">{c.ordersCount}</td>
                <td className="px-4 py-3 font-semibold tabular-nums text-black">
                  {formatPrice(c.totalSpent)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors inline-flex"
                    title="View customer"
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
