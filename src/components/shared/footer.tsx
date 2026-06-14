import Link from "next/link";
import Image from "next/image";

const SHOP_LINKS = [
  { href: "/products", label: "All Products" },
  { href: "/products?category=tees", label: "Tees" },
  { href: "/products?category=outerwear", label: "Outerwear" },
  { href: "/products?category=accessories", label: "Accessories" },
] as const;

const INFO_LINKS = [
  { href: "/about", label: "About" },
  { href: "/account", label: "My Account" },
  { href: "/cart", label: "Cart" },
] as const;

export const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="max-w-360 mx-auto px-6 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" aria-label="MONO — Home" className="inline-block mb-4">
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
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-label mb-5">Contact</p>
          <ul className="flex flex-col gap-3">
            <li>
              <a
                href="mailto:hello@mono.store"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                hello@mono.store
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} MONO. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);
