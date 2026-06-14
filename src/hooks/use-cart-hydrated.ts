import { useSyncExternalStore } from "react";

import { useCartStore } from "@/store/cart";

/**
 * Returns whether the persisted cart store has finished rehydrating from
 * localStorage. Modeled as an external store via `useSyncExternalStore`:
 * the server snapshot is always `false`, so server-rendered markup (empty
 * cart) matches the first client render and avoids hydration mismatches.
 */
const subscribe = (onChange: () => void) =>
  useCartStore.persist.onFinishHydration(onChange);

const getSnapshot = () => useCartStore.persist.hasHydrated();

const getServerSnapshot = () => false;

export const useCartHydrated = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
