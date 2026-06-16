import { Package, ShoppingBag, TrendingUp, Archive } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { AdminStats } from "@/lib/services/admin.server";

const buildStats = (data: AdminStats) => [
  {
    label: "Total Products",
    value: data.totalProducts.toString(),
    sub: `${data.activeProducts} active · ${data.draftProducts} draft`,
    icon: Package,
  },
  {
    label: "Total Orders",
    value: data.totalOrders.toString(),
    sub: "all time",
    icon: ShoppingBag,
  },
  {
    label: "Total Revenue",
    value: formatPrice(data.totalRevenue),
    sub: "all time",
    icon: TrendingUp,
  },
  {
    label: "Archived",
    value: Math.max(
      0,
      data.totalProducts - data.activeProducts - data.draftProducts
    ).toString(),
    sub: "products archived",
    icon: Archive,
  },
];

export const StatsCards = ({ data }: { data: AdminStats }) => (
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
    {buildStats(data).map((stat) => (
      <div
        key={stat.label}
        className="bg-white border border-neutral-200 rounded-xl p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
            {stat.label}
          </span>
          <stat.icon size={15} className="text-neutral-300 mt-0.5 shrink-0" />
        </div>
        <p className="text-2xl font-bold text-black tracking-tight">
          {stat.value}
        </p>
        <p className="text-xs text-neutral-400 mt-1">{stat.sub}</p>
      </div>
    ))}
  </div>
);
