import type { Address } from "./user";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number; // in cents — snapshot of price at purchase time
  // joined when fetched with select()
  product?: { name: string; images: string[] };
  variant?: { size: string };
};

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  shipping_address: Address;
  shipping_amount: number; // in cents — flat-rate or free, included in total_amount
  total_amount: number; // in cents
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};
