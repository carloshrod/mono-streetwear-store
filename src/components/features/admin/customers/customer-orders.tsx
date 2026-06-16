import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/order";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export const CustomerOrders = ({ orders }: { orders: Order[] }) => (
  <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
    <div className="px-6 py-4 border-b border-neutral-200">
      <h2 className="text-sm font-semibold text-black">
        Order History{" "}
        <span className="font-normal text-neutral-400">({orders.length})</span>
      </h2>
    </div>

    {orders.length === 0 ? (
      <p className="px-6 py-14 text-center text-sm text-neutral-400">
        No orders yet.
      </p>
    ) : (
      <div className="divide-y divide-neutral-100">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="px-6 py-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black font-mono">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize shrink-0 ${STATUS_STYLES[order.status]}`}
            >
              {order.status}
            </span>
            <span className="text-sm font-bold text-black tabular-nums shrink-0">
              {formatPrice(order.total_amount)}
            </span>
          </Link>
        ))}
      </div>
    )}
  </div>
);
