"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct } from "@/app/actions/admin/products";
import { formatPrice } from "@/lib/utils";
import { ConfirmDialog } from "@/components/features/admin/confirm-dialog";
import type { Product, ProductStatus } from "@/types/product";

const STATUS_STYLES: Record<ProductStatus, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
  archived: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

export const ProductsTable = ({ products }: { products: Product[] }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const { id, name } = pendingDelete;

    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteProduct(id);
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
          All Products{" "}
          <span className="font-normal text-neutral-400">({products.length})</span>
        </h2>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 text-xs font-medium bg-black text-white px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Plus size={13} />
          New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="px-6 py-16 text-center space-y-3">
          <p className="text-sm text-neutral-400">No products yet.</p>
          <Link
            href="/admin/products/new"
            className="inline-block text-xs font-medium text-black underline underline-offset-4"
          >
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide w-14" />
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                  Price
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                  Stock
                </th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((p) => {
                const totalStock = (p.variants ?? []).reduce(
                  (s, v) => s + v.stock,
                  0
                );
                const isDeleting = deletingId === p.id;

                return (
                  <tr
                    key={p.id}
                    className={`transition-opacity ${isDeleting ? "opacity-30 pointer-events-none" : ""}`}
                  >
                    <td className="px-6 py-3">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-neutral-100 shrink-0">
                        {p.images[0] && (
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black leading-tight">
                        {p.name}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                        {p.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums text-black">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 text-sm">
                      {p.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${totalStock === 0 ? "text-red-500" : "text-neutral-600"}`}
                      >
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
                          title="Edit product"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => setPendingDelete({ id: p.id, name: p.name })}
                          disabled={isDeleting}
                          className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors disabled:opacity-40"
                          title="Delete product"
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
        description="This cannot be undone."
        confirmLabel="Delete"
        isLoading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
