# Mobile Optimization Pass — Design

**Date:** 2026-06-11
**Status:** Approved design, implementation in progress (uncommitted pending user review)

## Problem

The timeline app is strong on desktop but hard to interact with on mobile. The
root cause is a **hover-first interaction model** plus layout/sizing choices made
for a wide viewport. There is exactly one responsive rule today
(`@media (max-width: 760px)` in `styles.css`) and it only stacks the grid and
header — it does not address touch behavior, tap-target sizing, or the By Year
chart.

## Audit (worst-first)

1. **Hover-first interaction, no hover on touch.** Both views wire previews to
   `mouseenter`/`mouseleave` (`app.js:68-71`, `years.js:77-80`). On touch the
   spine inline-preview and the By Year tooltip never appear, and `:hover` CSS
   states get "stuck" after a tap. Copy says "Hover…" (`index.html:34`,
   `years.html:27`).
2. **Spine tap gives no visible feedback.** At ≤760px the detail panel is
   `order: 2`, rendering below the whole spine, and the index page has no
   `scrollIntoView` on pin (`app.js:115-119`).
3. **By Year chips ~5px wide.** ~76 year-columns share screen width via
   `flex: 1 1 0` + `overflow: visible` (`styles.css:399-406`); chips are
   `max-width: 14px; height: 11px`. Untappable on a phone.
4. **Touch targets under 44px** across nav links, toggle, filter buttons, spine
   events.
5. **Index detail card has no dismiss control on mobile** (years has one;
   `app.js renderDetail` does not).
6. **Glossary tooltips are hover/`:hover`-only** (`styles.css:317-331`).
7. **Sticky header eats viewport** when stacked on small phones.

## Decisions

- **By Year mobile:** horizontal scroll + bigger chips (preserves the
  column-height-as-activity data viz, which is the page's whole point).
- **Detail panel:** bottom-sheet overlay on mobile (both views).
- **Scope:** all seven items.

## Design

### Breakpoint strategy
Two separate axes:
- **Layout** keys off width: keep `≤760px` (stack) and add a tighter `≤480px`
  phone pass.
- **Interaction** keys off capability: `@media (hover: none) and (pointer: coarse)`
  for touch behavior; wrap hover-only visual states in `@media (hover: hover)` so
  they stop sticking after a tap.

### #1 + #2 + #5 — Detail as a bottom sheet (both views)
On `≤760px`, `.detail` and `.years-detail` become a fixed slide-up sheet: pinned
to the bottom, rounded top, `max-height: ~80vh` with internal scroll, a scrim
behind it, dismiss via close button / scrim tap / Esc. Pinning slides it up —
always visible regardless of scroll position, so no `scrollIntoView` hack is
needed. JS: add the missing close button + scrim on the index page; a small
shared open/close toggle. On touch the spine hover inline-preview is suppressed
(tap opens the full sheet instead).

### #3 — By Year horizontal scroll
On `≤760px`: `.years-scroll` becomes `overflow-x: auto`; `.years-chart` goes
`width: max-content`; columns get `min-width: ~30px` and chips grow (~18–20px,
taller hit area) so the chart overflows and scrolls at a tappable size. Add
left/right edge-fade masks and auto-scroll to the recent dense end on load.
Tooltip-on-hover replaced by tap→sheet (same content).

### #4 — Touch targets ≥44px
Nav links, view toggle, filter buttons, and the detail close button bumped to
~44px on mobile via padding/min-height. Spine events get vertical padding +
`min-height` with the dot position adjusted to match.

### #6 — Glossary tooltips on tap
Lightweight touch path: tapping a `.gloss` toggles its tip open
(tap-elsewhere/scroll closes); viewport-aware max-width so it never overflows.
Hover behavior preserved for mouse.

### #7 — Header compaction
On phone: reduce header padding, shrink the title clamp floor and tagline,
tighten gaps so the sticky header doesn't dominate the viewport.

## Testing
No automated UI tests exist. Manual: responsive devtools at 375px and 768px
(plus a real device if handy) — tap event → sheet up → dismiss; By Year
horizontal scroll + tap a chip; glossary tap; confirm no stuck hover states;
verify desktop unchanged. Run `scripts/validate-data.mjs` to confirm no data
regression (none expected — pure presentation).

## Constraints
- No data or content changes; CSS + small additive JS in `app.js` / `years.js`.
- Desktop hover behavior left intact.
- **Do not commit until the user approves the mobile changes.**
