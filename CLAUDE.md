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

**Status:** layer 6 (dashboard) is fully built and, as of 2026-07-25, **every one of its 9 screens is backed by real Postgres data** (layer 3 started) — no more hardcoded mock arrays anywhere in the app. As of 2026-08-01 the app is no longer read-only: alerts, fraud cases and night-audit checklist items support real status-changing writes, and data access is scoped per-user via property grants (RBAC). Layers 1, 2, 4, 5 (real hotel-system connectors, ClickHouse/Redis/Celery, the 5 AI models, alerting) are still not built — see "Known simplifications" below for exactly what's faked vs. real within layer 3.

## Current state (updated 2026-08-01)

- **[aura-next/](aura-next/) is the live app** — Next.js 16 (App Router, Turbopack) + Tailwind CSS v4, fully wired to Postgres via Prisma. This is the only frontend now; there is no mock-data fallback left.
- **Write operations + property-level RBAC landed 2026-08-01** (Wave 1 of the post-migration roadmap): alerts can be acknowledged/resolved, fraud cases have a status workflow, night-audit checklist items can be marked done — and every property-scoped read/write (transactions, employees, fraud cases, risk heatmap) is now filtered to the properties the logged-in user has been granted access to. See "Backend" and "aura-next structure" below for the concrete routes/files.
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

