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

**Status:** layer 6 (dashboard) is fully built and, as of 2026-07-25, **every one of its 9 screens is backed by real Postgres data** (layer 3 started) — no more hardcoded mock arrays anywhere in the app. Layers 1, 2, 4, 5 (real hotel-system connectors, ClickHouse/Redis/Celery, the 5 AI models, alerting) are still not built — see "Known simplifications" below for exactly what's faked vs. real within layer 3.

## Current state (updated 2026-07-25)

- **[aura-next/](aura-next/) is the live app** — Next.js 16 (App Router, Turbopack) + Tailwind CSS v4, fully wired to Postgres via Prisma. This is the only frontend now; there is no mock-data fallback left.
- **[aura-react/](aura-react/) is stale/superseded**, being removed by the user manually — don't rely on its presence, don't recreate it.
- **[AURA.dc.html](AURA.dc.html) + [support.js](support.js)** — the original design-tool export (custom `sc-if`/`sc-for`/`{{ }}` DSL + runtime). This is the **final, definitive visual design spec** — colors, gradients, copy, layout all trace back to it. If a visual discrepancy ever comes up, this file wins.
- **[docs/design-reference/](docs/design-reference/)** — the two source design-brief images that preceded `AURA.dc.html` (`liquid-glass-ui-design-prompt.png`, `liquid-glass-design-system.png`): palette hex codes, material spec, and extra components not yet built (FAB, dropdown, tabs, team/avatar card). These are the *initial* direction — where they conflict with `AURA.dc.html`, `AURA.dc.html` wins. Use these images for genuinely new UI with no existing precedent.

## Backend

**Database:** Neon (hosted Postgres, free tier), region ap-southeast-1. Connection string lives in `aura-next/.env.local` (gitignored) as `DATABASE_URL`. Also has `SESSION_SECRET` (random 32-byte string for signing session JWTs). Template at `aura-next/.env.example`. **Neon free tier auto-suspends when idle** — the first Prisma command after a period of inactivity commonly fails once with `P1001`/`P1017` and succeeds on immediate retry while the compute wakes up; this is expected, not a real connectivity bug.

