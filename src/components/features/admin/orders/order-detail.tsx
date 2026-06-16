import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "./order-status-select";
import type { AdminOrder } from "@/lib/services/admin.server";

export const OrderDetail = ({ order }: { order: AdminOrder }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-black">Items</h2>
        </div>
        <div className="divide-y divide-neutral-100">
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-neutral-100 shrink-0">
                {item.product?.images?.[0] && (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product?.name ?? "Product"}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/products/${item.product_id}/edit`}
                  className="text-sm font-medium text-black hover:underline truncate block"
                >
                  {item.product?.name ?? "Unknown product"}
                </Link>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Size {item.variant?.size ?? "—"} · Qty {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums text-black shrink-0">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-neutral-200 flex justify-between text-sm">
          <span className="text-neutral-500">Total</span>
          <span className="font-bold text-black">
            {formatPrice(order.total_amount)}
          </span>
        </div>
      </section>

      <section className="bg-white border border-neutral-200 rounded-xl p-6">
        <h2 className="text-xs font-semibold text-black uppercase tracking-wide border-b border-neutral-100 pb-3 mb-4">
          Shipping address
        </h2>
        <div className="text-sm text-neutral-700 space-y-0.5">
          <p className="font-medium text-black">
            {order.shipping_address.full_name}
          </p>
          <p>{order.shipping_address.line1}</p>
          {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
          <p>
            {order.shipping_address.city}, {order.shipping_address.state}{" "}
            {order.shipping_address.postal_code}
          </p>
          <p>{order.shipping_address.country}</p>
        </div>
      </section>
    </div>

    <div className="space-y-6">
      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xs font-semibold text-black uppercase tracking-wide border-b border-neutral-100 pb-3">
          Status
        </h2>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </section>

      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-3">
        <h2 className="text-xs font-semibold text-black uppercase tracking-wide border-b border-neutral-100 pb-3">
          Customer
        </h2>
        <div className="text-sm space-y-1">
          <p className="font-medium text-black">
            {order.customer.full_name ?? "—"}
          </p>
          <p className="text-neutral-500">
            {order.customer.email ?? "Unknown email"}
          </p>
          {order.customer.phone && (
            <p className="text-neutral-500">{order.customer.phone}</p>
          )}
        </div>
      </section>

      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-3">
        <h2 className="text-xs font-semibold text-black uppercase tracking-wide border-b border-neutral-100 pb-3">
          Payment
        </h2>
        <div className="text-xs text-neutral-500 space-y-1.5 font-mono break-all">
          <p>Payment intent: {order.stripe_payment_intent_id ?? "—"}</p>
          <p>Session: {order.stripe_session_id ?? "—"}</p>
        </div>
      </section>
    </div>
  </div>
);
