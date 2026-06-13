import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem } from "@/types/cart";
import type { Product, ProductVariant } from "@/types/product";

type CartState = {
  items: CartItem[];
};

type CartActions = {
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
};

export type CartStore = CartState & CartActions;

const matchItem = (item: CartItem, productId: string, variantId: string) =>
  item.product.id === productId && item.variant.id === variantId;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => matchItem(i, product.id, variant.id));

        if (existing) {
          set({
            items: items.map((i) =>
              matchItem(i, product.id, variant.id)
                ? { ...i, quantity: Math.min(i.quantity + quantity, variant.stock) }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { product, variant, quantity: Math.min(quantity, variant.stock) }],
          });
        }
      },

      removeItem: (productId, variantId) =>
        set({ items: get().items.filter((i) => !matchItem(i, productId, variantId)) }),

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            matchItem(i, productId, variantId)
              ? { ...i, quantity: Math.min(quantity, i.variant.stock) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "mono-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selectors — import these in components instead of deriving inline
export const selectTotalItems = (state: CartStore) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectTotalPrice = (state: CartStore) =>
  state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