**Seeding:** `npx prisma db seed` runs `prisma/seed.mjs`, which is idempotent (deletes-then-recreates each table's rows, `upsert`s Users/Properties by unique key) so it's safe to re-run. Seeds: 2 dev users — `e.reyes@meridianhotels.com` (CFO, portfolio-wide access, all 6 properties) and `r.chandra@meridianhotels.com` (GM, scoped to Bayside only) — both password `aura-secure-2026` (dev-only credential), 6 properties (codes GM/BS/OT/HB/SM/RV, each with a `name` and a shorter `shortName` used in table/card display), 7 `UserProperty` access grants (6 for the CFO + 1 for the GM), 32 transactions, 6 employees, 6 fraud cases, 5 leakage categories, 7 alerts, 1 night audit run with 6 checklist items, 6 report definitions, 3 insights, 42 property risk scores (6 properties × 7 days), 1 dashboard snapshot.

**Schema** (`aura-next/prisma/schema.prisma`) — one model per screen's data, all seeded and API-backed:
- `User` — auth + profile + notification prefs (`twoFactorEnabled`, `criticalAlertsEmail`, `weeklyDigest`) + `defaultPropertyId`. Has a `propertyAccess UserProperty[]` relation (see below) that gates which properties' data this user can see or write.
- `Property` — `code`, `name`, `shortName`; referenced by Transaction/Employee/FraudCase/PropertyRiskScore/User.
- `UserProperty` — join table for property-level RBAC: which properties a user is allowed to see/write. No rows for a user = sees nothing on property-scoped screens (fails closed, opt-in not opt-out). Only covers models that already carry a `propertyId` (Transaction/Employee/FraudCase/PropertyRiskScore) — `Alert`, `NightAuditRun`, `Insight`, `ReportDefinition`, `DashboardSnapshot` have no `propertyId` field yet and are still portfolio-wide/unscoped for every user (see "Known simplifications").
- `Transaction` — Transactions screen. `TransactionFlag` enum (CLEARED/FLAGGED/REVIEW).
- `Employee` — Employees screen. `RiskBand` enum (LOW/MEDIUM/HIGH).
- `FraudCase` — Fraud Detection screen. `FraudSeverity` enum (CRITICAL/HIGH/MEDIUM). `status FraudCaseStatus` enum (OPEN/INVESTIGATING/RESOLVED/FALSE_POSITIVE, default OPEN) — drives the Fraud Detection screen's status dropdown and the "Open Cases"/"Amount at Risk" stat cards (which now only count OPEN+INVESTIGATING rows).
- `LeakageCategory` — Revenue Leakage screen's category breakdown.
- `Alert` — Alerts Center screen + Dashboard's "Recent Alerts". `AlertSeverity` enum (CRITICAL/WARNING/INFO). `status AlertStatus` enum (OPEN/ACKNOWLEDGED/RESOLVED, default OPEN) — drives the Alerts Center "Acknowledge"/"Resolve" button.
- `NightAuditRun` + `ChecklistItem` (1:many) — Night Audit screen. `ChecklistStatus` enum (DONE/WARNING/CRITICAL/PENDING). `NightAuditRun.closeStepsCompleted`/`closeProgressPct` are a broader "close process" counter than the visible checklist (`closeStepsTotal` was seeded as 9, but the checklist only has 6 rows) — marking a checklist item DONE increments/decrements that counter by 1 rather than recomputing it from an absolute count of DONE checklist rows, specifically to avoid the counter ever contradicting the pre-existing offset between the two.
- `ReportDefinition` — Reports screen cards.
- `Insight` — Dashboard's "AI Insights" cards. `InsightType` enum (CRITICAL/OPPORTUNITY/TREND).
- `PropertyRiskScore` — Dashboard's property risk heatmap (`propertyId` + `dayIndex` 0–6 + `score` 0–1).
- `DashboardSnapshot` — Dashboard's 4 top stat cards (portfolio revenue, fraud alert count, leakage, night-audit %). Single seeded row — see "Known simplifications" for why this isn't a live aggregate. Not property-scoped — every user sees the same portfolio-wide numbers regardless of their `UserProperty` grants (a scoped GM seeing portfolio-wide KPIs here is a known gap, not yet fixed).

**Auth:** custom-built, not a library (avoided NextAuth/Auth.js given how new Next.js 16 is — dependency compat risk). `src/lib/session.js` signs/verifies an httpOnly JWT cookie via `jose`. Routes: `POST /api/auth/login` (bcrypt-compares password, sets cookie), `POST /api/auth/logout` (clears cookie), `GET /api/auth/me` (used by `AuraApp` on mount to persist login across refresh). Passwords hashed with `bcryptjs`.

**API routes (all session-gated via `getSession()`, all under `src/app/api/`):**
- `auth/login`, `auth/logout`, `auth/me` — see "Auth" above.
- `transactions` — `GET ?page=&pageSize=`, paginated. Scoped to the caller's accessible properties (see "Property-level RBAC" below).
- `employees`, `fraud-cases` — `GET`, full list, also property-scoped.
- `fraud-cases/[id]` — `PATCH { status }` (OPEN/INVESTIGATING/RESOLVED/FALSE_POSITIVE). 404s if the case isn't found *or* isn't in one of the caller's accessible properties — scoping is enforced on writes too, not just list reads.
- `reports` — `GET`, full list. Not property-scoped (`ReportDefinition` has no `propertyId`).
- `alerts` — `GET ?limit=`, most-recent-first. Not property-scoped (see `UserProperty` note above).
- `alerts/[id]` — `PATCH { status }` (OPEN/ACKNOWLEDGED/RESOLVED).
- `leakage` — `GET`, returns categories + identified/recovered totals + recovery rate.
- `night-audit` — `GET`, latest run + its checklist items.
- `night-audit/checklist/[id]` — `PATCH { status }` (DONE/WARNING/CRITICAL/PENDING); recomputes and returns the parent run's `closeStepsCompleted`/`closeProgressPct` (see the `NightAuditRun` schema note above for why it's an increment/decrement, not a recount) alongside the full run+checklist shape (same as `GET night-audit`'s `run`), so the client can just replace its state wholesale.
- `dashboard` — `GET`, composes snapshot (unscoped) + insights (unscoped) + 4 most-recent alerts (unscoped) + heatmap (property-scoped, grouped by property, ordered to match seed insertion order via `orderBy: [{ property: { createdAt: 'asc' } }, { dayIndex: 'asc' }]` — don't drop that property-level ordering or the heatmap row order becomes nondeterministic).
- `user/profile` — `GET` full profile incl. `defaultProperty` + prefs; `PATCH` updates `name` and the three notification-pref booleans (email/role/defaultProperty are intentionally not user-editable here).

All routes return plain JSON with raw values (numbers, ISO dates, enum strings) — no colors or formatted strings baked in server-side. Every screen computes its own display formatting/colors client-side via `src/lib/format.js`: `formatTime`, `formatAmount`, `amountColor`, `formatRelativeDay`, `timeAgo`, `initialsFromName`, and the `*_META` color-lookup objects (`FLAG_META`, `FRAUD_SEVERITY_META`, `RISK_BAND_META`, `ALERT_SEVERITY_META`, `CHECKLIST_STATUS_META`). Add to this file rather than duplicating formatting logic per-screen. Response-shaping helpers that are reused across a list route and its `[id]` PATCH route (e.g. `serializeFraudCase`, `serializeAlert`) live in `src/lib/serializers.js` — don't export them from a `route.js` file itself, Next.js route handlers only permit HTTP-verb exports (`GET`/`POST`/etc.) plus a few route-config constants.

**Property-level RBAC:** `src/lib/access.js`'s `getAccessiblePropertyIds(userId)` looks up the caller's `UserProperty` rows and returns the property IDs they can see; every property-scoped route filters its Prisma query with `where: { propertyId: { in: propertyIds } } }`. An empty array correctly yields zero rows (Prisma's `{ in: [] }`), so a user with no grants sees nothing rather than everything — access is opt-in. This currently covers Transaction/Employee/FraudCase/PropertyRiskScore reads and the FraudCase status-update write; it does **not** cover Alert (no `propertyId` on the model) or NightAuditRun (single global run, no per-property runs yet).

**`src/lib/data.js` now only holds `navList` and `titles`** (pure UI config — sidebar labels and per-screen header text) — every actual dataset has been removed since nothing reads mock data anymore.

## Known simplifications (things that look real but aren't full pipelines yet)

- **`DashboardSnapshot`** (Portfolio Revenue, Active Fraud Alerts, Revenue Leakage, Night Audit stat cards) is a single seeded row, not a live aggregate over Transaction/FraudCase/etc. Reason: the 32 sample transactions in this dev DB are a small illustrative slice ("tonight's postings"), not a full ledger — summing them would produce nonsense numbers unrelated to the portfolio-wide figures the mock always showed. In the target architecture this KPI layer is meant to come from ClickHouse (OLAP), not be computed live from Postgres OLTP data, so a snapshot row is the architecturally honest stand-in until that layer exists.
- **Dashboard's "Revenue vs. Recovered Leakage" chart** is still the original hand-drawn illustrative SVG curve, not plotted from real weekly figures — there's no weekly time-series model yet. Says so directly in the UI now ("Illustrative trend — weekly time-series not tracked yet.") rather than silently faking it.
- **`RevenueLeakage.recovered`** ($71,340) is a fixed figure in the `/api/leakage` route, not derived from the `LeakageCategory` rows (those sum to the *identified* total, $184,410, which does match). There's no recovery-tracking model yet distinguishing "identified" from "recovered" postings.
- **Fraud Detection's "Model Precision" (94.6%)** is still a hardcoded display value — there's no actual model, so there's nothing to compute precision from.
- **"Open Cases" / "Amount at Risk" on Fraud Detection** count only `OPEN`+`INVESTIGATING` `FraudCase` rows (real data, now status-aware since the 2026-08-01 write-ops change) — still not the same as the Dashboard's unrelated seeded `activeFraudAlerts`/`activeFraudAlertsCritical` snapshot figures, which remain a fixed mock number per the `DashboardSnapshot` note above.
- **`Alert` and `NightAuditRun` are not property-scoped** — every logged-in user sees the same alerts and the same single global night-audit run regardless of their `UserProperty` grants, even though Transaction/Employee/FraudCase/the risk heatmap are now scoped (see "Property-level RBAC" above). Fixing this needs a `propertyId` added to `Alert` (current `meta` field only has a free-text property name, not a foreign key) and turning `NightAuditRun` into one-run-per-property instead of one global run — real schema work, deliberately deferred rather than done as a rushed backfill.
- **`DashboardSnapshot` is unscoped for the same reason** — a property-scoped user (e.g. the seeded GM, `r.chandra@meridianhotels.com`, scoped to Bayside only) still sees portfolio-wide KPI cards on the Dashboard. This was already true before RBAC existed (see the `DashboardSnapshot` schema note above) and RBAC didn't change it.

## aura-next structure

- `src/app/page.js` — server component, just renders `AuraApp`.
- `src/components/AuraApp.jsx` — `'use client'`, owns all state: `user` (from session, null = logged out), `checkingSession`, `screen`, `collapsed` (sidebar), `mobileNavOpen`. Checks `GET /api/auth/me` on mount.
- `src/app/api/**/route.js` — Route Handlers, see "Backend" above. Dynamic segments (`alerts/[id]`, `fraud-cases/[id]`, `night-audit/checklist/[id]`) use Next 16's promise-based `params` — `export async function PATCH(request, { params }) { const { id } = await params; ... }`, not the pre-v15 synchronous shape.
- `src/lib/db.js` — Prisma client singleton (with Neon adapter). `src/lib/session.js` — JWT session cookie helpers. `src/lib/format.js` — shared display-formatting helpers, see "Backend" above. `src/lib/access.js` — `getAccessiblePropertyIds()`, see "Property-level RBAC" above. `src/lib/serializers.js` — shared route response-shaping (`serializeFraudCase`, `serializeAlert`). `src/lib/data.js` — `navList`/`titles` only.
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

Working off a 3-wave rough plan: (1) turn the read-only DB-backed demo into a usable tool, (2) build out the data pipeline/time-series layer, (3) AI + alert delivery. Wave 1 is partially done as of 2026-08-01:

**Wave 1 — done:** alert acknowledge/resolve, fraud case status workflow, night-audit checklist toggle, property-level RBAC (read + the fraud-case write) with a second scoped demo user to prove it actually restricts.

**Wave 1 — still open:**
1. Extend property scoping to `Alert` and `NightAuditRun` (needs schema work — see "Known simplifications" above), and to `DashboardSnapshot` once it's a real aggregate rather than a single seeded row.
2. Wire up the currently-decorative controls: Header search input, theme toggle, notifications bell, property switcher (hardcoded to "The Grand Meridian · NYC" regardless of `user.defaultProperty`); Alerts Center's severity filter pills and Transactions' property/type filter pills and search box; Settings' 5 unbuilt nav sections (Security & Access, Notifications, Detection Rules, Integrations, Data & Privacy).
3. Security minimums: login rate-limiting, a password-change flow, `middleware.js`-level route protection (currently enforced per-route via `getSession()` only).

**Wave 2 — data pipeline:** a real weekly-revenue/leakage time series (Dashboard's chart is still the original illustrative SVG), a recovery-tracking model distinct from identified-leakage (`RevenueLeakage.recovered` is still a fixed figure), then genuinely computing `DashboardSnapshot` from an aggregation layer instead of a seeded row. Decide the connector architecture (separate Python service vs. in-Node) before starting real PMS/POS ingestion — ask the user, no decision made yet.

**Wave 3 — Layers 1/2/4/5** from the target architecture (real hotel-system connectors, ClickHouse/Redis/Celery, the 5 AI models, alert delivery). Likely shape: Next.js Route Handlers calling out to a separate Python service for the ML-heavy pieces (PyTorch/XGBoost/LangChain don't belong in the Node runtime) — no decisions made yet, ask the user before assuming an approach. Alert Engine (Telegram/Email delivery) is worth doing before the ML models — rule-based fraud detection already has real data to act on via the fraud-case status workflow.

No production deployment target decided yet (Vercel is the obvious default for Next.js but hasn't been discussed with the user).
