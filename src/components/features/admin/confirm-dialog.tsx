"use client";

import { Dialog } from "@base-ui/react/dialog";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
};

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  isLoading = false,
  onConfirm,
}: Props) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-[100] bg-black/50 transition-opacity duration-200",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center p-4",
            "transition-opacity duration-200",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
          )}
        >
          <div className="relative w-full max-w-sm bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-start gap-3">
              {destructive && (
                <div className="shrink-0 flex items-center justify-center size-9 rounded-full bg-red-50 text-red-600">
                  <AlertTriangle size={17} />
                </div>
              )}
              <div className="min-w-0">
                <Dialog.Title className="text-sm font-semibold text-black">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="text-sm text-neutral-500 mt-1">
                    {description}
                  </Dialog.Description>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="text-sm font-medium text-neutral-600 hover:text-black transition-colors px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50",
                  destructive
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-black text-white hover:bg-neutral-800"
                )}
              >
                {isLoading ? "Please wait…" : confirmLabel}
              </button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
