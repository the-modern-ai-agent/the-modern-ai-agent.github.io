# AI → LLM → Agent — Interactive Timeline

A single-page, dependency-free interactive timeline of AI history.

## Run

The page loads its data with `fetch('data.json')`, which browsers block on the
`file://` protocol. Serve it over http instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Views & controls

- **Recap ⇄ Detailed** (top-right): Recap shows ~22 grouped milestones; Detailed shows every event.
- **Type filters** (`All / Papers / Models / Products`): shown in Detailed view only; `type` is per-event.
- **Hover** an event for a short summary; **click** to pin the full panel (long summary, optional diagram/image, impact, source link).
- **References** (header link → `references.html`): every source link grouped by domain, listed as `date — topic` and sorted oldest-first. Domains are ordered by how many references they anchor.
- **By Year** (header link → `years.html`): a horizontal, year-grouped view — one column per calendar year (empty years kept, to scale), an era-colored block per event stacked so column height shows activity. Hover for a summary, click to pin the full detail card.
- **Editorial** (header link → `editorial.html`): a short note on what's included, what's left out, and how events are categorized and dated.

Shared rendering (era labels, diagrams, the acronym glossary, the detail card) lives in `timeline-core.js`, loaded by both `app.js` (spine) and `years.js` (by-year).

## Add or edit an event

All content lives in `data.json`. Each `events[]` object has:

- `id`, `year` (int) — or `yearLabel` (string range) for brief groups.
- `date` (optional): best-effort source date as `YYYY-MM-DD`, `YYYY-MM`, or `YYYY`. Used by the
  References page; falls back to `year` when absent. arXiv entries use the v1 submission date,
  models/products their announcement date.
- `era`: `"ai" | "llm" | "agent"` (drives the color).
- `type`: `"paper" | "model" | "product"` (drives the filters).
- `short` (one-line hover), `long` (3–4 sentence panel summary), `impact` (one line), `authors`, `link {label,url}`.
- `diagram` (optional): one of the allowed keys defined in `DIAGRAMS` in `app.js`
  (`attention, perceptron, rlhf, react, backprop, gan, resnet, rag, moe, cot, mcp, reasoning`), else `null`.
- `image` (optional): `{ "src": "assets/<file>", "alt": "...", "credit": "..." }`.

To surface an event in Recap, add `{ "ref": "<id>" }` to `brief[]` or include its `id` in a group's `memberIds`.

### Adding a visual

- **Diagram:** add a new inline SVG under `DIAGRAMS` in `app.js`, then set `"diagram": "<key>"` on the event
  and add the key to the validator's allowed list.
- **Image:** drop a file in `assets/` and reference it via the `image` field. The committed images are
  hand-authored SVGs (no licensing concerns). If you add raster figures/photos/screenshots, make sure you have
  the right to redistribute them and set a `credit`.

Validate before committing:

```bash
node scripts/validate-data.mjs
```
