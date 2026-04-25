# Revelstreet — Drone Delivery Operator Interface

Frontend for a drone-delivery operator app. Operators manage multi-stop runs (restaurant pickups → residential deliveries) for a single drone. MVP is a tablet-first single-route execution screen with offline-friendly progress tracking.

## Stack

- Vite 6 + React 19 + TypeScript (strict)
- Tailwind v4 (CSS-first config)
- `useState` + Context API for state
- Hardcoded mock data (`src/mock/route.ts`) — TanStack Query + MSW will replace this when a backend lands

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173.

## Project structure

```
src/
├── modules/<feature>/   # Feature-bounded; cross-module imports go through index.ts only
├── shared/              # Cross-cutting primitives (none yet)
├── routes/              # Route definitions
└── mock/                # Mock data
```

## Docs

All plans, research, and decisions live in [`docs/`](./docs).
