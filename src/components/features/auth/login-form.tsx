"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

// Accept 6 or 8 digits — Supabase project settings control the length
const otpSchema = z.object({
  token: z
    .string()
    .min(6, "Enter the full code")
    .max(8, "Code too long")
    .regex(/^\d+$/, "Digits only"),
});

const passwordSignInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

const passwordSignUpSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type EmailForm = z.infer<typeof emailSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type PasswordSignInForm = z.infer<typeof passwordSignInSchema>;
type PasswordSignUpForm = z.infer<typeof passwordSignUpSchema>;

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthMode = "otp" | "password";
type PasswordView = "signin" | "signup";

type LoginFormProps = {
  onSuccess?: () => void;
};

// ─── Shared input class ───────────────────────────────────────────────────────

const inputClass =
  "w-full h-11 border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow";

// ─── Tab bar ─────────────────────────────────────────────────────────────────

const TabBar = ({
  mode,
  onChange,
}: {
  mode: AuthMode;
  onChange: (m: AuthMode) => void;
}) => (
  <div className="flex border-b border-border mb-8">
    {(["otp", "password"] as const).map((m) => (
      <button
        key={m}
        type="button"
        onClick={() => onChange(m)}
        className={cn(
          "flex-1 py-3 text-label transition-colors",
          mode === m
            ? "text-foreground border-b-2 border-foreground -mb-px"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {m === "otp" ? "Sign in with code" : "Use password"}
      </button>
    ))}
  </div>
);

// ─── Field wrapper ────────────────────────────────────────────────────────────

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="text-label block mb-2">{label}</label>
    {children}
    {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
  </div>
);

// ─── Password input with show/hide toggle ─────────────────────────────────────

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
        className={cn(inputClass, "pr-10")}
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

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("otp");
  const [otpStep, setOtpStep] = useState<"email" | "verify">("email");
  const [passwordView, setPasswordView] = useState<PasswordView>("signin");
  const [sentEmail, setSentEmail] = useState("");
  const [signupDone, setSignupDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // ── Forms ──────────────────────────────────────────────────────────────────
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  const signInForm = useForm<PasswordSignInForm>({
    resolver: zodResolver(passwordSignInSchema),
  });

  const signUpForm = useForm<PasswordSignUpForm>({
    resolver: zodResolver(passwordSignUpSchema),
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const handleSuccess = () => {
    router.refresh();
    onSuccess?.();
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setServerError(null);
    setSignupDone(false);
    // Reset OTP flow when switching away
    if (m !== "otp") {
      setOtpStep("email");
      emailForm.reset();
      otpForm.reset();
    }
  };

  // ── OTP handlers ─────────────────────────────────────────────────────────────
  const handleSendOtp = async (data: EmailForm) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    setSentEmail(data.email);
    setOtpStep("verify");
  };

  const handleVerifyOtp = async (data: OtpForm) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: sentEmail,
      token: data.token,
      type: "email",
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    handleSuccess();
  };

  // ── Password handlers ─────────────────────────────────────────────────────────
  const handleSignIn = async (data: PasswordSignInForm) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    handleSuccess();
  };

  const handleSignUp = async (data: PasswordSignUpForm) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    setSignupDone(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold tracking-tight mb-6">
        Sign in to MONO
      </h2>

      <TabBar mode={mode} onChange={switchMode} />

      {/* ── OTP mode ── */}
      {mode === "otp" && otpStep === "email" && (
        <form
          onSubmit={emailForm.handleSubmit(handleSendOtp)}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground -mt-2 mb-6">
            We&apos;ll send a one-time code to your email.
          </p>
          <Field label="Email" error={emailForm.formState.errors.email?.message}>
            <input
              id="otp-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              className={inputClass}
              {...emailForm.register("email")}
            />
          </Field>
          {serverError && (
            <p className="text-xs text-destructive">{serverError}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={emailForm.formState.isSubmitting}
          >
            {emailForm.formState.isSubmitting ? "Sending…" : "Send code"}
          </Button>
        </form>
      )}

      {mode === "otp" && otpStep === "verify" && (
        <form
          onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground -mt-2 mb-6">
            We sent a code to{" "}
            <span className="text-foreground font-medium">{sentEmail}</span>
          </p>
          <Field
            label="Verification code"
            error={otpForm.formState.errors.token?.message}
          >
            <input
              id="otp-token"
              type="text"
              inputMode="numeric"
              maxLength={8}
              autoComplete="off"
              autoFocus
              placeholder="••••••••"
              className="w-full h-11 border border-input bg-background px-3 text-xl font-mono tracking-[0.3em] text-center focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow"
              {...otpForm.register("token")}
            />
          </Field>
          {serverError && (
            <p className="text-xs text-destructive">{serverError}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={otpForm.formState.isSubmitting}
          >
            {otpForm.formState.isSubmitting ? "Verifying…" : "Verify code"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setOtpStep("email");
              setServerError(null);
              otpForm.reset();
            }}
            className="w-full text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
          >
            Use a different email
          </button>
        </form>
      )}

      {/* ── Password mode ── */}
      {mode === "password" && !signupDone && passwordView === "signin" && (
        <form
          onSubmit={signInForm.handleSubmit(handleSignIn)}
          className="space-y-4"
        >
          <Field
            label="Email"
            error={signInForm.formState.errors.email?.message}
          >
            <input
              id="pw-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              className={inputClass}
              {...signInForm.register("email")}
            />
          </Field>
          <Field
            label="Password"
            error={signInForm.formState.errors.password?.message}
          >
            <PasswordInput
              id="pw-password"
              autoComplete="current-password"
              {...signInForm.register("password")}
            />
          </Field>
          {serverError && (
            <p className="text-xs text-destructive">{serverError}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={signInForm.formState.isSubmitting}
          >
            {signInForm.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <button
              type="button"
              onClick={() => {
                setPasswordView("signup");
                setServerError(null);
                signInForm.reset();
              }}
              className="text-foreground underline underline-offset-2 hover:no-underline cursor-pointer"
            >
              Create one
            </button>
          </p>
        </form>
      )}

      {mode === "password" && !signupDone && passwordView === "signup" && (
        <form
          onSubmit={signUpForm.handleSubmit(handleSignUp)}
          className="space-y-4"
        >
          <Field
            label="Email"
            error={signUpForm.formState.errors.email?.message}
          >
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              className={inputClass}
              {...signUpForm.register("email")}
            />
          </Field>
          <Field
            label="Password"
            error={signUpForm.formState.errors.password?.message}
          >
            <PasswordInput
              id="signup-password"
              autoComplete="new-password"
              {...signUpForm.register("password")}
            />
          </Field>
          <Field
            label="Confirm password"
            error={signUpForm.formState.errors.confirmPassword?.message}
          >
            <PasswordInput
              id="signup-confirm"
              autoComplete="new-password"
              {...signUpForm.register("confirmPassword")}
            />
          </Field>
          {serverError && (
            <p className="text-xs text-destructive">{serverError}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={signUpForm.formState.isSubmitting}
          >
            {signUpForm.formState.isSubmitting ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setPasswordView("signin");
                setServerError(null);
                signUpForm.reset();
              }}
              className="text-foreground underline underline-offset-2 hover:no-underline cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </form>
      )}

      {mode === "password" && signupDone && (
        <div className="text-center space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Check your email to confirm your account, then sign in.
          </p>
          <button
            type="button"
            onClick={() => {
              setSignupDone(false);
              setPasswordView("signin");
              setServerError(null);
            }}
            className="text-sm text-foreground underline underline-offset-2 hover:no-underline cursor-pointer"
          >
            Go to sign in
          </button>
        </div>
      )}
    </div>
  );
};
