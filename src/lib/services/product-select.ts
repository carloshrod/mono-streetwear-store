/**
 * Shared column selection for product queries.
 * Lives in its own module (no client/server imports) so it can be reused by
 * both the browser-side service and the server-side service.
 */
export const PRODUCT_SELECT = `
  *,
  category:categories (*),
  variants:product_variants (*)
` as const;

/** Window for the "New" badge — products created within this are considered new. */
export const RECENT_PRODUCT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Attach the view-only `isNew` flag. Runs in the (async) data layer, not during
 * React render, so reading the current time here is safe.
 */
export const markIsNew = <T extends { created_at: string }>(product: T) => ({
  ...product,
  isNew: Date.now() - new Date(product.created_at).getTime() < RECENT_PRODUCT_WINDOW_MS,
});
