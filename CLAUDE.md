# AURA Hospitality Intelligence — Project Guide

Auto-loaded context file. Keep this updated after every meaningful change so future sessions don't need to re-explore the whole tree to get oriented. Update the "Current state" section whenever you finish a task; keep the rest stable unless the facts actually change.

## What this project is

AURA is an AI-driven hospitality finance platform: night audit automation, fraud detection, revenue-leakage recovery, employee risk scoring — for hotel groups. The full target architecture (from a diagram the user shared) has 6 layers:

1. **Hotel systems (data sources)** — OPERA/Fidelio (PMS), MICROS POS, SAP/1C ERP, CCTV/Access, Bank/Payroll, Wi-Fi/Firewall logs.
2. **Data Connectors** — pyodbc, REST API, file parsers, real-time streams.
3. **Data storage layer** — PostgreSQL (transactional), ClickHouse (analytics/OLAP), Redis (cache/queue), Celery (background tasks).
4. **AI Engine** (PyTorch, XGBoost, Scikit-learn, LangChain) — Night Audit AI, Finance AI/Revenue Leakage, Fraud Detection AI, Cybersecurity AI, HR AI/Behavioral.
5. **Alert Engine** — Telegram, Email, SMS, in-app notifications.
6. **Executive Dashboard** — React, Next.js, Tailwind CSS. Screens: GM Command center, Fraud alerts, Cyber incidents, Employee risk heatmap.

**Status:** layer 6 (dashboard) is built. Layer 3 (Postgres) has started — one real, DB-backed vertical slice exists (auth + Transactions screen), see below. The other 8 screens are still mock data. Layers 1, 2, 4, 5 (real hotel-system connectors, ClickHouse/Redis/Celery, the 5 AI models, alerting) are not built yet.

## Current state (updated 2026-07-25)

- **[aura-next/](aura-next/) is the live app** — Next.js 16 (App Router, Turbopack) + Tailwind CSS v4 frontend, with a real Postgres backend now started (see "Backend" below).
- **[aura-react/](aura-react/) is stale/superseded**, being removed by the user manually — don't rely on its presence, don't recreate it.
- **[AURA.dc.html](AURA.dc.html) + [support.js](support.js)** — the original design-tool export (custom `sc-if`/`sc-for`/`{{ }}` DSL + runtime). This is the **final, definitive visual design spec** — colors, gradients, copy, layout all trace back to it. If a visual discrepancy ever comes up, this file wins.
- **[docs/design-reference/](docs/design-reference/)** — the two source design-brief images that preceded `AURA.dc.html` (`liquid-glass-ui-design-prompt.png`, `liquid-glass-design-system.png`): palette hex codes, material spec, and extra components not yet built (FAB, dropdown, tabs, team/avatar card). These are the *initial* direction — where they conflict with `AURA.dc.html` (e.g. brief's `#30D158` success vs. the actually-used `#1f9268`), `AURA.dc.html` wins. Use these images for genuinely new UI with no existing precedent.

## Backend (started 2026-07-25)

**Database:** Neon (hosted Postgres, free tier), region ap-southeast-1. Connection string lives in `aura-next/.env.local` (gitignored) as `DATABASE_URL`. Also has `SESSION_SECRET` (random 32-byte string for signing session JWTs). Template at `aura-next/.env.example`.

**ORM:** Prisma 7. **This is a very new major version with breaking changes from the Prisma most training data knows** — the schema's `datasource` block no longer takes a `url`; connection config for the CLI lives in `aura-next/prisma.config.ts`, and the Prisma Client at runtime requires an explicit **driver adapter** (`@prisma/adapter-neon`, since we're on Neon) passed to `new PrismaClient({ adapter })` — see `src/lib/db.js`. Don't assume old Prisma docs/patterns apply; check https://www.prisma.io/docs or `node_modules/prisma` if something seems off.

