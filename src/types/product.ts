export type ProductStatus = "active" | "draft" | "archived";

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  created_at: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number; // in cents — avoids floating-point issues
  category_id: string;
  images: string[]; // Supabase Storage public URLs
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  category?: Category;
  variants?: ProductVariant[];
  /**
   * View-only flag derived in the data layer (not stored in the DB):
   * true when the product was created within the recent-window.
   */
  isNew?: boolean;
};
