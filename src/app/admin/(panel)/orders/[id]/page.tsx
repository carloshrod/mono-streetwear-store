import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminOrderById } from "@/lib/services/admin.server";
import { OrderDetail } from "@/components/features/admin/orders/order-detail";

type Props = { params: Promise<{ id: string }> };

const AdminOrderDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) notFound();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black transition-colors mb-3"
        >
          <ArrowLeft size={13} />
          Back to orders
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Placed on{" "}
          {new Date(order.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      <OrderDetail order={order} />
    </div>
  );
};

export default AdminOrderDetailPage;
