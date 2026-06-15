import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Package } from "lucide-react";

import { ChangePasswordModal } from "@/components/features/account/change-password-modal";

import { cn, formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/lib/button-variants";
import { SignOutButton } from "@/components/features/account/sign-out-button";
import type { Profile } from "@/types/user";
import type { Order } from "@/types/order";

type AccountViewProps = {
  user: User;
  profile: Pick<Profile, "full_name" | "role"> | null;
  orders: Pick<Order, "id" | "status" | "total_amount" | "created_at">[];
};

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-700",
  shipped:    "bg-violet-50 text-violet-700",
  delivered:  "bg-emerald-50 text-emerald-700",
  cancelled:  "bg-red-50 text-red-600",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const AccountView = ({ user, profile, orders }: AccountViewProps) => {
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 lg:py-20">
      <h1 className="text-2xl font-semibold tracking-tight mb-10">
        My Account
      </h1>

      {/* ── Profile ── */}
      <section className="mb-10 pb-10 border-b border-border">
        <h2 className="text-label text-muted-foreground mb-6">Profile</h2>
        <dl className="space-y-3">
          {profile?.full_name && (
            <div className="flex justify-between text-sm">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{profile.full_name}</dd>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="font-medium">{memberSince}</dd>
          </div>
          <div className="flex justify-between items-center text-sm">
            <dt className="text-muted-foreground">Password</dt>
            <dd>
              <ChangePasswordModal />
            </dd>
          </div>
          {profile?.role === "admin" && (
            <div className="flex justify-between text-sm">
              <dt className="text-muted-foreground">Role</dt>
              <dd>
                <span className="text-label bg-foreground text-background px-2 py-0.5">
                  Admin
                </span>
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* ── Orders ── */}
      <section className="mb-10 pb-10 border-b border-border">
        <h2 className="text-label text-muted-foreground mb-6">Recent orders</h2>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <Package size={36} strokeWidth={1} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No orders yet.</p>
            <Link
              href="/products"
              className={buttonVariants({ variant: "outline" })}
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-sm font-medium font-mono truncate">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      "text-label px-2 py-0.5",
                      STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground",
                    )}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Sign out ── */}
      <SignOutButton />
    </div>
  );
};
