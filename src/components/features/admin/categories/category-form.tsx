"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/app/actions/admin/categories";
import type { Category } from "@/types/product";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
});

type FormValues = z.infer<typeof schema>;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type Props = { category?: Category };

export const CategoryForm = ({ category }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugEdited, setSlugEdited] = useState(!!category);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: category
      ? { name: category.name, slug: category.slug }
      : { name: "", slug: "" },
  });

  const watchedName = watch("name");

  useEffect(() => {
    if (!slugEdited) {
      setValue("slug", slugify(watchedName), { shouldValidate: false });
    }
  }, [watchedName, slugEdited, setValue]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = category
        ? await updateCategory(category.id, values)
        : await createCategory(values);

      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(category ? "Category updated" : "Category created");
        router.push("/admin/categories");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
            Name
          </label>
          <input
            {...register("name")}
            placeholder="e.g. Outerwear"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-neutral-300"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
            Slug
          </label>
          <input
            {...register("slug")}
            onFocus={() => setSlugEdited(true)}
            placeholder="outerwear"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          {errors.slug && (
            <p className="text-xs text-red-500">{errors.slug.message}</p>
          )}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          {isPending
            ? "Saving..."
            : category
              ? "Save Changes"
              : "Create Category"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-neutral-500 hover:text-black transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
