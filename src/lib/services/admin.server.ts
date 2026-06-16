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

const ORDER_SELECT = `
  *,
  items:order_items (
    *,
    product:products (name, images),
    variant:product_variants (size)
  )
` as const;

export const getAdminOrders = async (limit = 10): Promise<Order[]> => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch admin orders: ${error.message}`);
  return (data ?? []) as Order[];
};

export type OrderCustomer = {
  full_name: string | null;
  phone: string | null;
  email: string | null;
};

export type AdminOrder = Order & { customer: OrderCustomer };

/**
 * profiles.id mirrors auth.users.id, but there's no FK from orders.user_id
 * to profiles, so PostgREST can't embed it automatically — resolved here
 * with a manual lookup. Email lives only in auth.users, fetched via the
 * admin API (service-role only).
 */
const attachCustomers = async (
  supabase: ReturnType<typeof createServiceClient>,
  orders: Order[]
): Promise<AdminOrder[]> => {
  const userIds = [...new Set(orders.map((o) => o.user_id))];

  const [{ data: profiles }, { data: authData }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, phone").in("id", userIds),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const emailById = new Map(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? null])
  );

  return orders.map((o) => ({
    ...o,
    customer: {
      full_name: profileById.get(o.user_id)?.full_name ?? null,
      phone: profileById.get(o.user_id)?.phone ?? null,
      email: emailById.get(o.user_id) ?? null,
    },
  }));
};

export const getAdminOrdersList = async (): Promise<AdminOrder[]> => {
  const supabase = createServiceClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
  if (!orders || orders.length === 0) return [];

  return attachCustomers(supabase, orders as Order[]);
};

export const getAdminOrderById = async (id: string): Promise<AdminOrder | null> => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch order: ${error.message}`);
  if (!data) return null;

  const [order] = await attachCustomers(supabase, [data as Order]);
  return order;
};
