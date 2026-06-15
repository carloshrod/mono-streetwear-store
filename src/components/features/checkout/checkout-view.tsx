"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { User as UserIcon } from "lucide-react";

import { useCartStore, selectTotalPrice } from "@/store/cart";
import { useCartHydrated } from "@/hooks/use-cart-hydrated";
import { useUser } from "@/hooks/use-user";
import { useAuthModal } from "@/store/auth-modal";
import { createOrder } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/features/checkout/order-summary";
import type { Address } from "@/types/user";

const addressSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  line1: z.string().min(5, "Street address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State / province is required"),
  postal_code: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

type AddressForm = z.infer<typeof addressSchema>;

const inputClass =
  "w-full h-11 border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow";

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

type Props = {
  savedAddress: Address | null;
};

export const CheckoutView = ({ savedAddress }: Props) => {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const { user, loading: userLoading } = useUser();
  const openAuthModal = useAuthModal((s) => s.open);
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectTotalPrice);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: savedAddress ?? { country: "US" },
  });

  // Redirect to cart if hydrated and empty
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  if (!hydrated || userLoading || items.length === 0) {
    return <div className="min-h-[60vh]" />;
  }

  // Auth gate — show prompt instead of redirecting so the modal can open
  if (!user) {
    return (
      <div className="max-w-360 mx-auto px-6 py-20 flex flex-col items-center gap-6 text-center">
        <UserIcon size={40} strokeWidth={1} className="text-muted-foreground" />
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">
            Sign in to continue
          </h1>
          <p className="text-sm text-muted-foreground">
            You need to be signed in to complete your purchase.
          </p>
        </div>
        <Button onClick={openAuthModal} className="px-8">
          Sign in
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: AddressForm) => {
    setServerError(null);
    try {
      const checkoutItems = items.map((i) => ({
        product_id: i.product.id,
        variant_id: i.variant.id,
        quantity: i.quantity,
      }));
      const { checkoutUrl } = await createOrder(checkoutItems, data);
      window.location.href = checkoutUrl;
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  };

  return (
    <div className="max-w-360 mx-auto px-6 py-12 lg:py-20">
      <h1 className="text-2xl font-semibold tracking-tight mb-10">Checkout</h1>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-20 items-start">
        {/* Shipping form */}
        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h2 className="text-label text-muted-foreground mb-6">
              Shipping address
            </h2>

            <div className="space-y-4">
              <Field label="Full name" error={errors.full_name?.message}>
                <input
                  {...register("full_name")}
                  type="text"
                  autoComplete="name"
                  className={inputClass}
                />
              </Field>

              <p className="text-xs text-muted-foreground -mt-2">
                Ordering as{" "}
                <span className="text-foreground">{user.email}</span>
              </p>

              <Field label="Address line 1" error={errors.line1?.message}>
                <input
                  {...register("line1")}
                  type="text"
                  autoComplete="address-line1"
                  placeholder="Street address, apt, suite…"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Address line 2 (optional)"
                error={errors.line2?.message}
              >
                <input
                  {...register("line2")}
                  type="text"
                  autoComplete="address-line2"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="City" error={errors.city?.message}>
                  <input
                    {...register("city")}
                    type="text"
                    autoComplete="address-level2"
                    className={inputClass}
                  />
                </Field>
                <Field label="State / Province" error={errors.state?.message}>
                  <input
                    {...register("state")}
                    type="text"
                    autoComplete="address-level1"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Postal code" error={errors.postal_code?.message}>
                  <input
                    {...register("postal_code")}
                    type="text"
                    autoComplete="postal-code"
                    className={inputClass}
                  />
                </Field>
                <Field label="Country" error={errors.country?.message}>
                  <input
                    {...register("country")}
                    type="text"
                    autoComplete="country-name"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </div>

          {serverError && (
            <p className="text-sm text-destructive border border-destructive/30 bg-destructive/5 px-4 py-3">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
            {isSubmitting ? "Redirecting to payment…" : "Proceed to payment"}
          </Button>
        </form>

        {/* Order summary */}
        <div className="lg:sticky lg:top-28 border border-border p-6">
          <OrderSummary items={items} total={total} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
};
