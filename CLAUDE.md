# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint (Next.js core-web-vitals + TypeScript rules)
```

There is no test suite configured yet.

## Project Context (IMPORTANT)

This project is a **streetwear ecommerce** called **MONO**.

The goal is to build a **production-ready application** that looks premium.

This is NOT a demo project. All code should follow real-world best practices.

---

## Tech Stack (DO NOT CHANGE)

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- Zustand (global state)
- Supabase (database, auth, storage)

Preferred additions:

- TanStack Query (data fetching)
- React Hook Form + Zod (forms & validation)
- lucide-react (icons)

---

## Development Rules

- Always write clean, modular, and scalable code
- Avoid large components (split into smaller pieces)
- Separate UI from business logic
- Use hooks or services for logic
- Use TypeScript strictly (no `any`)
- Prefer server components unless interactivity is needed
- Use arrow functions for components

---

## Architecture Guidelines

When generating code, always follow this structure:

- `/app` → routes (store, product, cart, checkout, admin)
- `/components`
  - `/ui` → generic components
  - `/shared` → reusable pieces
  - `/features` → domain-specific components

- `/lib`
  - `/supabase` → client setup
  - `/services` → business logic
  - `/utils`

- `/store` → Zustand stores
- `/hooks` → custom hooks
- `/types` → global types

---

## Ecommerce Scope

The app should include:

- Product listing page
- Product detail page
- Shopping cart (Zustand)
- Checkout flow
- Authentication (Supabase)
- Orders system
- Basic admin panel

---

## UI / Design Direction

- Style: minimal, premium streetwear
- Colors: black, white, neutral tones
- Typography: bold and modern
- Layout: clean, lots of whitespace

---

## Supabase Rules

- Use Supabase for auth, DB, and storage
- Always assume Row Level Security (RLS) is enabled
- Never expose sensitive operations on the client
- Prefer server-side operations when possible

---

## Output Expectations

When asked to generate code:

- Provide production-ready code (not pseudo-code)
- Follow folder structure strictly
- Explain only when necessary
- Prioritize clean architecture over quick hacks
