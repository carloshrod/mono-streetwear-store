import { Suspense } from "react";

import { MinimalNavbar } from "@/components/shared/minimal-navbar";
import { Footer } from "@/components/shared/footer";
import { AuthModal } from "@/components/features/auth/auth-modal";
import { AuthRedirectHandler } from "@/components/features/auth/auth-redirect-handler";

const CheckoutFlowLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <MinimalNavbar />
    <main className="flex-1 min-h-dvh">{children}</main>
    <Footer />
    <AuthModal />
    <Suspense>
      <AuthRedirectHandler />
    </Suspense>
  </>
);

export default CheckoutFlowLayout;
