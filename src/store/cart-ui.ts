import { create } from "zustand";

/**
 * UI-only state for the cart drawer. Kept separate from the cart data store
 * so opening/closing the drawer never touches persisted cart contents.
 */
type CartUIState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
};

export const useCartUI = create<CartUIState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setOpen: (isOpen) => set({ isOpen }),
}));
