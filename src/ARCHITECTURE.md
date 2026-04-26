# Dalankotha Web — Source Code Architecture Guide

> **For AI Agents and Human Engineers:** Read this before adding new files to understand where code belongs.

---

## Folder Contract

```
src/
├── app/                  — Next.js App Router pages, layouts, and API routes
│   ├── api/              — Server-side API endpoints (Edge-compatible)
│   │   └── ai/           — AI Consultant and Chat streaming routes
│   ├── admin/            — Admin dashboard pages (role-protected)
│   ├── partner/          — Partner/seller dashboard pages
│   └── [feature]/        — Consumer-facing pages
│
├── components/           — Reusable React UI components
│   ├── ui/               — Primitive/atomic components (buttons, inputs, etc.)
│   ├── layout/           — Header, Footer, Navigation
│   ├── sections/         — Full-page/hero-level sections
│   ├── admin/            — Admin-specific composite components
│   ├── ai/               — AI Consultant chat UI components
│   ├── design/           — Design booking flow components
│   └── [feature]/        — Feature-scoped components
│
├── services/             — Supabase data access layer (queries + mutations)
│   ├── orderService.ts   — Order CRUD and workflow operations
│   ├── productService.ts — Product listing and details
│   └── ...               — One service file per domain entity
│
├── context/              — React Context providers (use sparingly)
│   ├── LanguageContext.tsx  — ✅ Language toggle (theme-level, correct here)
│   └── translations.ts     — Bilingual string map (Bengali / English)
│
├── store/                — Zustand global state stores (preferred over Context)
│   └── comparisonStore.ts  — Product comparison state
│
├── hooks/                — Custom React hooks (composable, reusable)
│   └── useDebounce.ts
│
├── utils/                — Pure utilities and integrations
│   ├── supabase/         — Supabase client instantiation (client/server/admin)
│   ├── designTranslations.ts — Booking flow bilingual strings
│   ├── errorUtils.ts     — Standardized error formatting
│   └── localization.ts   — Number/date formatting helpers
│
├── lib/                  — Shared pure functions (no side effects, no React)
│   └── utils.ts          — General purpose helpers (cn(), etc.)
│
├── types/                — Shared TypeScript interfaces and enums
├── data/                 — Static data / seed constants (not DB calls)
└── scripts/              — Build/migration support scripts (not deployed)
```

---

## Decision Rules — Where Does My Code Go?

| I'm writing... | It goes in... |
|---|---|
| A new page or route | `app/[feature]/page.tsx` |
| A server API endpoint | `app/api/[domain]/route.ts` |
| A UI component used in 2+ places | `components/[feature]/` |
| A data query (reads from Supabase) | `services/[entity]Service.ts` |
| Global app state (cart, user) | `store/[feature]Store.ts` (Zustand) |
| Theme / language state | `context/` (React Context) |
| A reusable hook | `hooks/use[Name].ts` |
| A pure utility function | `lib/utils.ts` or `utils/[name].ts` |
| A TypeScript type/interface | `types/[domain].ts` |

---

## State Management Rule

> **Use Zustand for all global state.** Only use React Context for theme-level concerns (language, color mode) that must wrap the entire app tree.

**Zustand** (`src/store/`):
- Cart contents and item count
- Comparison list
- User session supplements (beyond what Supabase Auth provides)

**React Context** (`src/context/`):
- Language toggle (Bengali ↔ English)
- *(Nothing else should be added here)*

---

## API Route Rules

- All API routes live in `src/app/api/`
- Use the **server-side Supabase client** (`@/utils/supabase/server`) inside route handlers
- Never use the **browser client** (`@/utils/supabase/client`) in API routes
- Always handle errors and return structured JSON with appropriate HTTP status codes
- AI streaming routes must export `export const maxDuration = 60` for Vercel

---

## Security Rules (Repeat from Tech Stack doc)

1. **Never** use the service role key on the client side
2. **Always** use `process.env.NEXT_PUBLIC_SUPABASE_URL` — no hard-coding credentials
3. **Trust RLS, not UI** — assume any client can call any API route
4. Admin routes must verify role via `createAdminClient()` + server-side check

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component file | PascalCase | `ProductCard.tsx` |
| Hook file | camelCase with `use` prefix | `useDebounce.ts` |
| Service file | camelCase + `Service` suffix | `orderService.ts` |
| Store file | camelCase + `Store` suffix | `cartStore.ts` |
| API route | Always `route.ts` | `app/api/ai/consult/route.ts` |
| Type file | PascalCase or domain name | `booking.ts`, `OrderItem.ts` |
