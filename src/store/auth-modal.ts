import { create } from "zustand";

type AuthModalState = {
  isOpen: boolean;
};

type AuthModalActions = {
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
};

export const useAuthModal = create<AuthModalState & AuthModalActions>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setOpen: (open) => set({ isOpen: open }),
}));
