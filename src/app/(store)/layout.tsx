import { Suspense } from "react";

import { Navbar } from "@/components/shared/navbar";
import { AuthModal } from "@/components/features/auth/auth-modal";
import { AuthRedirectHandler } from "@/components/features/auth/auth-redirect-handler";

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-dvh">{children}</main>
      <AuthModal />
      {/* useSearchParams() inside requires Suspense */}
      <Suspense>
        <AuthRedirectHandler />
      </Suspense>
    </>
  );
};

export default StoreLayout;
