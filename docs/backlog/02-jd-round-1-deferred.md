# Judgment Day Round 1 — Deferred Findings

**Date**: 2026-04-25
**Context**: Adversarial parallel review of the 40-min MVP scaffold (`docs/plans/01-mvp-40min.md`). Two judges reviewed `src/modules/route-execution/**` blind to each other. This document captures everything NOT fixed in the post-JD remediation pass.

## Fixed in this PR (for reference)

- **C1** — Persistence schema validation + version field
- **S1** — Pickup vs delivery success terminology ("Picked up" vs "Delivered")
- **S2 + C6** — State-machine transition guards + `FailureReasonSheet` auto-close on status change
- **C2** — `UndoToast` `role="status"` + `aria-live="polite"`
- **C3** — `UndoToast` 44×44 touch targets
- **C4** — `FailureReasonSheet` focus trap, Escape-to-close, focus-on-open, focus-return-on-close, `aria-describedby`
- **C5** — Dropped `forwardRef` (React 19 native `ref` prop)
- **C7** — Stable `markStatus` (no `route` in deps)
- **C8** — Auto-scroll fixed (first-mount scroll + skip-on-undo)
- **C9** — `STATUS_VERB` typed `Record<StopStatus, string>`
- **C10** — `RouteProvider` accepts `initialRoute` prop; mock injection lifted to `RouteScreen`; barrel surface narrowed

---

## Deferred — Real WARNINGs (next PR or before v1.0)

### D1 — Exhaustive switch on `StopStatus` in `StopRow` action chain
**Severity**: WARNING (real)
**File**: `src/modules/route-execution/components/StopRow.tsx`
**Description**: Action buttons render via `if/else` chains on `stop.status`. If a new status is added to the union (e.g., `'cancelled'`, `'in-transit'`), the active stop silently shows no buttons — operator is bricked.
**Fix intent**: Replace `if` chain with `switch (stop.status)` using a `never` exhaustive default to force compile-time coverage when the union changes.
**Why deferred**: The transition-guard fix (F3) already prevents reaching an unknown status via normal flow; the exhaustive check is defense-in-depth, not a current bug. Pair with FW2 (ESLint hardening — `@typescript-eslint/switch-exhaustiveness-check` rule).

### D2 — `ProgressHeader` empty-route fallback
**Severity**: WARNING (real)
**File**: `src/modules/route-execution/components/ProgressHeader.tsx`
**Description**: When `totalCount === 0`, the header renders "Route complete · all stops finalized" — misleading: the route was never started.
**Fix intent**: Add explicit `totalCount === 0` branch with "No stops assigned" copy.
**Why deferred**: MVP `MOCK_ROUTE` always has 5 stops — unreachable until a real backend supplies dynamic routes. Address when `MOCK_ROUTE` is replaced (FW5: TanStack Query + MSW).

### D3 — `FailureReasonSheet` backdrop click-drag dismissal
**Severity**: WARNING (real)
**File**: `src/modules/route-execution/components/FailureReasonSheet.tsx`
**Description**: Mousedown inside the sheet, mouseup on the backdrop fires `onClose` — surprising dismissal during a dragged interaction.
**Fix intent**: Track `mousedown` target; only close on backdrop `mouseup` if both pointer events landed on the backdrop.
**Why deferred**: F6 (focus trap fix) added `e.target === e.currentTarget` guard on the click handler, which prevents the most common variant. Drag-then-release across the boundary remains; rare in practice. Address with full migration to native `<dialog>` (or React Aria `Modal`) — likely as part of FW3 (HeroUI v3 adoption) since HeroUI's `Modal` handles this for free.

---

## Deferred — Suggestions (batch with FW2 lint pass)

### S-1 — Replace `text-[var(--color-foo)]` with token utilities (`text-foo`)
**Files**: most components
Tailwind v4 auto-generates `text-content`, `bg-surface`, `border-border` etc. from `@theme` tokens. Verbose arbitrary-value form is leftover from initial scaffolding speed. Sweep replace.

### S-2 — Delete empty stub files
**Files**: `src/modules/route-execution/api/index.ts`, `src/modules/route-execution/validation.ts`
Both export `{}` and are unused. Convert their intent into a one-line comment in the module README, or delete until they have real content.

### S-3 — Inline `App → Routes → RouteScreen` indirection
**Files**: `src/App.tsx`, `src/routes/index.tsx`
Three layers wrap one component with no router behind them. Inline `<RouteScreen />` directly in `App.tsx`; recreate the `routes/` tree when TanStack Router lands (FW6).

### S-4 — `pb-32` magic spacer for sticky toast
**File**: `src/modules/route-execution/components/RouteScreen.tsx`
Static padding-bottom assumes a fixed toast height. If toast grows (long stop label, larger font, RTL), content gets covered. Use a CSS variable computed from toast height, or lift the toast outside the scroll flow.

### S-5 — `StatusPill` dot only carries color signal
**File**: `src/modules/route-execution/components/StatusPill.tsx`
The leading dot is `bg-current` — for color-blind users it conveys nothing beyond the label. Replace with status-specific glyphs (check, dot, X, etc.) or keep the dot but add an icon.

