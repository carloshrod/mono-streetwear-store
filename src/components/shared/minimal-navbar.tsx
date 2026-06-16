import Image from "next/image";
import Link from "next/link";

export const MinimalNavbar = () => (
  <header className="sticky top-0 z-50 bg-background">
    <div className="h-16 flex items-center justify-center">
      <Link href="/" aria-label="MONO — Home">
        <Image
          src="/mono-logo.png"
          alt="MONO"
          width={80}
          height={24}
          priority
          style={{ width: "auto" }}
          className="h-10 w-auto object-contain dark:invert"
        />
      </Link>
    </div>
  </header>
);