**Seeding:** `npx prisma db seed` runs `prisma/seed.mjs` (the seed command is configured in `prisma.config.ts` under `migrations.seed`, not `package.json` — another Prisma 7 change). Seed creates: 1 dev user (`e.reyes@meridianhotels.com` / `aura-secure-2026` — dev-only credential, seeded via bcrypt hash), 6 properties (codes GM/BS/OT/HB/SM/RV matching the folio prefixes used throughout the mock data), and 32 sample transactions.

**Schema** (`aura-next/prisma/schema.prisma`): `User` (auth), `Property`, `Transaction` (with `TransactionFlag` enum: CLEARED/FLAGGED/REVIEW, `Decimal` amount). Minimal — only what the Transactions vertical slice needed. Extend per-screen as each one gets migrated off mock data.

**Auth:** custom-built, not a library (avoided NextAuth/Auth.js given how new Next.js 16 is — dependency compat risk). `src/lib/session.js` signs/verifies an httpOnly JWT cookie via `jose`. Routes: `POST /api/auth/login` (bcrypt-compares password, sets cookie), `POST /api/auth/logout` (clears cookie), `GET /api/auth/me` (used by `AuraApp` on mount to persist login across refresh). Passwords hashed with `bcryptjs`.

**API routes so far:** `GET /api/transactions?page=&pageSize=` — session-gated, paginated, backed by Prisma/Postgres. This replaced the hardcoded `txnRows` array for the Transactions screen only.

**Pattern for migrating another screen off mock data** (this is the repeatable shape, following the Transactions slice):
1. Add the Prisma model(s) it needs to `schema.prisma`, run `npx prisma migrate dev --name <desc>`, extend `prisma/seed.mjs`.
2. Add a session-gated Route Handler under `src/app/api/<resource>/route.js` that queries via `prisma` (`src/lib/db.js`) and returns plain JSON — don't bake presentation (colors, formatted strings) into the API response; that's the frontend's job.
3. Convert the screen component to `'use client'`, `fetch()` the route in a `useEffect`, and compute display formatting/colors client-side (see `src/lib/format.js` for the pattern: `formatAmount`, `amountColor`, `FLAG_META`, `initialsFromName` — add to this file rather than duplicating per-screen).
4. Remove the corresponding export from `src/lib/data.js` once nothing references it.

**Not done yet:** Dashboard, NightAudit, FraudDetection, RevenueLeakage, AlertsCenter, Employees, Reports, Settings are all still on hardcoded `src/lib/data.js` mock arrays. `AuraApp`'s `user` object (from session) only carries `id/email/name/role` — Settings screen still shows static profile fields, not wired to `user`.

## aura-next structure

- `src/app/page.js` — server component, just renders `AuraApp`.
- `src/components/AuraApp.jsx` — `'use client'`, owns all state: `user` (from session, null = logged out), `checkingSession`, `screen`, `collapsed` (sidebar), `mobileNavOpen`. Checks `GET /api/auth/me` on mount.
- `src/app/api/auth/{login,logout,me}/route.js`, `src/app/api/transactions/route.js` — Route Handlers, see "Backend" above.
- `src/lib/db.js` — Prisma client singleton (with Neon adapter). `src/lib/session.js` — JWT session cookie helpers. `src/lib/format.js` — shared display-formatting helpers for API data.
- `src/app/globals.css` — Tailwind v4 config-in-CSS. `@theme` block defines design tokens (see below). `@layer components` defines reusable classes: `.glass-card`, `.glass-panel`, `.glass-header`, `.glass-login`, `.soft-input`, `.btn-primary`, `.btn-ghost`, `.btn-outline`, `.icon-btn`, `.pill`, `.nav-item`/`.nav-item-active`, `.table-scroll`/`.table-min`.
- `src/lib/data.js` — remaining mock datasets for the not-yet-migrated screens (nav list, screen titles, fraud rows, employees, alerts, reports, heatmap data). `txnRows` was already removed (Transactions is DB-backed now).
- `src/components/Icon.jsx` — one SVG icon component, switched by `name` prop. No external icon library.
- `src/components/Background.jsx`, `LoginScreen.jsx` (now `'use client'`, real form), `Sidebar.jsx`, `Header.jsx` (now takes a `user` prop), `ScreenHeader.jsx` — layout chrome.
- `src/components/screens/*.jsx` — the 9 screens. `Transactions.jsx` is `'use client'` and fetches from the API; the other 8 are still server-renderable components reading static mock data.
- `prisma/schema.prisma`, `prisma/seed.mjs`, `prisma.config.ts` — see "Backend" above.

