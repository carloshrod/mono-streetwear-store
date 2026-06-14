"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthModal } from "@/store/auth-modal";
import { LoginForm } from "@/components/features/auth/login-form";

export const AuthModal = () => {
  const isOpen = useAuthModal((s) => s.isOpen);
  const setOpen = useAuthModal((s) => s.setOpen);
  const close = useAuthModal((s) => s.close);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-[100] bg-black/60 transition-opacity duration-200",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center p-4",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            "transition-opacity duration-200",
          )}
        >
          <div className="relative w-full max-w-sm bg-background p-8 shadow-xl">
            <Dialog.Title className="sr-only">Sign in</Dialog.Title>

            <Dialog.Close
              aria-label="Close"
              onClick={close}
              className="absolute right-4 top-4 flex size-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={16} strokeWidth={1.5} />
            </Dialog.Close>

            <LoginForm onSuccess={close} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
