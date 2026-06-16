"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/app/actions/admin/products";
import { VariantManager } from "./variant-manager";
import { ImageManager } from "./image-manager";
import type { Product, Category } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  category_id: z.string().min(1, "Category is required"),
  gender: z.enum(["men", "women", "unisex"]),
  status: z.enum(["active", "draft", "archived"]),
  images: z
    .array(z.string())
    .min(2, "Add at least 2 images")
    .max(5, "A maximum of 5 images is allowed"),
  variants: z
    .array(
      z.object({ size: z.string().min(1), stock: z.number().int().min(0) }),
    )
    .min(1, "At least one size is required")
    .refine(
      (variants) =>
        new Set(variants.map((v) => v.size)).size === variants.length,
      { message: "Duplicate sizes are not allowed" },
    ),
});

type FormValues = z.infer<typeof schema>;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type Props = {
  product?: Product;
  categories: Category[];
};

export const ProductForm = ({ product, categories }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugEdited, setSlugEdited] = useState(!!product);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price / 100,
          category_id: product.category_id,
          gender: product.gender,
          status: product.status,
          images: product.images,
          variants:
            product.variants?.map(({ size, stock }) => ({ size, stock })) ?? [],
        }
      : {
          name: "",
          slug: "",
          description: "",
          price: 0,
          category_id: "",
          gender: "unisex",
          status: "draft",
          images: [],
          variants: [],
        },
  });

  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form;

  const watchedName = useWatch({ control, name: "name" });
  const images = useWatch({ control, name: "images" });

  useEffect(() => {
    if (!slugEdited) {
      setValue("slug", slugify(watchedName), { shouldValidate: false });
    }
  }, [watchedName, slugEdited, setValue]);

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, price: Math.round(values.price * 100) };

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(product ? "Product updated" : "Product created");
        router.push("/admin/products");
      }
    });
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl"
      >
        {/* Basic Info */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-black uppercase tracking-wide border-b border-neutral-100 pb-3">
            Basic Information
          </h2>

          <Field label="Name" error={errors.name?.message}>
            <input
              {...register("name")}
              placeholder="e.g. Oversized Cargo Pants"
              className={input()}
            />
          </Field>

          <Field label="Slug" error={errors.slug?.message}>
            <input
              {...register("slug")}
              onFocus={() => setSlugEdited(true)}
              placeholder="oversized-cargo-pants"
              className={`${input()} font-mono text-xs`}
            />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Product description..."
              className={`${input()} resize-none`}
            />
          </Field>
        </section>

        {/* Pricing & Details */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-black uppercase tracking-wide border-b border-neutral-100 pb-3">
            Pricing & Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (USD)" error={errors.price?.message}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { valueAsNumber: true })}
                  className={`${input()} pl-7`}
                />
              </div>
            </Field>

            <Field label="Category" error={errors.category_id?.message}>
              <select {...register("category_id")} className={select()}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Gender" error={errors.gender?.message}>
              <select {...register("gender")} className={select()}>
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </Field>

            <Field label="Status" error={errors.status?.message}>
              <select {...register("status")} className={select()}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Images */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-black uppercase tracking-wide border-b border-neutral-100 pb-3">
            Images
          </h2>

          <ImageManager
            images={images}
            onChange={(imgs) =>
              setValue("images", imgs, { shouldValidate: true })
            }
            error={errors.images?.message}
          />
        </section>

        {/* Variants */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="text-xs font-semibold text-black uppercase tracking-wide border-b border-neutral-100 pb-3 mb-5">
            Sizes & Stock
          </h2>
          <VariantManager />
        </section>

        {/* Submit */}
        <div className="flex items-center gap-4 pb-8">
          <button
            type="submit"
            disabled={isPending}
            className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending
              ? "Saving..."
              : product
                ? "Save Changes"
                : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-neutral-500 hover:text-black transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

// ── Local helpers ──────────────────────────────────────────────────────────────

const input = () =>
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-neutral-300";

const select = () =>
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white";

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
