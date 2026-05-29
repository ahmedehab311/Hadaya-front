# Hadaya — هدايا Gift Platform

A unified Arabic/English gift e-commerce platform with a customer-facing store and an admin dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/hadaya run dev` — run the frontend (port 19548, served at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build composite libs (must run before API server typecheck)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed the database with sample data
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Frontend**: React 19 + Vite, Tailwind CSS v4, shadcn/ui, wouter routing
- **API**: Express 5 (`artifacts/api-server`, port 8080, base path `/api`)
- **DB**: PostgreSQL + Drizzle ORM (`lib/db`)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- **Generated hooks**: `lib/api-client-react`, **Zod schemas**: `lib/api-zod`
- **Build**: esbuild (CJS bundle for API server)
- **Fonts**: Amiri (Arabic/serif) + Plus Jakarta Sans (Latin)

## Where things live

```
artifacts/hadaya/src/
  App.tsx                     — root router (wouter) + providers
  index.css                   — Tailwind + CSS vars (warm rose gold/ivory palette)
  contexts/                   — language-context, theme-context, cart-context
  components/
    store-layout.tsx           — public store header/footer + nav
    admin-layout.tsx           — collapsible sidebar admin shell
    product-card.tsx           — reusable product card with add-to-cart
  pages/
    home.tsx / products.tsx / product-detail.tsx
    collections.tsx / collection-detail.tsx
    cart.tsx / checkout.tsx / order-status.tsx / gift.tsx
    admin/dashboard.tsx / orders.tsx / products.tsx / collections.tsx / settings.tsx

artifacts/api-server/src/routes/
  products.ts / collections.ts / orders.ts / gift.ts
  admin/dashboard.ts / orders.ts / products.ts / collections.ts / settings.ts

lib/db/src/schema/
  collections.ts / products.ts / orders.ts / settings.ts
  index.ts                    — re-exports all tables

lib/api-spec/openapi.yaml     — source of truth for API contract
```

## Architecture decisions

- **RTL/LTR**: `LanguageProvider` sets `<html dir>` and `<html lang>` on language change; Tailwind uses logical properties (`start`/`end`) throughout
- **Bilingual**: Every UI string is `t("العربي", "English")` — always both forms
- **Dark mode**: `.dark` class on `<html>` toggled by `ThemeProvider`; CSS vars defined in `:root` and `.dark` blocks
- **Cart**: Client-side only, persisted to `localStorage`
- **Admin settings**: Uses `ensureSettings()` to upsert the single settings row (no WHERE undefined bug)
- **Libs must be built before API server typecheck**: `pnpm run typecheck:libs` emits `.d.ts` declarations that the API server references

## Product

- **Customer store**: Home with featured products + collections hero, product listing with collection/search filter, product detail, cart, 3-step checkout, order status page
- **Gift flow**: Create order as gift → unique token link → recipient enters their address at `/gift/:token`
- **Admin panel**: Dashboard with stats + order status chart + activity feed, full order management (filter + status update), product CRUD, collection CRUD, store settings

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` — the API server depends on declaration files emitted by the composite libs
- Google Fonts are loaded via `<link>` in `index.html`, NOT via `@import` in CSS (PostCSS rejects late `@import`)
- `settingsTable` uses `ensureSettings()` to auto-create the first row; never call `.update()` without an explicit `WHERE` clause using `sql\`id = ${id}\``
- `pnpm run dev` at workspace root does not exist by design — start workflows individually or via Replit workflow panel

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
