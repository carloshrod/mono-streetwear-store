"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteCategory } from "@/app/actions/admin/categories";
import { ConfirmDialog } from "@/components/features/admin/confirm-dialog";
import type { AdminCategory } from "@/lib/services/admin.server";

type PendingDelete = { id: string; name: string; productCount: number };

export const CategoriesTable = ({
  categories,
}: {
  categories: AdminCategory[];
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const { id, name } = pendingDelete;

    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteCategory(id);
      setDeletingId(null);
      setPendingDelete(null);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(`"${name}" deleted`);
      }
    });
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-black">
          All Categories{" "}
          <span className="font-normal text-neutral-400">
            ({categories.length})
          </span>
        </h2>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-1.5 text-xs font-medium bg-black text-white px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Plus size={13} />
          New Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="px-6 py-16 text-center space-y-3">
          <p className="text-sm text-neutral-400">No categories yet.</p>
          <Link
            href="/admin/categories/new"
            className="inline-block text-xs font-medium text-black underline underline-offset-4"
          >
            Create your first category
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                  Products
                </th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.map((c) => {
                const isDeleting = deletingId === c.id;
                return (
                  <tr
                    key={c.id}
                    className={`transition-opacity ${isDeleting ? "opacity-30 pointer-events-none" : ""}`}
                  >
                    <td className="px-6 py-3 font-medium text-black">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 font-mono text-xs">
                      {c.slug}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {c.productCount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/admin/categories/${c.id}/edit`}
                          className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
                          title="Edit category"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() =>
                            setPendingDelete({
                              id: c.id,
                              name: c.name,
                              productCount: c.productCount,
                            })
                          }
                          disabled={isDeleting}
                          className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors disabled:opacity-40"
                          title="Delete category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name}"?`}
        description={
          pendingDelete && pendingDelete.productCount > 0
            ? `${pendingDelete.productCount} product${pendingDelete.productCount > 1 ? "s" : ""} will lose this category. This cannot be undone.`
            : "This cannot be undone."
        }
        confirmLabel="Delete"
        isLoading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
