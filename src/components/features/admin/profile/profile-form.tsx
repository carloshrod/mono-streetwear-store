"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateAdminEmail } from "@/app/actions/admin/profile";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
  currentPassword: z.string().min(1, "Enter your current password"),
});
type EmailForm = z.infer<typeof emailSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type PasswordForm = z.infer<typeof passwordSchema>;

type Props = { currentEmail: string };

export const ProfileForm = ({ currentEmail }: Props) => {
  const router = useRouter();

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: currentEmail, currentPassword: "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateEmail = async (data: EmailForm) => {
    if (data.email === currentEmail) {
      toast.error("This is already your current email");
      return;
    }

    const supabase = createClient();

    // Re-authenticate with the current password before allowing the change.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: data.currentPassword,
    });

    if (signInError) {
      emailForm.setError("currentPassword", { message: "Incorrect password" });
      return;
    }

    const result = await updateAdminEmail(data.email);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Email updated");
    emailForm.resetField("currentPassword");
    router.refresh();
  };

  const onChangePassword = async (data: PasswordForm) => {
    const supabase = createClient();

    // Re-authenticate with the current password before allowing the change.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: data.currentPassword,
    });

    if (signInError) {
      passwordForm.setError("currentPassword", {
        message: "Incorrect password",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    passwordForm.reset();
    toast.success("Password updated. Please sign in again.");
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="space-y-6">
      {/* Email */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xs font-semibold text-black uppercase tracking-wide border-b border-neutral-100 pb-3">
          Email address
        </h2>
        <form
          onSubmit={emailForm.handleSubmit(onUpdateEmail)}
          className="space-y-4"
        >
          <Field
            label="Email"
            error={emailForm.formState.errors.email?.message}
          >
            <input
              type="email"
              autoComplete="email"
              {...emailForm.register("email")}
              className={input()}
            />
          </Field>
          <Field
            label="Current password"
            error={emailForm.formState.errors.currentPassword?.message}
          >
            <PasswordInput
              autoComplete="current-password"
              {...emailForm.register("currentPassword")}
            />
          </Field>
          <button
            type="submit"
            disabled={emailForm.formState.isSubmitting}
            className={submitButton()}
          >
            {emailForm.formState.isSubmitting ? "Updating..." : "Update email"}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xs font-semibold text-black uppercase tracking-wide border-b border-neutral-100 pb-3">
          Change password
        </h2>
        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          className="space-y-4"
        >
          <Field
            label="Current password"
            error={passwordForm.formState.errors.currentPassword?.message}
          >
            <PasswordInput
              autoComplete="current-password"
              {...passwordForm.register("currentPassword")}
            />
          </Field>
          <Field
            label="New password"
            error={passwordForm.formState.errors.newPassword?.message}
          >
            <PasswordInput
              autoComplete="new-password"
              {...passwordForm.register("newPassword")}
            />
          </Field>
          <Field
            label="Confirm new password"
            error={passwordForm.formState.errors.confirmPassword?.message}
          >
            <PasswordInput
              autoComplete="new-password"
              {...passwordForm.register("confirmPassword")}
            />
          </Field>
          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className={submitButton()}
          >
            {passwordForm.formState.isSubmitting
              ? "Updating..."
              : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
};

// ── Local helpers ──────────────────────────────────────────────────────────────

const input = () =>
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-neutral-300";

const submitButton = () =>
  "bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer";

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const PasswordInput = ({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className={`${input()} pr-10`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
};
