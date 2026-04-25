# Plan — Revelstreet MVP (40-Minute Build)

## Context

Greenfield drone-delivery operator interface. **Hard constraint: 40 minutes total to ship MVP.** The earlier full scaffolding plan (PWA, HeroUI, Mapbox, MSW, full DDD, tests, hooks) is shelved — it's a multi-day build. We're optimizing for "demo-able operator flow + a couple of small-effort, big-impact wins" inside 40 min.

Operator model: hybrid (dispatcher + field crew). For MVP we build **one screen** that works on tablet (primary) and is acceptable on desktop. Backend is out of scope — mock data lives in a `.ts` file.

Repo state: `.git` only. Truly greenfield.

---

## Scope Cuts (explicit — to protect the 40-min budget)

| Cut | Why | When to add |
|---|---|---|
| HeroUI v3 | Setup time eats budget; v3 is beta | Post-MVP after auditing v1 needs |
| Mapbox / any map | 10+ min for token + base map alone | When dispatcher view is built |
| TanStack Query / Router | No backend, no multi-route MVP | When real API + 2+ screens land |
| MSW | No API calls to mock | Pair with TanStack Query |
| PWA / service worker | Manifest + icons + SW testing = hours | When field testing on real tablet starts |
| Vitest + Playwright | Setup ~10 min combined | T+1 day, before second feature lands |
| Husky / commitlint / lint-staged | ~5 min, low MVP value | Same day as tests |
| Full DDD `modules/` layout | Premature for one screen | At second feature — refactor takes ~30 min |
| Zustand | Per your call — useState + Context only | Likely never |
| Strict ESLint config + a11y plugins | Setup tax; default Vite ESLint is fine | When second contributor joins |
| AGENTS.md / CLAUDE.md content | Deferred until we know what rules matter | After MVP demo, in a focused session |
| Docs folder ADRs | Save the plan; skip ADR ceremony for now | When a real architectural choice happens |

---

## Locked Tech Stack (MVP only)

| Area | Choice | Reason |
|---|---|---|
| Build | Vite + React 19 + TS | Fastest to running app |
| Styling | Tailwind v4 (CSS-first config) | Zero config file; utility classes only |
| Client state | `useState` (local) + Context API (cross-component) | Per your call |
| Forms (if any) | Skipped for MVP — no submission view | RHF + Zod when a real form appears |
| Mock data | Single `src/mock/route.ts` file | Easiest swap-out later |
| Layout | Tablet-first single page, `max-w-2xl mx-auto` for desktop | Adaptive deferred until 2nd screen |

---

## Game-Changer Quick Wins (PICK FROM THIS LIST)

These are "small effort, outsized impact" features ON TOP of the core flow. Each estimated in minutes against the 40-min budget. **You choose which make the cut.**

| # | Quick Win | Effort | Why it's a game-changer |
|---|---|---|---|
| QW1 | **localStorage persistence** of route progress | ~3 min | Refresh / crash / accidental tab-close doesn't wipe state. In the field this is the difference between "demo" and "actually trustworthy." |
| QW2 | **Sticky progress header** ("3 / 7 stops complete" + percent bar) | ~3 min | Operator always knows where they are; reduces cognitive load on every interaction. |
| QW3 | **Auto-scroll + highlight next active stop** after marking departed | ~3 min | Removes a manual step every single stop. Feels intelligent. |
| QW4 | **Undo toast** (5s window after status change) | ~5 min | Misclicks happen with gloves / sun glare / motion. Undo turns a panic moment into a 1-tap fix. |
| QW5 | **Failure-with-reason picker** (refused / wrong address / no recipient / damaged) | ~4 min | Real-world failure isn't binary; structured reasons feed analytics later without a free-text field. |
| QW6 | **Color-coded status pills + group by type** (Pickups vs Deliveries) | ~3 min | Glanceability. Pickups have different urgency than deliveries. |
| QW7 | **Keyboard shortcuts** for dispatcher (A=arrived, D=departed, S=success, F=failed) | ~3 min | Dispatcher at desk plows through a route 3× faster. Pure delight feature for power users. |
| QW8 | **Big touch targets + sun-readable contrast** (Tailwind utilities) | ~free, but worth calling out | Tablet usability — `py-6 text-lg`, high contrast. No real time cost, huge field benefit. |
| QW9 | **Timestamp log per status change** (visible "marked arrived 2:34 PM") | ~3 min | Audit trail / dispute resolution. Free with `Date.now()`. |
| QW10 | **Dark mode toggle** for outdoor / night use | ~3 min | Sunlight + battery savings. Tailwind v4 makes this trivial. |

