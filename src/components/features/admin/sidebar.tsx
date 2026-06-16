"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  UserCircle,
  Settings,
  ChevronRight,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAdmin } from "@/app/actions/admin/auth";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Profile", href: "/admin/profile", icon: UserCircle },
  { label: "Customers", href: "/admin/customers", icon: Users, disabled: true },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    disabled: true,
  },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-black text-white flex flex-col z-40">
      <div className="px-5 py-7 border-b border-white/10">
        <span className="text-[10px] font-medium tracking-widest text-white/30 uppercase">
          MONO
        </span>
        <p className="text-base font-bold tracking-tight mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          if (item.disabled) {
            return (
              <span
                key={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/25 cursor-not-allowed"
              >
                <item.icon size={15} />
                {item.label}
                <span className="ml-auto text-[9px] tracking-widest uppercase bg-white/8 px-1.5 py-0.5 rounded font-medium">
                  Soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-white text-black font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/8",
              )}
            >
              <item.icon size={15} />
              {item.label}
              {isActive && <ChevronRight size={13} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 space-y-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-white/35 hover:text-white/60 transition-colors"
        >
          <ArrowLeft size={12} />
          Back to store
        </Link>

        <form action={signOutAdmin}>
          <button
            type="submit"
            className="flex items-center gap-2 text-xs text-white/35 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut size={12} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
};
