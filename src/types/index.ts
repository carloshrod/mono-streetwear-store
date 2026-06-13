export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  created_at: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  size?: string;
};

export type Order = {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};
