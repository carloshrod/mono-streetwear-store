import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Gem, Pencil, Flame } from "lucide-react";

type Pillar = {
  icon: LucideIcon;
  label: string;
  body: string;
};

const PILLARS: Pillar[] = [
  {
    icon: Gem,
    label: "Quality",
    body: "Every piece built to outlast the trend cycle.",
  },
  {
    icon: Pencil,
    label: "Design",
    body: "Sharp silhouettes. Zero unnecessary detail.",
  },
  {
    icon: Flame,
    label: "Culture",
    body: "Rooted in the streets. Worn by the forward.",
  },
];

export const BrandSection = () => (
  <section className="bg-foreground text-background">
    <div className="max-w-360 mx-auto px-6 py-20 lg:py-28">
      {/* Manifesto */}
      <p className="text-label text-background/50 mb-8 tracking-[0.25em]">
        The MONO Philosophy
      </p>
      <p
        className="font-bold uppercase leading-[0.9] tracking-tight mb-16 lg:mb-24 max-w-3xl"
        style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
      >
        Wear less.
        <br />
        Mean more.
      </p>

      {/* Three pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-background/10 mb-16">
        {PILLARS.map(({ icon: Icon, label, body }) => (
          <div key={label} className="py-8 md:py-0 md:px-8 first:md:pl-0 last:md:pr-0">
            <Icon
              size={22}
              strokeWidth={1.25}
              className="text-background/60 mb-4"
              aria-hidden
            />
            <p className="text-label text-background/50 mb-3">{label}</p>
            <p className="text-sm text-background/70 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <Link
        href="/about"
        className="inline-flex items-center gap-2 text-label text-background/50 hover:text-background transition-colors"
      >
        Learn more about MONO
        <span aria-hidden>→</span>
      </Link>
    </div>
  </section>
);
