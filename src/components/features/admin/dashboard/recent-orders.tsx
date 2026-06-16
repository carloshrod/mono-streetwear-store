import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/order";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export const RecentOrders = ({ orders }: { orders: Order[] }) => (
  <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
    <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-black">Recent Orders</h2>
      <span className="text-xs text-neutral-400">{orders.length} shown</span>
    </div>

    {orders.length === 0 ? (
      <p className="px-6 py-14 text-center text-sm text-neutral-400">
        No orders yet.
      </p>
    ) : (
      <div className="divide-y divide-neutral-100">
        {orders.map((order) => (
          <div key={order.id} className="px-6 py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black tabular-nums">
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
          </div>
        ))}
      </div>
    )}
  </div>
);
