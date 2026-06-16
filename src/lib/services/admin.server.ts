import { createServiceClient } from "@/lib/supabase/service";
import { PRODUCT_SELECT } from "./product-select";
import type { Product } from "@/types/product";
import type { Order } from "@/types/order";

export type AdminStats = {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  totalOrders: number;
  totalRevenue: number; // in cents
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const supabase = createServiceClient();

  const [
    { count: totalProducts },
    { count: activeProducts },
    { count: draftProducts },
    { data: orders },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("orders").select("total_amount"),
  ]);

  const totalRevenue = (orders ?? []).reduce((sum, o) => sum + (o.total_amount as number), 0);

  return {
    totalProducts: totalProducts ?? 0,
    activeProducts: activeProducts ?? 0,
    draftProducts: draftProducts ?? 0,
    totalOrders: orders?.length ?? 0,
    totalRevenue,
  };
};

export const getAdminProducts = async (): Promise<Product[]> => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch admin products: ${error.message}`);
  return (data ?? []) as Product[];
};

export const getAdminProductById = async (id: string): Promise<Product | null> => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch product: ${error.message}`);
  return (data as Product | null) ?? null;
};

export const getAdminOrders = async (limit = 10): Promise<Order[]> => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `*, items:order_items (
        *,
        product:products (name, images),
        variant:product_variants (size)
      )`
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch admin orders: ${error.message}`);
  return (data ?? []) as Order[];
};
