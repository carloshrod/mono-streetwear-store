-- ============================================================
-- Migrate CHECK constraint columns to proper PostgreSQL enums
-- ============================================================

-- 1. Create enum types
CREATE TYPE user_role      AS ENUM ('customer', 'admin');
CREATE TYPE product_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE product_gender AS ENUM ('men', 'women', 'unisex');
CREATE TYPE order_status   AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- 2. Drop ALL policies that reference any column being altered
DROP POLICY IF EXISTS "Anyone can view active products"           ON public.products;
DROP POLICY IF EXISTS "Admins can manage products"               ON public.products;
DROP POLICY IF EXISTS "Anyone can view variants of active products" ON public.product_variants;
DROP POLICY IF EXISTS "Admins can manage variants"               ON public.product_variants;
DROP POLICY IF EXISTS "Admins can manage all orders"             ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all order items"        ON public.order_items;

-- 3. Drop existing check constraints (auto-named by Postgres)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_gender_check;
ALTER TABLE public.orders   DROP CONSTRAINT IF EXISTS orders_status_check;

-- 4. profiles.role
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING role::user_role;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer'::user_role;

-- 5. products.status + gender
ALTER TABLE public.products ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN status TYPE product_status USING status::product_status;
ALTER TABLE public.products ALTER COLUMN status SET DEFAULT 'draft'::product_status;

ALTER TABLE public.products ALTER COLUMN gender DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN gender TYPE product_gender USING gender::product_gender;
ALTER TABLE public.products ALTER COLUMN gender SET DEFAULT 'men'::product_gender;

-- 6. orders.status
ALTER TABLE public.orders ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.orders ALTER COLUMN status TYPE order_status USING status::order_status;
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending'::order_status;

-- 7. Recreate all dropped policies
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can view variants of active products"
  ON public.product_variants FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND status = 'active')
  );

CREATE POLICY "Admins can manage variants"
  ON public.product_variants FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage all order items"
  ON public.order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
