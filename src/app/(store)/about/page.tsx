import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Minimize2, Gem, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getFeaturedProducts } from "@/lib/services/products.server";
import { buttonVariants } from "@/lib/button-variants";

export const metadata: Metadata = {
  title: "About — MONO",
  description: "Premium streetwear. Minimal by design.",
};

type Value = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const VALUES: Value[] = [
  {
    icon: Minimize2,
    title: "Minimal",
    body: "We remove everything that isn't essential. Every piece is the result of what's left when you stop adding.",
  },
  {
    icon: Gem,
    title: "Premium",
    body: "Materials sourced with intent. Construction built to last. Quality is not a feature — it's the baseline.",
  },
  {
    icon: Target,
    title: "Intentional",
    body: "Nothing ships by accident. Each drop is considered, limited, and designed to mean something.",
  },
];

const AboutPage = async () => {
  const products = await getFeaturedProducts(6);

  const heroImage = products[0]?.images[0] ?? null;
  const storyImage = products[1]?.images[0] ?? null;
  const gridImages = products.slice(2, 6).map((p) => p.images[0] ?? null);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[90vh] min-h-140 flex flex-col justify-end overflow-hidden bg-foreground">
        {heroImage && (
          <Image
            src={heroImage}
            alt="MONO hero"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
        )}

        <div className="relative z-10 max-w-360 mx-auto px-6 pb-16 lg:pb-24 w-full">
          <p className="text-label text-white/50 mb-6">Est. 2024 — New York</p>
          <div className="flex gap-4 items-center mb-6">
            <Image
              src="/mono-logo-2.png"
              alt="MONO"
              width={120}
              height={36}
              style={{ width: "auto" }}
              className="h-12 xs:h-16 md:h-20 lg:h-24 xl:h-32 w-auto object-contain brightness-0 invert"
            />
            <h1 className="text-[clamp(3rem,10vw,8rem)] font-bold leading-none tracking-tight text-white">
              MONO
            </h1>
          </div>
          <p className="text-lg text-white/70 max-w-md leading-relaxed">
            Premium streetwear built on the belief that less is always more.
          </p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="grid lg:grid-cols-2 min-h-150">
        {/* Text */}
        <div className="flex flex-col justify-center px-6 py-20 lg:px-16 xl:px-24 max-w-2xl lg:max-w-none">
          <p className="text-label text-muted-foreground mb-8">Our Story</p>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-8 leading-tight">
            Born from the need
            <br />
            for something real.
          </h2>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              MONO started with a simple frustration: most streetwear was either
              disposable fast fashion or unattainable luxury. We wanted the
              quality of the latter with the culture of the former.
            </p>
            <p>
              Every garment we make is designed to age well — in style, in
              fabric, in meaning. We don&apos;t chase seasons. We build pieces
              that outlast them.
            </p>
            <p>
              Minimal doesn&apos;t mean empty. It means deliberate. It means
              every line, every color, every stitch is there because it earns
              its place.
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="relative min-h-100 lg:min-h-0 bg-secondary">
          {storyImage && (
            <Image
              src={storyImage}
              alt="MONO — Our story"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>
      </section>

      {/* ── Image grid ── */}
      {gridImages.some(Boolean) && (
        <section className="grid grid-cols-2 lg:grid-cols-4">
          {gridImages.map((src, i) => (
            <div key={i} className="relative aspect-square bg-secondary">
              {src && (
                <Image
                  src={src}
                  alt={`MONO collection ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Manifesto ── */}
      <section className="bg-foreground text-background py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-label text-background/40 mb-8">Manifesto</p>
          <blockquote className="text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
            &quot;We don&apos;t follow trends.
            <br />
            We outlast them.&quot;
          </blockquote>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-24 px-6">
        <div className="max-w-360 mx-auto">
          <p className="text-label text-muted-foreground mb-16 text-center">
            What we stand for
          </p>
          <div className="grid md:grid-cols-3 gap-px bg-border">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-background px-10 py-12">
                <Icon
                  size={22}
                  strokeWidth={1.25}
                  className="text-muted-foreground mb-6"
                  aria-hidden
                />
                <h3 className="text-2xl font-bold tracking-tight mb-4">
                  {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 border-t border-border text-center">
        <p className="text-label text-muted-foreground mb-4">Ready to wear</p>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-8">
          Explore the collection
        </h2>
        <Link
          href="/products"
          className={buttonVariants({ size: "lg" } as never)}
        >
          Shop now
        </Link>
      </section>
    </>
  );
};

export default AboutPage;
