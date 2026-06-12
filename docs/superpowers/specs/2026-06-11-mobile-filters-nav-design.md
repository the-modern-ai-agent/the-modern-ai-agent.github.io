# Mobile Pass 2 — Filters & Navigation

**Date:** 2026-06-11
**Status:** Approved design, implementation in progress (uncommitted pending review)

## Problem

Follow-up to the 2026-06-11 mobile optimization pass. Two controls remain weak
on small screens:

- **Filters (primary).** The `#filters` bar (Detailed view only) is a flex row of
  a `Filter` label + `All / Papers / Models / Products` pills. With 44px-min
  pills it **wraps to two rows** (~96px) under an already-tall sticky header, and
  the bar **isn't sticky**, so scrolling the spine scrolls it away.
- **Navigation (secondary).** The header's `.header-actions` (3 nav pills + the
  Recap/Detailed toggle on index) goes column + wrap on mobile, so the pills
  wrap to two rows and the sticky header eats viewport.

## Decisions
- **Filters:** collapsible `Filter ▾` trigger that expands a dropdown of options.
- **Navigation:** hamburger ☰ → right slide-in drawer.

## Design

### A. Collapsible filter (index · Detailed · mobile)
- Desktop unchanged: inline `Filter` label + pill row (options wrapped in a
  `display: contents` container so layout is identical).
- Mobile: bar collapses to a single `Filter ▾` trigger pill showing the active
  type (`Filter: Papers`) and highlighting itself when a non-`All` filter is
  applied. Tap → dropdown of option pills; pick → applies + closes;
  outside-tap/Esc closes. Standalone label hidden (trigger carries it).
- Code (`app.js`): `buildFilters()` prepends the trigger and wraps options in
  `.filter-options`; `toggleFilterMenu`/`closeFilterMenu` state; `syncFilterBar`
  updates the trigger value + `.is-filtered`; outside-click + Esc close.

### B. Hamburger nav drawer (all four pages · mobile)
- New shared `nav.js` (added to index/years/references/editorial — editorial had
  no page script) clones the header's `.nav-link`s into a right slide-in drawer,
  adds a ☰ button + scrim. Dismiss via scrim, Esc, ×, or link tap.
- Mobile: inline `.nav-link`s hide, ☰ shows; the **Recap/Detailed toggle stays in
  the header** (primary control, not buried). Header row becomes `[toggle] [☰]`.
- Desktop unchanged: inline nav, ☰/drawer CSS-hidden above 760px.

## Conventions / guardrails
- Reuses the prior pass's scrim/Esc/`@media (hover|width)` patterns.
- Nav drawer gets its own scrim (`body.nav-open`), separate from the detail
  bottom-sheet scrim, so they don't collide. z-order: detail scrim/sheet 55/60,
  nav scrim/drawer 65/70.
- Off-canvas drawer uses `transform` (no layout overflow) — never `right`-offset.
- Collapsed `Filter ▾` is intentionally non-sticky this pass (fragile under a
  variable-height sticky header); compact trigger already fixes the footprint.

## Testing
Manual at 375px / 768px + desktop: filter trigger opens/applies/closes, reflects
active type; hamburger opens drawer, links navigate, scrim/Esc/× dismiss; toggle
still visible on index; desktop unchanged. `node --check` all JS + run
`scripts/validate-data.mjs`.

**Do not commit until the user approves.**
