# MONO

Premium streetwear ecommerce built with Next.js (App Router), TypeScript, Tailwind CSS v4, Zustand, and Supabase.

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS v4** for styling
- **Zustand** for client state (cart)
- **Supabase** — Postgres database, auth, and storage
- **Stripe** — Checkout + payment webhook
- **Resend** — order confirmation / admin notification emails
- **TanStack Query**, **React Hook Form + Zod**, **shadcn/ui**

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then set up the database — see [Database setup](#database-setup) below.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the Supabase, Stripe, and Resend values — see the comments in `.env.local.example` for where to find each one.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin panel is at `/admin/login`.

To receive Stripe webhook events locally (required for orders to move past `pending` and for stock to decrement), run the Stripe CLI alongside the dev server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Database setup

All schema, seed, and setup SQL lives in [`supabase/`](supabase/). Run these in the **Supabase SQL Editor**, in order, on a fresh project:

| Order | File | What it does |
| --- | --- | --- |
| 1 | [`schema.sql`](supabase/schema.sql) | Full schema: enums, tables, indexes, triggers, the `decrement_order_stock` function, RLS policies, and the `product-images` storage bucket. Safe to run once on a fresh project. |
| 2 | [`seed.sql`](supabase/seed.sql) | Demo categories, products, and variants with randomized stock. Idempotent — safe to re-run. |
| 3 | [`create_admin.sql`](supabase/create_admin.sql) | Promotes a user to `admin`. **Edit the `admin_email` / `admin_password` variables at the top of the file before running.** Idempotent — safe to re-run (e.g. to reset the password). |

Each file is also idempotent-safe to re-run on its own (`create table` in `schema.sql` is the one exception — it expects an empty project), so re-running 2 and 3 after schema changes won't duplicate data.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint (Next.js core-web-vitals + TypeScript rules)
```

There is no test suite configured yet.

## Project structure

```
/app          → routes (store, product, cart, checkout, admin)
/components
  /ui         → generic components
  /shared     → reusable pieces
  /features   → domain-specific components
/lib
  /supabase   → client setup
  /services   → business logic
  /utils
/store        → Zustand stores
/hooks        → custom hooks
/types        → global types
```
