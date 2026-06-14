import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/button-variants";

export const Hero = () => (
  <section className="relative flex min-h-[88vh] flex-col justify-end px-6 py-10 max-w-360 mx-auto w-full">
    <h1
      className="font-bold uppercase leading-[0.88] tracking-tight mb-10"
      style={{ fontSize: "clamp(3.5rem, 10vw, 8.5rem)" }}
    >
      Define
      <br />
      Your
      <br />
      Aesthetic
    </h1>

    <p className="text-muted-foreground max-w-xs mb-10 text-sm leading-relaxed">
      Premium streetwear for those who move with intention. Zero compromise on
      quality or edge.
    </p>

    <div className="flex flex-wrap gap-3">
      <Link href="/products" className={buttonVariants({ size: "lg" })}>
        Shop Now
      </Link>
      <Link
        href="/products"
        className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
      >
        New Arrivals
      </Link>
    </div>

    <div className="absolute bottom-0 inset-x-0 h-px bg-border" />
  </section>
);
