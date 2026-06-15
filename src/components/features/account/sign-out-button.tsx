"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/button-variants";
import { createClient } from "@/lib/supabase/client";

export const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    // Client-side sign-out clears localStorage + in-memory session,
    // ensuring useUser() sees the cleared state on the next render.
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}
    >
      Sign out
    </button>
  );
};
