"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useCartStore, selectTotalItems } from "@/store/cart";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
] as const;

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore(selectTotalItems);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-360 mx-auto px-6 h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link href="/" className="shrink-0" aria-label="MONO — Home">
          <Image
            src="/mono-logo.png"
            alt="MONO"
            width={80}
            height={24}
            priority
            className="h-6 w-auto object-contain dark:invert"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-label text-muted-foreground hover:text-foreground transition-colors duration-150",
                pathname.startsWith(href) && "text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            aria-label="Search"
            className="flex items-center justify-center size-11 text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>

          <Link
            href="/account"
            aria-label="Account"
            className="flex items-center justify-center size-11 text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <User size={18} strokeWidth={1.5} />
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
            className="relative flex items-center justify-center size-11 text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute top-2 right-2 size-4 bg-foreground text-background text-[10px] font-bold flex items-center justify-center leading-none">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center size-11 text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
          >
            {mobileOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-6 flex flex-col gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "text-label text-muted-foreground hover:text-foreground transition-colors",
                pathname.startsWith(href) && "text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
