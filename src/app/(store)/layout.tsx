import { Suspense } from "react";

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { AuthModal } from "@/components/features/auth/auth-modal";
import { AuthRedirectHandler } from "@/components/features/auth/auth-redirect-handler";

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-dvh">{children}</main>
      <Footer />
      <AuthModal />
      {/* useSearchParams() inside requires Suspense */}
      <Suspense>
        <AuthRedirectHandler />
      </Suspense>
    </>
  );
};

export default StoreLayout;
