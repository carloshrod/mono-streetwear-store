"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, User, Search, Menu, X, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { useCartStore, selectTotalItems } from "@/store/cart";
import { useCartUI } from "@/store/cart-ui";
import { useCartHydrated } from "@/hooks/use-cart-hydrated";
import { useUser } from "@/hooks/use-user";
import { useAuthModal } from "@/store/auth-modal";
import { CartDrawer } from "@/components/features/cart/cart-drawer";
import { SearchOverlay } from "@/components/features/search/search-overlay";
import type { Category } from "@/types/product";

interface NavbarProps {
  categories: Category[];
}

type GenderKey = "men" | "women";

const GENDER_LABELS: Record<GenderKey, string> = { men: "Men", women: "Women" };

type NavState = {
  mobileOpen: boolean;
  mobileExpanded: GenderKey | null;
  activeDrawer: GenderKey | null;
  syncedPathname: string;
};

const CLOSED_NAV = {
  mobileOpen: false,
  mobileExpanded: null,
  activeDrawer: null,
} satisfies Omit<NavState, "syncedPathname">;

export const Navbar = ({ categories }: NavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [nav, setNav] = useState<NavState>({ ...CLOSED_NAV, syncedPathname: pathname });
  const [searchOpen, setSearchOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Render-phase derived state: reset nav when route changes (no effect needed)
  if (nav.syncedPathname !== pathname) {
    setNav({ ...CLOSED_NAV, syncedPathname: pathname });
  }

  const { mobileOpen, mobileExpanded, activeDrawer } = nav;

  const openCart = useCartUI((s) => s.open);
  const hydrated = useCartHydrated();
  const itemCount = useCartStore(selectTotalItems);
  const showBadge = hydrated && itemCount > 0;
  const { user, loading: userLoading } = useUser();
  const openAuthModal = useAuthModal((s) => s.open);

  const handleEnter = (gender: GenderKey) => {
    clearTimeout(leaveTimer.current);
    setNav((s) => ({ ...s, activeDrawer: gender }));
  };

  const handleLeave = () => {
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(
      () => setNav((s) => ({ ...s, activeDrawer: null })),
      150,
    );
  };

  const closeMenu = () =>
    setNav((s) => ({ ...s, mobileOpen: false, mobileExpanded: null }));

  const drawerOpen = activeDrawer !== null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-360 mx-auto px-6 h-16 flex items-stretch justify-between gap-8">
          {/* Left: Logo + Gender nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="shrink-0 flex items-center me-12"
              aria-label="MONO — Home"
            >
              <Image
                src="/mono-logo.png"
                alt="MONO"
                width={80}
                height={24}
                priority
                style={{ width: "auto" }}
                className="h-10 w-auto object-contain dark:invert"
                loading="eager"
              />
            </Link>

            {/* Desktop gender nav triggers */}
            <nav
              className="hidden md:flex items-stretch gap-8"
              aria-label="Main navigation"
            >
              {(["men", "women"] as GenderKey[]).map((gender) => (
                <div
                  key={gender}
                  className="flex items-center"
                  onMouseEnter={() => handleEnter(gender)}
                  onMouseLeave={handleLeave}
                >
                  <Link
                    href={`/products?gender=${gender}`}
                    className={cn(
                      "text-label transition-colors duration-150 uppercase",
                      activeDrawer === gender
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {GENDER_LABELS[gender]}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <button
              aria-label="Search"
              onClick={() => {
                setNav((s) => ({ ...s, mobileOpen: false }));
                setSearchOpen(true);
              }}
              className="flex items-center justify-center size-11 text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            {!userLoading && (
              <button
                type="button"
                aria-label={user ? "My account" : "Sign in"}
                title={user?.email}
                onClick={() => (user ? router.push("/account") : openAuthModal())}
                className={cn(
                  "flex items-center justify-center size-11 transition-colors duration-150 cursor-pointer",
                  user
                    ? "text-foreground hover:opacity-70"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <User size={18} strokeWidth={1.5} />
              </button>
            )}

            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart — ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
              className="relative flex items-center justify-center size-11 text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {showBadge && (
                <span className="absolute top-2 right-2 size-4 bg-foreground text-background text-[10px] font-bold flex items-center justify-center leading-none">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setNav((s) => ({ ...s, mobileOpen: !s.mobileOpen }))}
              className="md:hidden flex items-center justify-center size-11 text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
            >
              {mobileOpen ? (
                <X size={18} strokeWidth={1.5} />
              ) : (
                <Menu size={18} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile accordion menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background">
            {(["men", "women"] as GenderKey[]).map((gender) => (
              <div
                key={gender}
                className="border-b border-border last:border-0"
              >
                <button
                  onClick={() =>
                    setNav((s) => ({
                      ...s,
                      mobileExpanded: s.mobileExpanded === gender ? null : gender,
                    }))
                  }
                  className="flex w-full items-center justify-between px-6 py-4 text-label"
                >
                  <span
                    className={
                      mobileExpanded === gender
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {GENDER_LABELS[gender]}
                  </span>
                  <ChevronDown
                    size={14}
                    strokeWidth={1.5}
                    className={cn(
                      "text-muted-foreground transition-transform duration-200",
                      mobileExpanded === gender && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>

                {mobileExpanded === gender && (
                  <div className="px-6 pb-5 flex flex-col">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?gender=${gender}&category=${cat.slug}`}
                        onClick={closeMenu}
                        className="py-2 text-label text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <Link
                      href={`/products?gender=${gender}`}
                      onClick={closeMenu}
                      className="mt-2 pt-3 border-t border-border text-label text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Shop All {GENDER_LABELS[gender]} →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <CartDrawer />
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </header>

      {/* ── Desktop gender drawer ── */}
      <div
        aria-hidden={!drawerOpen}
        className={cn(
          "hidden md:flex md:flex-col fixed left-0 top-16 z-40",
          "h-[calc(100dvh-4rem)] w-72 bg-background border-r border-border",
          "transition-transform duration-300 ease-in-out",
          drawerOpen
            ? "translate-x-0"
            : "-translate-x-full pointer-events-none",
        )}
        onMouseEnter={() => activeDrawer && handleEnter(activeDrawer)}
        onMouseLeave={handleLeave}
      >
        {(["men", "women"] as GenderKey[]).map((gender) => (
          <div
            key={gender}
            className={cn(
              "flex flex-col h-full",
              activeDrawer === gender ? "flex" : "hidden",
            )}
          >
            {/* Drawer header */}
            <div className="px-8 pt-10 pb-8 border-b border-border">
              <p className="text-label text-muted-foreground mb-2">Shop</p>
              <p className="text-2xl font-bold tracking-tight">
                {GENDER_LABELS[gender]}
              </p>
            </div>

            {/* Category links */}
            <nav
              className="flex-1 px-8 py-6 flex flex-col gap-0.5"
              aria-label={`${GENDER_LABELS[gender]} categories`}
            >
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?gender=${gender}&category=${cat.slug}`}
                  className="py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Shop All link */}
            <div className="px-8 py-6 border-t border-border">
              <Link
                href={`/products?gender=${gender}`}
                className="text-label text-muted-foreground hover:text-foreground transition-colors"
              >
                Shop All {GENDER_LABELS[gender]} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Backdrop */}
      <div
        className={cn(
          "hidden md:block fixed inset-0 top-16 z-39",
          "bg-foreground/10 transition-opacity duration-300",
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onMouseEnter={handleLeave}
        onClick={() => setNav((s) => ({ ...s, activeDrawer: null }))}
      />
    </>
  );
};
