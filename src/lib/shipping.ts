/**
 * Flat-rate shipping simulation — no carrier integration yet.
 * Free above the threshold, flat fee otherwise. Pure function so it can be
 * shared between the cart UI (live preview) and the checkout server action
 * (source of truth for what gets charged).
 */
export const FREE_SHIPPING_THRESHOLD = 25000; // $250.00, in cents
export const FLAT_SHIPPING_RATE = 799; // $7.99, in cents

export const calculateShipping = (subtotal: number): number =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
