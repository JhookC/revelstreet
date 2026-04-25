# Revelstreet UI Style Guide

This guide defines design decisions and UI conventions for the Revelstreet operator interface. All agents building UI must follow these rules. Source of truth is this file + `AGENTS.md`.

---

## 1. Design Philosophy

### Field-First

Operators use this interface outdoors, in vehicles, and in environments with variable lighting, gloved hands, and motion. Every decision prioritizes:

- **Glanceability** — critical state must be readable at a glance, from arm's length, in direct sunlight.
- **Touch safety** — targets are large enough to hit accurately when fatigued, gloved, or in motion.
- **Cognitive load** — only show what the operator needs right now. Hide the rest.
- **Resilience** — the app must still work (or at minimum not lose data) when connectivity drops.

### Progressive Disclosure

Show only the actions available for the current stop. Completed stops show a status summary. Locked stops show nothing interactive. This eliminates decision paralysis.

### Trust Through Feedback

Every status change produces immediate visible feedback (undo toast, progress increment, status pill change). The operator always knows the app registered their action.

---

## 2. Color System

All colors are defined as CSS custom properties in `src/index.css` under `@theme`. **Never use hardcoded hex values.** Use the token.

### Surface Tokens

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--color-surface` | `oklch(98% 0.005 250)` | `oklch(12% 0.01 250)` | Page background |
| `--color-surface-raised` | `oklch(100% 0 0)` | `oklch(17% 0.01 250)` | Cards, panels |
| `--color-surface-sunken` | `oklch(95% 0.005 250)` | `oklch(9% 0.01 250)` | Input backgrounds, inset areas |

### Content Tokens

| Token | Use |
|-------|-----|
| `--color-content` | Primary text |
| `--color-content-muted` | Secondary text (labels, counts) |
| `--color-content-soft` | Tertiary text (timestamps, hints) |
| `--color-border` | Borders, dividers |

### Accent Tokens

| Token | Use |
|-------|-----|
| `--color-accent` | Primary actions, active borders, focus rings |
| `--color-accent-strong` | Hover/active state of primary actions |

### Status Tokens

| Token | Semantic meaning |
|-------|-----------------|
| `--color-status-pending` | Neutral — not started |
| `--color-status-arrived` | Warm amber — operator is at the stop |
| `--color-status-departed` | Blue — operator left, handoff in progress |
| `--color-status-success` | Green — stop completed successfully |
| `--color-status-failed` | Red — stop failed |
| `--color-status-locked` | Dimmed — future stop, not yet actionable |

**Rule:** Status pills, status indicators, and stop type badges MUST use status tokens, not HeroUI's built-in semantic colors (danger/success/warning). This ensures consistent meaning across the interface.

### Color Usage Rules

- Use status tokens only for their defined semantic meaning. Do not use `--color-status-arrived` (amber) for anything other than "operator has arrived."
- `--color-accent` is for navigation and primary call-to-action only — not for decorative elements.
- Text on a status-colored background must pass WCAG AA contrast (4.5:1 for small text).

---

## 3. Typography

No custom fonts — uses the OS system font stack for fastest rendering and best legibility on any device.

```css
font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
```

### Scale (Tailwind utility classes)

| Class | Use |
|-------|-----|
| `text-lg font-semibold` | Stop label (primary content within a card) |
| `text-base font-semibold` | Section headings, button text |
| `text-sm` | Secondary labels, counts, addresses |
| `text-xs` | Timestamps, soft hints |

### Rules

- Use `font-semibold` for all interactive element labels (buttons, action labels).
- Use `tabular-nums` for numeric counters (e.g., "3 / 7 complete") to prevent layout shift.
- Use `truncate` for stop labels and addresses — never let them wrap and push layout.
- Timestamps use `text-xs text-[var(--color-content-soft)]` — visually subordinate.

---

## 4. Layout

### Breakpoint Strategy

The interface is **tablet-first** (768px). Desktop is an acceptable secondary target.

| Context | Rule |
|---------|------|
| Page content | `max-w-2xl mx-auto px-5` |
| Sticky header | `sticky top-0 z-30` |
| Stop list | Full-width list with `gap-3` between items |

Do not target mobile-only layouts (< 480px) until a field study confirms phone use. PWA on tablet is the primary target.

### Z-index Layers

| Layer | Z-index | Elements |
|-------|---------|---------|
| Page content | `0` | Stop cards, body |
| Sticky header | `z-30` | `ProgressHeader` |
| Toast | `z-40` | `UndoToast` |
| Modal / overlay | `z-50` | `FailureReasonSheet` (HeroUI Modal) |
| Offline banner | `z-50` | `OfflineBanner` |

Do not use `z-[999]` or ad-hoc z-indices. Use the table above.

---

## 5. Spacing

Tailwind's default spacing scale. Key values used in the app:

| Value | Pixels | Use |
|-------|--------|-----|
| `p-5` | 20px | Card padding, page horizontal padding |
| `gap-3` | 12px | Gap between stop cards |
| `gap-2` | 8px | Gap between action buttons, internal card gaps |
| `mt-4` | 16px | Space before action buttons within a card |
| `mt-2` | 8px | Space before secondary info (timestamps, hints) |

---

## 6. Components

### Stop Card (`StopRow`)

- Background: `bg-[var(--color-surface-raised)]`
- Border: `border border-[var(--color-border)]` (inactive), `border-accent ring-2 ring-accent/30` (active)
- Radius: `rounded-3xl`
- Locked state: `opacity-50`
- Order badge: round avatar-style badge, colored by stop type (pickup = amber, delivery = blue)

### Status Pill (`StatusPill`)

Maps each `StopStatus` to a color and label. Reference:

| Status | Text color | Background | Label |
|--------|-----------|------------|-------|
| `pending` | `text-status-pending` | `bg-status-pending/15` | Pending |
| `arrived` | `text-status-arrived` | `bg-status-arrived/15` | Arrived |
| `departed` | `text-status-departed` | `bg-status-departed/15` | Departed |
| `success` (pickup) | `text-status-success` | `bg-status-success/15` | Picked up |
| `success` (delivery) | `text-status-success` | `bg-status-success/15` | Delivered |
| `failed` | `text-status-failed` | `bg-status-failed/15` | Failed |

### Action Buttons

Use HeroUI `<Button>` with `onPress`. Always `size="lg"` for field use.

| Action | Variant | Custom classes |
|--------|---------|----------------|
| Mark Arrived / Departed | `default` (primary) | — |
| Picked up / Delivered | `default` with override | `bg-status-success text-white hover:brightness-110` |
| Failed… | `ghost` with override | `bg-status-failed/10 text-status-failed ring-1 ring-inset ring-status-failed/30` |

### Progress Bar (`ProgressHeader`)

- HeroUI `<ProgressBar>` compound component.
- Track: `h-2 bg-[var(--color-surface-sunken)]`
- Fill: `bg-status-success transition-all duration-300 ease-out`
- No percentage label shown — just the visual bar and the `N / M complete` text.

### Modal / Bottom Sheet (`FailureReasonSheet`)

- HeroUI `<Modal>` in controlled mode (`Modal.Backdrop isOpen={…}`)
- Placement `"bottom"` on mobile (slides up), centered on desktop.
- Focus trap and keyboard dismiss handled by React Aria (do NOT implement manually).

### Undo Toast (`UndoToast`)

- Fixed bottom, `z-40`
- Background: inverted — `bg-[var(--color-content)] text-[var(--color-surface)]`
- Auto-dismiss: 5 seconds. Undo window is explicit — not a time-based commit.
- `role="status" aria-live="polite"` for screen reader announcement.

### Offline Banner (`OfflineBanner`)

- Fixed top, `z-50`, full width
- `bg-status-failed text-white`
- `role="status" aria-live="polite"` — screen readers announce when it appears/disappears.

---

## 7. Interaction Patterns

### Touch Targets

Every interactive element must be `min-h-[44px]`. For action buttons on stop cards, use `size="lg"` which provides sufficient height. For icon-only buttons, add `size-10` or `min-h-[44px] min-w-[44px]`.

### Focus Management

- All interactive elements must have visible focus rings.
- Use `focus-visible:outline-2 focus-visible:outline-offset-2` with an appropriate color token.
- For modals, use HeroUI `<Modal>` — React Aria handles the focus trap automatically. Never implement a manual focus trap.

### Keyboard Shortcuts (Dispatcher)

`A` = arrived, `D` = departed, `S` = success, `F` = failed — applied to the current active stop. Implemented in `useKeyboardShortcuts`. Shortcuts are disabled when focus is inside an `input`, `textarea`, `select`, or `contenteditable`.

### Scroll Behavior

After marking a stop departed, the next active stop is scrolled into view with `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`. This removes a manual step every stop.

---

## 8. Dark Mode

Dark mode is toggled by the `ThemeProvider` which sets:
1. `data-theme="dark"` on `<html>` — activates `[data-theme='dark']` CSS overrides in `index.css`
2. `.dark` class on `<html>` — activates HeroUI dark mode styles

The toggle persists to `localStorage` with key `revelstreet:theme`. On first load, the device's `prefers-color-scheme` preference is respected.

**Rule:** Every component must look correct in both light and dark mode. Always use CSS custom property tokens, which are automatically overridden in dark mode.

---

## 9. Accessibility Checklist

Before shipping any UI change, verify:

- [ ] All interactive elements are keyboard-reachable and have visible focus indicators
- [ ] All images/icons that carry meaning have `aria-label` or `alt` text
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Status/progress components have `role="progressbar"` or `role="status"` with appropriate aria attributes
- [ ] Modals trap focus and announce with dialog role (use HeroUI Modal)
- [ ] Color is never the sole indicator of meaning (pairs with text label)
- [ ] Touch targets are ≥ 44px

---

## 10. Research Notes — Delivery App UX Patterns

Key observations from leading delivery operator apps (DoorDash Dasher, Uber Eats Driver, Instacart Shopper):

**What they share:**
- Large map view dominates the screen (not applicable for MVP — deferred to Mapbox phase)
- Single active task surfaced prominently — all other tasks are in the background
- Status transitions are one-tap — no multi-step confirmation for common actions
- Earnings/progress always visible in sticky header
- Vibration + sound feedback on new assignment (deferred — native capability)
- Offline resilience: orders accepted offline are queued and sent when reconnected

**What we borrowed:**
- Sticky progress header (like DoorDash's earnings banner)
- Linear stop ordering with locked future stops (like Instacart's shopping list)
- Large touch targets and `text-lg` labels (universal in field apps)
- Color-coded status at a glance (universal)
- Undo for misclicks (Uber Eats has this for order issues)

**What we intentionally skipped (for MVP):**
- Map view — adds significant complexity, deferred to FW7
- Push notifications — requires native wrapper
- Camera (photo proof of delivery) — deferred to FW14
- Voice feedback — not in scope
