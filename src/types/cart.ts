import type { Product, ProductVariant } from "./product";

export type CartItem = {
  product: Product;
  variant: ProductVariant; // size + stock selected by the user
  quantity: number;
};
