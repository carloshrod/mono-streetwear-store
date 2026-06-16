import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/button-variants";

export const ContinueShopping = () => (
  <section className="border-t border-border">
    <div className="max-w-360 mx-auto px-6 py-16 md:py-24 flex flex-col items-center gap-6 text-center">
      <p className="text-label text-muted-foreground">Keep exploring</p>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight max-w-xs">
        There&apos;s more to discover
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        New drops, essentials, and limited pieces — all waiting for you.
      </p>
      <Link
        href="/products"
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-2")}
      >
        Continue Shopping
      </Link>
    </div>
  </section>
);