### Design tokens (in `globals.css` `@theme`)
Colors: `ink`, `ink-soft`, `body`, `muted`, `faint`, `faint-2`, `hairline` (grayscale text), `brand`/`brand-light`/`brand-dark`, `teal` (accent), `critical`/`critical-bg`, `warning`/`warning-bg`, `success`/`success-bg`, `info`/`info-bg` (status colors + their translucent backgrounds — these exact bg alpha values vary by usage, don't assume one token fits every case, check the original inline rgba if unsure).
Animations: `animate-float-blob(-rev/2/2-rev/-slow)`, `animate-drift-grid`, `animate-fade-up(-slow)`, `animate-pulse-dot`.

### Responsive breakpoints (intentionally non-default)
- `max-[860px]:` — sidebar becomes a fixed off-canvas drawer (hamburger menu appears in Header), triggered by `AuraApp`'s `mobileNavOpen` state.
- `sm:`/`lg:`/`xl:` (Tailwind defaults) — used for content grid column counts (stat cards, screen layouts).
- Dense data tables (Fraud rows, Transactions, Employees) use `.table-scroll > .table-min` (horizontal scroll below 761px) instead of collapsing columns.

## Known gotchas

- **Prisma 7 driver adapters** (see "Backend" above) — `new PrismaClient()` alone will NOT connect; it needs `{ adapter }`. `schema.prisma`'s datasource block has no `url`. Seed command config moved to `prisma.config.ts`.
- **Tailwind v4 + `backdrop-filter`:** never hand-write `-webkit-backdrop-filter` next to a plain `backdrop-filter` in `@layer components` — Lightning CSS (Tailwind v4's compiler) silently drops the unprefixed standard property when both are present, breaking the frosted-glass effect everywhere. Write only the unprefixed property and let Lightning CSS auto-prefix.
- **Next.js 16 is unusually new** (post-training-data). If App Router conventions ever seem to behave unexpectedly, check `aura-next/node_modules/next/dist/docs/` before assuming — `aura-next/AGENTS.md` flags this explicitly. Same caution applies to Prisma 7 (also very new) — verify against current docs rather than assumed/trained knowledge.
- Forcing a Tailwind utility to win over a JS-computed inline `style` (e.g. the sidebar's collapsed-width) requires the `!` important prefix (`max-[860px]:!w-[250px]`) — plain utility classes lose to inline styles.
- Settings inputs are still uncontrolled (`defaultValue`, no `onChange`) — intentional for now, matches the original mock; will need real wiring once Settings gets migrated off mock data.
- The seeded dev password (`aura-secure-2026`) is plaintext-obvious and fine for local dev only — don't ship it as-is to anything resembling production.

## Next steps

1. Migrate the remaining 8 screens off `src/lib/data.js` one at a time, following the pattern documented under "Backend" above. No fixed order decided — ask the user which screen next, or suggest one (Employees and Alerts are probably the next-simplest after Transactions).
2. Eventually: layers 1/2/4/5 from the target architecture (real hotel-system connectors, ClickHouse/Redis/Celery, the 5 AI models, alert delivery). Likely shape: Next.js Route Handlers calling out to a separate Python service for the ML-heavy pieces (PyTorch/XGBoost/LangChain don't belong in the Node runtime) — no decisions made yet, ask the user before assuming an approach.
