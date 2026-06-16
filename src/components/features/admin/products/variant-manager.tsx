"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, X } from "lucide-react";

type VariantField = { size: string; stock: number };
type FormWithVariants = { variants: VariantField[] };

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

export const VariantManager = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormWithVariants>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // Live values (not just defaults) so the per-row dropdown options react
  // as the user picks sizes, preventing duplicates from ever being selected.
  const watchedVariants = useWatch({ control, name: "variants" });

  const usedSizes = (watchedVariants ?? [])
    .map((v) => v?.size)
    .filter((s): s is string => Boolean(s));

  const unusedSizes = COMMON_SIZES.filter((s) => !usedSizes.includes(s));
  const allSizesUsed = unusedSizes.length === 0;

  const availableSizesFor = (index: number) => {
    const usedByOthers = (watchedVariants ?? [])
      .filter((_, i) => i !== index)
      .map((v) => v?.size)
      .filter((s): s is string => Boolean(s));
    return COMMON_SIZES.filter((s) => !usedByOthers.includes(s));
  };

  const variantErrors = errors.variants as
    | ({ size?: { message?: string }; stock?: { message?: string } }[] | { message?: string })
    | undefined;
  const rootError =
    variantErrors && "message" in variantErrors ? variantErrors.message : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => append({ size: "", stock: 0 })}
          disabled={allSizesUsed}
          title={allSizesUsed ? "All available sizes have been added" : undefined}
          className="flex items-center gap-1.5 text-xs font-medium text-black hover:text-neutral-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-black"
        >
          <Plus size={13} />
          Add size
        </button>
      </div>

      {fields.length === 0 && (
        <>
          <p className="text-xs text-neutral-400">
            No sizes yet. Pick from the available sizes below.
          </p>
          <div className="flex flex-wrap gap-2">
            {unusedSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => append({ size, stock: 0 })}
                className="text-xs border border-dashed border-neutral-300 rounded-lg px-3 py-1.5 text-neutral-500 hover:border-black hover:text-black transition-colors"
              >
                + {size}
              </button>
            ))}
          </div>
        </>
      )}

      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((field, index) => {
            const options = availableSizesFor(index);
            return (
              <div key={field.id} className="flex items-center gap-3">
                <select
                  {...register(`variants.${index}.size`)}
                  className="flex-1 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
                >
                  <option value="">Select size</option>
                  {options.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-neutral-400">Stock</span>
                  <input
                    type="number"
                    min="0"
                    {...register(`variants.${index}.stock`, {
                      valueAsNumber: true,
                    })}
                    className="w-20 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
                  title="Remove size"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {rootError && <p className="text-xs text-red-500">{rootError}</p>}
    </div>
  );
};
