import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <Link href="/" className="mb-12" aria-label="MONO — Home">
        <Image
          src="/mono-logo.png"
          alt="MONO"
          width={80}
          height={24}
          priority
          style={{ width: "auto" }}
          className="h-8 w-auto object-contain dark:invert"
        />
      </Link>
      {children}
    </div>
  );
};

export default AuthLayout;
