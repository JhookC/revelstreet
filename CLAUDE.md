# CLAUDE.md — Revelstreet

This file configures Claude Code's behavior in this repository.

## Project

Drone-delivery operator interface — tablet-first SPA + PWA. One active feature: route execution (operator marks stops arrived / departed / success / failed with undo and failure-reason picker).

## Standards

All coding standards, architecture rules, and review criteria are in **[AGENTS.md](./AGENTS.md)**. Read it before writing any code.

## Key Rules (Quickref)

- Zero tolerance for TypeScript and lint errors. Run `pnpm typecheck && pnpm lint` before committing.
- No deep imports across modules — use barrels: `@/modules/route-execution`.
- HeroUI Button uses `onPress`, not `onClick`.
- Never hardcode colors — use CSS token variables (`--color-surface`, etc.).
- No `any` types.
- No AI attribution in commits. Conventional commits format only.
- Never build (`pnpm build`) during development — `pnpm dev` only.

## Style Guide

> Full UX style guide: `docs/style-guide.md` (pending — see FW9 in backlog)

Interim rules:
- Tablet-first layout: `max-w-2xl mx-auto px-5`
- Touch targets: `min-h-[44px]` minimum on all interactive elements
- Sticky progress header at `top-0 z-30` with `backdrop-blur`
- Status colors mapped to `--color-status-*` tokens (not HeroUI's built-in danger/success)

## Useful Commands

```bash
pnpm dev          # start dev server
pnpm test         # run all unit tests
pnpm test:e2e     # run Playwright
pnpm typecheck    # TypeScript check
pnpm lint         # ESLint check
```
