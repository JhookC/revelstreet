# AGENTS.md — Revelstreet

Rules and criteria for AI agents working on this codebase. Every agent that reads or writes code in this repository MUST follow these rules without exception.

---

## Project Overview

Revelstreet is a tablet-first drone-delivery operator interface built with React 19, TypeScript, and Tailwind v4. It is a greenfield SPA with a PWA wrapper. Backend is out of scope for now — data is mocked via MSW.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Build | Vite 6 + React 19 + TypeScript 5 |
| Styling | Tailwind v4 (CSS-first config — NO `tailwind.config.js`) |
| UI Components | HeroUI v3 (beta) — built on React Aria + Tailwind v4 |
| Server state | TanStack Query v5 |
| Client state | `useState` + Context API — no Zustand, no Redux |
| API mocking | MSW v2 (browser worker for dev, Node server for tests) |
| Unit tests | Vitest v4 + React Testing Library + jsdom |
| E2E tests | Playwright (Chromium only) |
| Linting | ESLint flat config + typescript-eslint + react-hooks + jsx-a11y |
| Commits | Conventional Commits (enforced by commitlint + Husky) |
| Package manager | pnpm |

---

## Project Structure

```
src/
├── modules/                 # Feature-bounded modules
│   └── <feature>/
│       ├── components/      # Feature-local presentational components
│       │   └── __tests__/   # Co-located unit tests
│       ├── hooks/           # Feature-local hooks
│       ├── api/             # TanStack Query hooks + query key factories
│       ├── context/         # Feature context providers
│       ├── types.ts         # Feature types
│       ├── validation.ts    # Zod schemas — add when first form lands (RHF + Zod)
│       └── index.ts         # Barrel — the ONLY public surface of this module
├── shared/                  # Cross-cutting primitives
│   ├── components/          # Generic UI — NO domain logic
│   ├── hooks/               # Generic hooks (useDebounce, useOnlineStatus, …)
│   ├── api/                 # Fetch client
│   ├── context/             # App-level providers (ThemeProvider)
│   └── utils/               # Pure utilities
├── routes/                  # Route entry points
├── mocks/                   # MSW handlers + browser/server setup
├── mock/                    # Static fixture data
└── test/                    # Global test setup and shared test utilities
```

---

## Coding Rules

### TypeScript

- **Zero tolerance for lint and TypeScript errors.** Every file must pass `pnpm typecheck` and `pnpm lint` before commit.
- No `any` types — use `unknown` + type guards or proper generics.
- No `as` casts unless impossible to avoid; prefer type guards.
- Prefer `interface` for object shapes, `type` for unions and aliases.

### Imports

- **No deep imports across modules.** Use the barrel: `import { Foo } from '@/modules/route-execution'`.
- Never reach into another module's internal paths (`@/modules/route-execution/components/Foo`).
- `shared/` is accessible from anywhere; `modules/<X>/` internals are private to that module.
- Alias `@` maps to `src/`.

### Components

- Functional components only — no class components.
- Export named, not default (except route entry points in `src/routes/`).
- Prop types as `interface Props` in the same file; no prop-types package.
- No inline styles — use Tailwind utility classes or CSS custom properties.
- Touch targets: minimum `min-h-[44px]` on interactive elements.

### State Management

- **TanStack Query** for all server state (fetching, caching, mutations).
- **`useState` / Context** for local UI state (modal open, theme).
- No global state library (no Zustand, no Redux).
- Optimistic updates via `queryClient.setQueryData` before mutation fires.

### HeroUI Components

- Use HeroUI v3 compound pattern: `Modal.Backdrop`, `Modal.Dialog`, `Button`, etc.
- HeroUI Button uses `onPress` (React Aria), not `onClick`. Always use `onPress`.
- For custom colors, override via `className` prop — HeroUI respects Tailwind utility overrides.
- Theme: `ThemeProvider` sets both `data-theme` (custom CSS tokens) and `.light`/`.dark` class (HeroUI requirement) on `<html>`.

### Styling

- Tailwind v4 CSS-first: tokens are defined in `src/index.css` under `@theme { … }`.
- Custom tokens: `--color-surface`, `--color-content`, `--color-accent`, `--color-status-*`, etc.
- Dark mode: `[data-theme='dark']` selector in `index.css` overrides tokens. HeroUI reads `.dark` class.
- Never hardcode hex colors — always use CSS custom property tokens.

### API Layer

- All server calls go through `apiFetch<T>` in `src/shared/api/client.ts`.
- MSW handlers live in `src/mocks/handlers.ts`; reset state in `afterEach` via `resetStore()`.
- In production, `VITE_API_URL` env var prefixes all API paths.

---

## Testing Rules

### Unit Tests (Vitest + RTL)

- All unit tests live in `src/modules/<feature>/components/__tests__/` co-located with components.
- Use `renderWithRoute` from `src/test/utils.tsx` — it wraps providers (QueryClient, ThemeProvider, RouteProvider).
- Pre-populate query cache with `staleTime: Infinity` so tests are synchronous — no `waitFor` unless testing async behavior.
- Prefer `getByRole` + accessible name over `getByTestId`.
- Mock `Element.prototype.scrollIntoView` in setup — jsdom doesn't implement it.

### E2E Tests (Playwright)

- E2E tests live in `e2e/`.
- Playwright starts `pnpm dev` automatically via `webServer` config.
- MSW browser worker intercepts API calls — no real backend needed.
- Disambiguate duplicate text with `getByRole('heading', { level: N })`.

### Test Philosophy

- Test behavior, not implementation.
- Never mock the DOM environment for accessibility — use role queries.
- Aria attributes are the source of truth for progress/status components.

---

## Commit Rules

Format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`

Scopes: `fw<N>` for feature work (e.g., `feat(fw3): …`), component name for fixes.

- **Never** add "Co-Authored-By" or AI attribution lines.
- **Never** skip hooks (`--no-verify`).
- Keep commits small and atomic — one logical change per commit.
- Run `pnpm lint` and `pnpm vitest run` before committing. Hooks enforce this.

---

## Review Criteria

When reviewing a PR or commit, check:

1. **No new TypeScript errors** — `pnpm typecheck` must pass clean.
2. **No new lint errors** — `pnpm lint` must pass clean.
3. **No deep cross-module imports** — only barrel imports for other modules.
4. **Tests cover the feature** — new UI logic needs at least one unit test; new user flows need at least one e2e test.
5. **Accessibility** — interactive elements have accessible labels; modals have focus trap (use HeroUI Modal, not custom).
6. **No hardcoded colors** — must use CSS custom property tokens.
7. **Touch targets** — all interactive elements ≥ 44px tall.
8. **No `any`** — TypeScript must stay strict.

---

## Scripts Reference

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server (MSW active, HMR on) |
| `pnpm typecheck` | TypeScript check without emit |
| `pnpm lint` | ESLint check |
| `pnpm lint:fix` | ESLint autofix |
| `pnpm test` | Run unit tests once |
| `pnpm test:watch` | Unit tests in watch mode |
| `pnpm test:e2e` | Run Playwright e2e suite |
| `pnpm build` | TypeScript compile + Vite build |
