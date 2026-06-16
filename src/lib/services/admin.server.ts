import { createServiceClient } from "@/lib/supabase/service";
import { PRODUCT_SELECT } from "./product-select";
import type { Product, Category } from "@/types/product";
import type { Order } from "@/types/order";
import type { UserRole, Address } from "@/types/user";

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
 * Email lives only in auth.users (not profiles), and is only readable via
 * the admin API with the service-role key.
 */
const getEmailMap = async (
  supabase: ReturnType<typeof createServiceClient>
): Promise<Map<string, string | null>> => {
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  return new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? null]));
};

/**
 * profiles.id mirrors auth.users.id, but there's no FK from orders.user_id
 * to profiles, so PostgREST can't embed it automatically — resolved here
 * with a manual lookup.
 */
const attachCustomers = async (
  supabase: ReturnType<typeof createServiceClient>,
  orders: Order[]
): Promise<AdminOrder[]> => {
  const userIds = [...new Set(orders.map((o) => o.user_id))];

  const [{ data: profiles }, emailById] = await Promise.all([
    supabase.from("profiles").select("id, full_name, phone").in("id", userIds),
    getEmailMap(supabase),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

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

export type AdminCustomer = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  ordersCount: number;
  totalSpent: number; // in cents, excludes cancelled orders
};

export type AdminCustomerDetail = AdminCustomer & { orders: Order[] };

export const getAdminCustomers = async (): Promise<AdminCustomer[]> => {
  const supabase = createServiceClient();

  const [{ data: profiles, error }, { data: orders }, emailById] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, role, created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("user_id, total_amount, status, shipping_address")
      .order("created_at", { ascending: false }),
    getEmailMap(supabase),
  ]);

  if (error) throw new Error(`Failed to fetch customers: ${error.message}`);

  const statsByUser = new Map<string, { count: number; total: number }>();
  const nameByUser = new Map<string, string>();

  for (const o of orders ?? []) {
    const entry = statsByUser.get(o.user_id) ?? { count: 0, total: 0 };
    entry.count += 1;
    if (o.status !== "cancelled") entry.total += o.total_amount as number;
    statsByUser.set(o.user_id, entry);

    // profiles.full_name is never collected by the storefront — orders are
    // fetched newest-first, so the first one seen per user is their most
    // recent, and its shipping address name is the best available fallback.
    const shippingName = (o.shipping_address as Address | null)?.full_name;
    if (shippingName && !nameByUser.has(o.user_id)) {
      nameByUser.set(o.user_id, shippingName);
    }
  }

  return (profiles ?? []).map((p) => ({
    ...p,
    full_name: p.full_name ?? nameByUser.get(p.id) ?? null,
    email: emailById.get(p.id) ?? null,
    ordersCount: statsByUser.get(p.id)?.count ?? 0,
    totalSpent: statsByUser.get(p.id)?.total ?? 0,
  }));
};

export const getAdminCustomerById = async (
  id: string
): Promise<AdminCustomerDetail | null> => {
  const supabase = createServiceClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch customer: ${error.message}`);
  if (!profile) return null;

  const [{ data: orders }, emailById] = await Promise.all([
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    getEmailMap(supabase),
  ]);

  const ordersList = (orders ?? []) as Order[];
  const totalSpent = ordersList
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_amount, 0);

  return {
    ...profile,
    full_name: profile.full_name ?? ordersList[0]?.shipping_address.full_name ?? null,
    email: emailById.get(id) ?? null,
    ordersCount: ordersList.length,
    totalSpent,
    orders: ordersList,
  };
};

export type AdminCategory = Category & { productCount: number };

export const getAdminCategories = async (): Promise<AdminCategory[]> => {
  const supabase = createServiceClient();

  const [{ data: categories, error }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("products").select("category_id"),
  ]);

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);

  const countByCategory = new Map<string, number>();
  for (const p of products ?? []) {
    if (!p.category_id) continue;
    countByCategory.set(p.category_id, (countByCategory.get(p.category_id) ?? 0) + 1);
  }

  return (categories ?? []).map((c) => ({
    ...c,
    productCount: countByCategory.get(c.id) ?? 0,
  }));
};

export const getAdminCategoryById = async (id: string): Promise<Category | null> => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch category: ${error.message}`);
  return (data as Category | null) ?? null;
};
