"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Mail, Phone } from "lucide-react";

import { useUser } from "@/hooks/use-user";
import { useAuthModal } from "@/store/auth-modal";

const SHOP_LINKS = [
  { href: "/products", label: "All Products" },
  { href: "/products?category=t-shirts", label: "Tees" },
  { href: "/products?category=outerwear", label: "Outerwear" },
  { href: "/products?category=accessories", label: "Accessories" },
] as const;

const INFO_LINKS = [
  { href: "/about", label: "About" },
  { href: "/cart", label: "Cart" },
] as const;

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/monostreetwear",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/monostreetwear",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@mono.streetwear",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-4"
        aria-hidden
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.85 4.85 0 0 1-1-.43z" />
      </svg>
    ),
  },
] as const;

export const Footer = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const openAuthModal = useAuthModal((s) => s.open);

  const handleAccount = () => {
    if (user) {
      router.push("/account");
    } else {
      openAuthModal();
    }
  };

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-360 mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              aria-label="MONO — Home"
              className="inline-block mb-4"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <Image
                src="/mono-logo.png"
                alt="MONO"
                width={64}
                height={20}
                style={{ width: "auto" }}
                className="h-10 w-auto object-contain dark:invert"
              />
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-45">
              Premium streetwear. Minimal by design.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-label mb-5">Shop</p>
            <ul className="flex flex-col gap-3">
              {SHOP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-label mb-5">Info</p>
            <ul className="flex flex-col gap-3">
              {INFO_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={handleAccount}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  My Account
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-label mb-5">Contact</p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="mailto:hello@mono.store"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail size={13} strokeWidth={1.5} />
                  hello@mono.store
                </a>
              </li>
              <li>
                <a
                  href="tel:+11234567890"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone size={13} strokeWidth={1.5} />
                  +1 (123) 456-7890
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-4 mt-5">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MONO. All rights reserved.
          </p>

          <span className="inline-flex items-center text-gray-500 text-xs me-20">
            Desarrollado con ♥️ por
            <a
              href="https://chrod.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex ms-1 font-semibold hover:text-primary"
            >
              <Image
                src="/chrod-logo.png"
                alt="CHRod logo"
                width={36}
                height={28}
              />
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};
