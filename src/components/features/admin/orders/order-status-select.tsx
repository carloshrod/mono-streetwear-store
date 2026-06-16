"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/actions/admin/orders";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

type Props = {
  orderId: string;
  status: OrderStatus;
};

export const OrderStatusSelect = ({ orderId, status }: Props) => {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    const previous = value;
    setValue(newStatus);

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (!result.success) {
        toast.error(result.error);
        setValue(previous);
      } else {
        toast.success("Order status updated");
      }
    });
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={isPending}
      className={cn(
        "text-xs font-medium pl-2.5 pr-1.5 py-1.5 rounded-full border capitalize cursor-pointer transition-opacity focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
        STATUS_STYLES[value]
      )}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
};
