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