**ORM:** Prisma 7. **Very new major version, breaking changes from what most training data knows:**
- `schema.prisma`'s `datasource` block has no `url` — connection config for the CLI lives in `aura-next/prisma.config.ts` (a `defineConfig({ datasource: { url: env('DATABASE_URL') } })` call, loaded via `dotenv` reading `.env.local` explicitly since Prisma CLI doesn't auto-read `.env.local`).
- The Prisma Client at runtime requires an explicit **driver adapter** (`@prisma/adapter-neon`, since we're on Neon) passed to `new PrismaClient({ adapter })` — see `src/lib/db.js`.
- **After every `schema.prisma` change you must run `npx prisma generate` separately** — `migrate dev` does not reliably regenerate the client in this setup; forgetting this produces `Unknown argument` / `Cannot read properties of undefined` errors on fields/models that clearly exist in the schema.
- The seed command moved from `package.json`'s `"prisma"` key into `prisma.config.ts` under `migrations.seed` (currently `"node prisma/seed.mjs"`).
- Adding a required (non-null, no-default) column to a table that already has rows will make `prisma migrate dev` refuse to run. Fix by using `--create-only` to generate the SQL file, hand-editing it to add the column nullable + `UPDATE ... SET` backfill + `ALTER ... SET NOT NULL`, then `prisma migrate dev` again to apply it. Don't reach for `migrate reset` to dodge this — it drops all data and is blocked by the auto-mode permission classifier as destructive; the create-only + backfill path is the correct non-destructive fix, used for `Property.shortName` in migration `20260725074452_add_screen_models`.
- Don't assume old Prisma docs/patterns apply generally; check https://www.prisma.io/docs if something seems off.

**Seeding:** `npx prisma db seed` runs `prisma/seed.mjs`, which is idempotent (deletes-then-recreates each table's rows, `upsert`s Users/Properties by unique key) so it's safe to re-run. Seeds: 1 dev user (`e.reyes@meridianhotels.com` / `aura-secure-2026` — dev-only credential), 6 properties (codes GM/BS/OT/HB/SM/RV, each with a `name` and a shorter `shortName` used in table/card display), 32 transactions, 6 employees, 6 fraud cases, 5 leakage categories, 7 alerts, 1 night audit run with 6 checklist items, 6 report definitions, 3 insights, 42 property risk scores (6 properties × 7 days), 1 dashboard snapshot.

**Schema** (`aura-next/prisma/schema.prisma`) — one model per screen's data, all seeded and API-backed:
- `User` — auth + profile + notification prefs (`twoFactorEnabled`, `criticalAlertsEmail`, `weeklyDigest`) + `defaultPropertyId`.
- `Property` — `code`, `name`, `shortName`; referenced by Transaction/Employee/FraudCase/PropertyRiskScore/User.
- `Transaction` — Transactions screen. `TransactionFlag` enum (CLEARED/FLAGGED/REVIEW).
- `Employee` — Employees screen. `RiskBand` enum (LOW/MEDIUM/HIGH).
- `FraudCase` — Fraud Detection screen. `FraudSeverity` enum (CRITICAL/HIGH/MEDIUM).
- `LeakageCategory` — Revenue Leakage screen's category breakdown.
- `Alert` — Alerts Center screen + Dashboard's "Recent Alerts". `AlertSeverity` enum (CRITICAL/WARNING/INFO).
- `NightAuditRun` + `ChecklistItem` (1:many) — Night Audit screen. `ChecklistStatus` enum (DONE/WARNING/CRITICAL/PENDING).
- `ReportDefinition` — Reports screen cards.
- `Insight` — Dashboard's "AI Insights" cards. `InsightType` enum (CRITICAL/OPPORTUNITY/TREND).
- `PropertyRiskScore` — Dashboard's property risk heatmap (`propertyId` + `dayIndex` 0–6 + `score` 0–1).
- `DashboardSnapshot` — Dashboard's 4 top stat cards (portfolio revenue, fraud alert count, leakage, night-audit %). Single seeded row — see "Known simplifications" for why this isn't a live aggregate.

**Auth:** custom-built, not a library (avoided NextAuth/Auth.js given how new Next.js 16 is — dependency compat risk). `src/lib/session.js` signs/verifies an httpOnly JWT cookie via `jose`. Routes: `POST /api/auth/login` (bcrypt-compares password, sets cookie), `POST /api/auth/logout` (clears cookie), `GET /api/auth/me` (used by `AuraApp` on mount to persist login across refresh). Passwords hashed with `bcryptjs`.

**API routes (all session-gated via `getSession()`, all under `src/app/api/`):**
- `auth/login`, `auth/logout`, `auth/me` — see "Auth" above.
- `transactions` — `GET ?page=&pageSize=`, paginated.
- `employees`, `fraud-cases`, `reports` — `GET`, full list.
- `alerts` — `GET ?limit=`, most-recent-first.
- `leakage` — `GET`, returns categories + identified/recovered totals + recovery rate.
- `night-audit` — `GET`, latest run + its checklist items.
- `dashboard` — `GET`, composes snapshot + insights + 4 most-recent alerts + heatmap (grouped by property, ordered to match seed insertion order via `orderBy: [{ property: { createdAt: 'asc' } }, { dayIndex: 'asc' }]` — don't drop that property-level ordering or the heatmap row order becomes nondeterministic).
- `user/profile` — `GET` full profile incl. `defaultProperty` + prefs; `PATCH` updates `name` and the three notification-pref booleans (email/role/defaultProperty are intentionally not user-editable here).

All routes return plain JSON with raw values (numbers, ISO dates, enum strings) — no colors or formatted strings baked in server-side. Every screen computes its own display formatting/colors client-side via `src/lib/format.js`: `formatTime`, `formatAmount`, `amountColor`, `formatRelativeDay`, `timeAgo`, `initialsFromName`, and the `*_META` color-lookup objects (`FLAG_META`, `FRAUD_SEVERITY_META`, `RISK_BAND_META`, `ALERT_SEVERITY_META`, `CHECKLIST_STATUS_META`). Add to this file rather than duplicating formatting logic per-screen.

**`src/lib/data.js` now only holds `navList` and `titles`** (pure UI config — sidebar labels and per-screen header text) — every actual dataset has been removed since nothing reads mock data anymore.

## Known simplifications (things that look real but aren't full pipelines yet)

- **`DashboardSnapshot`** (Portfolio Revenue, Active Fraud Alerts, Revenue Leakage, Night Audit stat cards) is a single seeded row, not a live aggregate over Transaction/FraudCase/etc. Reason: the 32 sample transactions in this dev DB are a small illustrative slice ("tonight's postings"), not a full ledger — summing them would produce nonsense numbers unrelated to the portfolio-wide figures the mock always showed. In the target architecture this KPI layer is meant to come from ClickHouse (OLAP), not be computed live from Postgres OLTP data, so a snapshot row is the architecturally honest stand-in until that layer exists.
- **Dashboard's "Revenue vs. Recovered Leakage" chart** is still the original hand-drawn illustrative SVG curve, not plotted from real weekly figures — there's no weekly time-series model yet. Says so directly in the UI now ("Illustrative trend — weekly time-series not tracked yet.") rather than silently faking it.
- **`RevenueLeakage.recovered`** ($71,340) is a fixed figure in the `/api/leakage` route, not derived from the `LeakageCategory` rows (those sum to the *identified* total, $184,410, which does match). There's no recovery-tracking model yet distinguishing "identified" from "recovered" postings.
- **Fraud Detection's "Model Precision" (94.6%)** is still a hardcoded display value — there's no actual model, so there's nothing to compute precision from.
- **"Open Cases" / "Amount at Risk" on Fraud Detection are now honest**, unlike before: they're the real count/sum of the 6 seeded `FraudCase` rows (the original mock showed inflated `12` / `$38,910` implying more cases than were ever shown — that inconsistency is gone).

## aura-next structure

- `src/app/page.js` — server component, just renders `AuraApp`.
- `src/components/AuraApp.jsx` — `'use client'`, owns all state: `user` (from session, null = logged out), `checkingSession`, `screen`, `collapsed` (sidebar), `mobileNavOpen`. Checks `GET /api/auth/me` on mount.
- `src/app/api/**/route.js` — Route Handlers, see "Backend" above.
- `src/lib/db.js` — Prisma client singleton (with Neon adapter). `src/lib/session.js` — JWT session cookie helpers. `src/lib/format.js` — shared display-formatting helpers, see "Backend" above. `src/lib/data.js` — `navList`/`titles` only.
- `src/app/globals.css` — Tailwind v4 config-in-CSS. `@theme` block defines design tokens (see below). `@layer components` defines reusable classes: `.glass-card`, `.glass-panel`, `.glass-header`, `.glass-login`, `.soft-input`/`.soft-input-plain`, `.btn-primary`, `.btn-ghost`, `.btn-outline`, `.icon-btn`, `.pill`, `.nav-item`/`.nav-item-active`, `.table-scroll`/`.table-min`.
- `src/components/Icon.jsx` — one SVG icon component, switched by `name` prop. No external icon library.
- `src/components/Background.jsx`, `LoginScreen.jsx`, `Sidebar.jsx`, `Header.jsx` (takes a `user` prop), `ScreenHeader.jsx` — layout chrome.
- `src/components/screens/*.jsx` — all 9 are now `'use client'` and `fetch()` their own API route in a `useEffect`, with a `Loading…` / error-message fallback while `data === null`.
- `prisma/schema.prisma`, `prisma/seed.mjs`, `prisma.config.ts` — see "Backend" above.

### Design tokens (in `globals.css` `@theme`)
Colors: `ink`, `ink-soft`, `body`, `muted`, `faint`, `faint-2`, `hairline` (grayscale text), `brand`/`brand-light`/`brand-dark`, `teal` (accent), `critical`/`critical-bg`, `warning`/`warning-bg`, `success`/`success-bg`, `info`/`info-bg` (status colors + their translucent backgrounds — these exact bg alpha values vary by usage, don't assume one token fits every case, check `src/lib/format.js`'s `*_META` objects for the exact value used in each context).
Animations: `animate-float-blob(-rev/2/2-rev/-slow)`, `animate-drift-grid`, `animate-fade-up(-slow)`, `animate-pulse-dot`.

### Responsive breakpoints (intentionally non-default)
- `max-[860px]:` — sidebar becomes a fixed off-canvas drawer (hamburger menu appears in Header), triggered by `AuraApp`'s `mobileNavOpen` state.
- `sm:`/`lg:`/`xl:` (Tailwind defaults) — used for content grid column counts (stat cards, screen layouts).
- Dense data tables (Fraud rows, Transactions, Employees) use `.table-scroll > .table-min` (horizontal scroll below 761px) instead of collapsing columns.

## Known gotchas

- **Prisma 7 driver adapters + `prisma generate` after schema changes** — see "Backend" above, this has bitten every schema migration so far.
- **Neon free-tier cold start** — expect the first DB command after idle time to fail once (P1001/P1017) and succeed on retry.
- **Adding a required column to a non-empty table** — use `--create-only` + hand-edited backfill migration, not `migrate reset` (destructive, and blocked by the permission classifier anyway). See "Backend" above.
- **Tailwind v4 + `backdrop-filter`:** never hand-write `-webkit-backdrop-filter` next to a plain `backdrop-filter` in `@layer components` — Lightning CSS (Tailwind v4's compiler) silently drops the unprefixed standard property when both are present, breaking the frosted-glass effect everywhere. Write only the unprefixed property and let Lightning CSS auto-prefix.
- **Next.js 16 is unusually new** (post-training-data). If App Router conventions ever seem to behave unexpectedly, check `aura-next/node_modules/next/dist/docs/` before assuming — `aura-next/AGENTS.md` flags this explicitly. Same caution applies to Prisma 7.
- Forcing a Tailwind utility to win over a JS-computed inline `style` (e.g. the sidebar's collapsed-width) requires the `!` important prefix (`max-[860px]:!w-[250px]`) — plain utility classes lose to inline styles.
- The seeded dev password (`aura-secure-2026`) is plaintext-obvious and fine for local dev only — don't ship it as-is to anything resembling production.
- Login/Settings-name fields are controlled inputs now (real state + real requests); Settings' email/role/default-property fields are intentionally read-only (no edit flow for those yet).

## Next steps

1. Address the "Known simplifications" above if/when they matter: a real weekly-revenue time series, a recovery-tracking model distinct from identified-leakage, or genuinely computing Dashboard's snapshot from an aggregation layer.
2. Layers 1/2/4/5 from the target architecture (real hotel-system connectors, ClickHouse/Redis/Celery, the 5 AI models, alert delivery). Likely shape: Next.js Route Handlers calling out to a separate Python service for the ML-heavy pieces (PyTorch/XGBoost/LangChain don't belong in the Node runtime) — no decisions made yet, ask the user before assuming an approach.
3. No production deployment target decided yet (Vercel is the obvious default for Next.js but hasn't been discussed with the user).
