"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuthModal } from "@/store/auth-modal";

/**
 * Detects ?signin=1 in the URL (set by requireAuth when redirecting unauthenticated
 * users) and auto-opens the auth modal, then cleans up the search param.
 */
export const AuthRedirectHandler = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const openModal = useAuthModal((s) => s.open);

  useEffect(() => {
    if (searchParams.get("signin") === "1") {
      openModal();
      const url = new URL(window.location.href);
      url.searchParams.delete("signin");
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, openModal, router]);

  return null;
};