### S-6 — `formatReason` accepts `string` instead of `FailureReason`
**File**: `src/modules/route-execution/components/StopRow.tsx:19`
Type funnel leaks. Tighten to `FailureReason`.

### S-7 — Expose `activeStop` directly from `RouteContext`
**File**: `src/modules/route-execution/context/RouteContext.tsx`
`ProgressHeader` re-finds the active stop on every render. Cheap at 5 stops; cleaner to compute in the provider once.

### S-8 — Memoize sort/filter in `StopList`
**File**: `src/modules/route-execution/components/StopList.tsx`
`sorted`/`pickups`/`deliveries` recompute on every render. Wrap in `useMemo` keyed on `route.stops`.

### S-9 — Explicit locale in `formatTime`
**File**: `src/modules/route-execution/components/StopRow.tsx`
`toLocaleTimeString([], ...)` uses engine default — non-deterministic across environments. Pass an explicit locale, or document the choice.

### S-10 — Add a top-level `<ErrorBoundary>`
**File**: `src/main.tsx`
A render error inside the route module currently white-screens the whole tab. Wrap `<App />` in an error boundary with a "Reset route" affordance that clears localStorage.

### S-11 — Use `min-h-dvh` instead of `h-full`
**Files**: `src/index.css`, `src/modules/route-execution/components/RouteScreen.tsx`
On iPad Safari with the URL bar visible, `h-full` (100vh) cuts content. `dvh` adapts to dynamic viewport.

### S-12 — `*.tsbuildinfo` missing from `.gitignore`
**File**: `.gitignore`
TypeScript composite builds emit `tsconfig.app.tsbuildinfo` and `tsconfig.node.tsbuildinfo` which should never be tracked.

### S-13 — Add `vite/client` to `tsconfig.app.json` types
**File**: `tsconfig.app.json`
Without it, `import.meta.env` and `import.meta.hot` widen to `any` or fail typecheck the moment they're referenced.

### S-14 — `aria-label` on "Failed…" button
**File**: `src/modules/route-execution/components/StopRow.tsx`
Screen reader reads "Failed dot dot dot". Use `aria-label="Mark stop failed and pick a reason"`.

### S-15 — `bg-surface/90` token form (already covered by S-1)
Same theme as S-1.

### S-16 — README mentions empty `shared/` placeholder
**File**: `README.md`
Documenting empty scaffolding adds noise. Note as `(empty stub)` or remove until content exists.

### S-17 — `vite.config.ts` no `server.host` for LAN tablet testing
**File**: `vite.config.ts`
`pnpm dev` only listens on `localhost`. To smoke-test on a real tablet, add `server: { host: true }`.

### S-18 — `allowImportingTsExtensions` is unused
**File**: `tsconfig.app.json`
Flag is enabled but no source imports use a `.ts`/`.tsx` extension. Either remove or document the convention.

### S-19 — `StopRow` no `React.memo`
**File**: `src/modules/route-execution/components/StopRow.tsx`
At 5 stops it doesn't matter. At scale (or once the same `RouteContext` feeds a dispatcher view with many drones), every status change re-renders all rows.

### S-20 — `ProgressHeader` % rounded vs `aria-valuenow` integer
**File**: `src/modules/route-execution/components/ProgressHeader.tsx`
Visual bar rounds in 20% chunks (5 stops); ARIA reports raw integer. Optional consistency tweak.

### S-21 — `capitalize` util shadowing
**File**: `src/modules/route-execution/components/StopRow.tsx`
Single-call-site util with a name that clashes with the lodash idiom. Inline or rename.

---

## Theoretical / INFO (no action)

### I1 — SSR hydration mismatch in `usePersistedRoute`
SPA-only via Vite — server doesn't render. If SSR is ever introduced (Next.js / TanStack Start migration), revisit.

### I2 — Persistence write throttling
Every status change triggers `JSON.stringify` + sync localStorage write. Negligible at 5 stops; revisit when route size grows or under multi-route scenarios.

### I3 — `theme-color` mismatch with light surface
`<meta name="theme-color" content="#0f172a">` is dark slate; surface is near-white. On Android the URL bar paints dark above a light page. Address when a real theme story (FW12 dark mode) lands.

### I4 — `StopList` ref-callback identity churn
Inline ref callback creates a new function each render — React 19 calls it with `null` then with the element each render. Negligible at 5 rows.

### I5 — Background-tab timer throttling extending undo window
Browsers throttle `setTimeout` in backgrounded tabs. The 5-second undo window can persist longer if the tab is backgrounded. Document the limitation in user-facing copy (or compare against `Date.now()` snapshot when undo is clicked) — minor.

---

## Contradiction (resolved)

### X1 — Focus ring `outline-style` missing
Judge A flagged `focus-visible:outline-2 outline-color` without `outline-style` as a missing focus ring. Judge B verified Tailwind v4 sets `--tw-outline-style: solid` by default via a registered CSS property — focus rings render correctly. **Resolution: no action needed.**