### Locked QW bundle (your selection)

**In:** QW1, QW2, QW3, QW4, QW5, QW6, QW9. **Out:** QW7 (keyboard shortcuts), QW8 (kept as a free sweep — costs nothing), QW10 (dark mode).

Honest math: naive sum is **47 min — 7 over**. Reclaim path is shared infrastructure:
- **QW9 ≈ free with QW4** — undo needs an action-history snapshot anyway; rendering timestamps from that history is a one-liner.
- **QW3 ≈ 2 min instead of 3** — leverages QW2's "current active stop" derivation; just adds `scrollIntoView`.
- **QW6 ≈ 2 min instead of 3** — grouping is one `Array.prototype.reduce`; pill colors map straight from `StopStatus`.

Reclaimed budget = 40 min. Tight but honest.

---

## 40-Minute Time Budget (final)

| Block | Min | What gets built |
|---|---|---|
| **A. Bootstrap + structure + plan to docs/** | 6 | `pnpm create vite@latest revelstreet -- --template react-ts` → install Tailwind v4 → wire `index.css` → scaffold `src/modules/route-execution/{components,hooks,api,context}` + `src/shared/{components,hooks,api,utils}` + `src/routes` + `src/mock` with barrel `index.ts` and stub `validation.ts` → copy this plan to `docs/plans/01-mvp-40min.md` → `pnpm dev` running |
| **B. Mock data + types** | 3 | `src/mock/route.ts` with **5 stops: 2 pickups + 3 deliveries**, strict linear `order`. `modules/route-execution/types.ts` per §Data Shape. |
| **C. Core flow UI + Context** | 12 | `App.tsx` mounts `routes/index.tsx` → `RouteScreen` from `modules/route-execution`. `RouteContext` holds route + last-action snapshot. `StopList` + `StopRow` with action buttons. Strict linear: only the next pending stop is interactive — earlier stops show completed/failed, later stops locked. |
| **D. QW1 — localStorage** | 3 | `usePersistedRoute` hook: read on mount, write on every change. Key: `revelstreet:route:<id>`. |
| **E. QW2 — sticky progress header** | 3 | `ProgressHeader` with "N / 5 complete" + Tailwind progress bar. Sticky top. |
| **F. QW6 — grouped + color pills** | 2 | Group `Pickups` / `Deliveries` (visual sections; linear order preserved within). `StatusPill` semantic colors. |
| **G. QW3 — auto-scroll next active** | 2 | `useRef` map keyed by stop id; on Departed action, `scrollIntoView` the next active stop. |
| **H. QW4 — undo toast (+ QW9 timestamps free)** | 5 | Context tracks last action. `UndoToast` shows for 5s; click restores prior status. Each status change also pushes `{at: Date.now(), status}` into stop history; `StopRow` renders the latest timestamp inline. |
| **I. QW5 — failure-with-reason picker** | 4 | When operator taps "Failed", `FailureReasonSheet` offers: refused / wrong-address / no-recipient / damaged. Selection writes `failureReason` + closes. |
| **J. QW8 — touch-target + contrast sweep** | 0 | Free pass during build — `py-6`, `min-h-[44px]`, `text-lg`, AA-contrast classes baked in from the start. |
| **K. Smoke test on tablet width** | 0 | Done inline during H/I. |
| **Total** | **40** | |

### Cut-line if we slip
If at minute 35 we're not done with H/I/J, here's the cut order (last-to-first cut): **QW5 first** (failure picker — pushes "Failed" to a simple no-reason action; reason structure stays in types), then **QW9 timestamps in UI** (data still saved), then **QW3 auto-scroll**. Under no circumstance do we cut QW1 (persistence) or QW2 (progress) — those two are the trust foundation.

---

## File Layout (MVP — uses your modules/shared/routes shape from day one)

```
revelstreet/
├── docs/                                 # ALL plans + docs live here, committed
│   └── plans/
│       └── 01-mvp-40min.md               # Copy of this plan, committed in Block A
├── src/
│   ├── modules/                          # Feature-bounded modules
│   │   └── route-execution/              # The one MVP feature
│   │       ├── components/
│   │       │   ├── ProgressHeader.tsx    # QW2
│   │       │   ├── StopList.tsx          # Core — handles grouping (QW6)
│   │       │   ├── StopRow.tsx           # Core — buttons, pill, timestamp (QW9)
│   │       │   ├── StatusPill.tsx        # Core + QW6 color mapping
│   │       │   ├── FailureReasonSheet.tsx # QW5
│   │       │   └── UndoToast.tsx         # QW4
│   │       ├── hooks/
│   │       │   └── usePersistedRoute.ts  # QW1
│   │       ├── api/
│   │       │   └── index.ts              # Stub — no backend yet
│   │       ├── context/
│   │       │   └── RouteContext.tsx      # Route + last-action snapshot
│   │       ├── types.ts                  # Stop, StopStatus, FailureReason, Route
│   │       ├── validation.ts             # Stub — Zod schemas added when forms appear
│   │       └── index.ts                  # Barrel — public surface of this module
│   ├── shared/                           # Cross-cutting; empty placeholders for now
│   │   ├── components/
│   │   │   └── .gitkeep
│   │   ├── hooks/
│   │   │   └── .gitkeep
│   │   ├── api/
│   │   │   └── .gitkeep
│   │   └── utils/
│   │       └── .gitkeep
│   ├── routes/
│   │   └── index.tsx                     # Single MVP route renders the route-execution module
│   ├── mock/
│   │   └── route.ts                      # 5-stop demo route, strict linear order
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                         # Tailwind v4 import + tokens
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
└── README.md                             # 1 paragraph: what + `pnpm dev`
```

**Why we keep the structure even for one feature:** zero refactor when feature #2 lands; barrel imports establish the rule from line one (no deep imports across modules); empty `shared/` folders signal where reusable primitives go.

---

## Data Shape (frozen for MVP)

```ts
// src/types.ts
export type StopType = 'pickup' | 'delivery';
export type StopStatus =
  | 'pending'
  | 'arrived'
  | 'departed'
  | 'success'
  | 'failed';
export type FailureReason =
  | 'refused'
  | 'wrong-address'
  | 'no-recipient'
  | 'damaged';

export interface Stop {
  id: string;
  type: StopType;
  label: string;          // restaurant name OR delivery address
  address: string;
  order: number;          // route ordinal
  status: StopStatus;
  failureReason?: FailureReason;
  history: { at: number; status: StopStatus }[];   // QW9 if chosen
}

export interface Route {
  id: string;
  operatorId: string;
  stops: Stop[];
}
```

---

## Future Work (everything not finished in the 40-min MVP — priority order)

Anything not delivered by the MVP buzzer ships here. Each item should land in `docs/` (plan or ADR) when picked up.

1. **Tests** — Vitest + RTL smoke + one Playwright happy-path (~30 min)
2. **ESLint hardening** — flat config + `jsx-a11y` + `tailwindcss` + `import` plugin with `no-restricted-imports` rule blocking deep imports across `modules/*` (force barrel use). Husky + lint-staged + commitlint for Conventional Commits (~30 min)
3. **HeroUI v3 adoption** — replace raw Tailwind primitives with HeroUI compounds; re-evaluate after MVP feedback (~1–2 hr)
4. **PWA wrapper** — `vite-plugin-pwa` + Workbox; service worker; offline mutation queue (~1–2 hr; needs §6 PWA tradeoff context preserved in `docs/research/pwa-vs-spa.md`)
5. **TanStack Query + MSW** — replace `useState` route + mock import with query hooks behind MSW handlers; clean swap-to-real-backend later (~1–2 hr)
6. **TanStack Router** — when a second route appears (~30 min)
7. **Mapbox integration** — token + base map + pin/route layers in `modules/map-view` (~2–3 hr; needs your Mapbox account)
8. **`AGENTS.md` + `CLAUDE.md`** — author after the deferred-questions session (§3 below). `CLAUDE.md` is short and points to `AGENTS.md` + `docs/style-guide.md` (~1 hr including the questions session)
9. **`docs/style-guide.md`** — full style guide per the outline in §5 (~2–3 hr)
10. **Forms layer** — RHF + Zod when the first submission view appears; `validation.ts` stubs already in place
11. **Remaining quick wins** — QW7 (keyboard shortcuts), QW10 (dark mode)
12. **Dispatcher overview module** — multi-drone fleet view (`modules/route-overview` + `modules/drone-status`)
13. **Real-time drone telemetry overlay**, **photo proof of delivery**, **auto-route on weather**, **multi-drone dispatcher map** — full HIGH-IMPACT/HIGH-EFFORT quadrant from §4
14. **Adaptive layout switch** — once dispatcher and field views diverge, formalize the breakpoint adaptive split per §5 step 8

### Documentation deliverables (all live in `docs/`)

| File | When |
|---|---|
| `docs/plans/01-mvp-40min.md` | **Block A** — copy of this plan |
| `docs/plans/02-tests-and-lint.md` | When item #1–#2 are picked up |
| `docs/plans/03-pwa-rollout.md` | When item #4 is picked up |
| `docs/research/pwa-vs-spa.md` | When item #4 is picked up — extracted from §6 of this plan |
| `docs/research/delivery-app-ux-patterns.md` | When item #9 is picked up — extracted from §5 of this plan |
| `docs/research/operator-pain-points.md` | When item #9 is picked up — extracted from §4 of this plan |
| `docs/style-guide.md` | Item #9 |
| `docs/decisions/0001-vite-react-tailwind.md` | When item #2 lands (ADR locking the stack) |
| `docs/decisions/0002-mock-via-msw.md` | When item #5 lands |
| `docs/decisions/0003-pwa-from-day-one.md` | When item #4 lands |

---

## Verification (what "MVP shipped" means at the 40-min mark)

1. `pnpm dev` opens a clean app at `localhost:5173`, no console errors.
2. The hardcoded route renders all stops, grouped or ordered as specified.
3. I can click through: Arrived → Departed → Success on every stop. Statuses persist.
4. Refreshing the browser does NOT lose progress (QW1).
5. Progress header updates live (QW2 if chosen).
6. Misclick recovery: undo toast appears and works (QW4 if chosen).
7. Looks acceptable at 768px (tablet) and 1280px (desktop).

If any of those fail at the 40-min mark, MVP slips — flag explicitly, don't hide it.

---

## Locked Decisions (from Q&A)

- QWs in: **QW1, QW2, QW3, QW4, QW5, QW6, QW9**. QW8 (touch targets) is a free pass during build.
- QWs out: **QW7** (keyboard shortcuts), **QW10** (dark mode).
- **Strict linear ordering** — only the next pending stop is interactive; QW3 auto-advance is the payoff.
- **5 stops: 2 pickups + 3 deliveries.**
- Package manager: **pnpm** (assumed; flag if you'd prefer npm).
