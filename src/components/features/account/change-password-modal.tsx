"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@base-ui/react/dialog";
import { X, Eye, EyeOff, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

// ─── Password input ───────────────────────────────────────────────────────────

const PasswordInput = ({
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        className="w-full h-11 border border-input bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        {show ? (
          <EyeOff size={16} strokeWidth={1.5} />
        ) : (
          <Eye size={16} strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const ChangePasswordModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const handleClose = () => {
    setIsOpen(false);
    // Delay reset so the closing animation isn't interrupted by a layout shift
    setTimeout(() => {
      setServerError(null);
      setSuccess(false);
      reset();
    }, 200);
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(handleClose, 1500);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm text-foreground underline underline-offset-2 hover:no-underline cursor-pointer"
      >
        Set password
      </button>

      <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
              "transition-opacity duration-200",
              "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            )}
          >
            <div className="relative w-full max-w-sm bg-background p-8 shadow-xl">
              <Dialog.Title className="text-xl font-semibold tracking-tight mb-6">
                Set password
              </Dialog.Title>

              <Dialog.Close
                aria-label="Close"
                onClick={handleClose}
                className="absolute right-4 top-4 flex size-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} strokeWidth={1.5} />
              </Dialog.Close>

              {success ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <Check
                    size={32}
                    strokeWidth={1.5}
                    className="text-foreground"
                  />
                  <p className="text-sm text-muted-foreground">
                    Password updated successfully.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label
                      htmlFor="new-password"
                      className="text-label block mb-2"
                    >
                      New password
                    </label>
                    <PasswordInput
                      id="new-password"
                      autoComplete="new-password"
                      autoFocus
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="text-label block mb-2"
                    >
                      Confirm password
                    </label>
                    <PasswordInput
                      id="confirm-password"
                      autoComplete="new-password"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {serverError && (
                    <p className="text-xs text-destructive">{serverError}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving…" : "Save password"}
                  </Button>
                </form>
              )}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
