import { Suspense } from "react";

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { AuthModal } from "@/components/features/auth/auth-modal";
import { AuthRedirectHandler } from "@/components/features/auth/auth-redirect-handler";
import { getCategories } from "@/lib/services/categories.server";

const StoreLayout = async ({ children }: { children: React.ReactNode }) => {
  const categories = await getCategories();

  return (
    <>
      <Navbar categories={categories} />
      <main className="flex-1 min-h-dvh">{children}</main>
      <Footer />
      <ScrollToTop />
      <AuthModal />
      {/* useSearchParams() inside requires Suspense */}
      <Suspense>
        <AuthRedirectHandler />
      </Suspense>
    </>
  );
};

export default StoreLayout;
