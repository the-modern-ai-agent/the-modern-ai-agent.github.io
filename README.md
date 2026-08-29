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
- **People** (header link → `people.html`): the researchers behind the milestones as an era-filtered card grid — what each contributed, where they are now, their milestones on the timeline, and a Wikipedia link where an article exists.
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

## Add or edit a person

The People page reads `people[]` from the same `data.json`. Each object has:

- `id` (unique), `name`, `era`: `"ai" | "llm" | "agent"` — the era of the work they're best known
  for here, which drives the card's accent color and the page's era filter.
- `knownFor`: a one-line list of contributions, ` · `-separated.
- `bio`: 2–3 sentences on what they contributed and why it mattered.
- `now`: one line on where they are today. For people who have died this is a legacy note instead —
  the page renders both the same way and deliberately uses no "Now:" label, so either reads naturally.
- `wikipedia`: an `en.wikipedia.org` URL, or `null` when no article exists (the card then shows a
  muted "No Wikipedia article" instead of a link). Some people have no biography but their work
  does — Gerganov links to `Llama.cpp`, Tri Dao to `Mamba`. The pill names the article in that case
  ("Wikipedia: Llama.cpp ↗") so it doesn't read as a profile link; `wikiPill()` in `people.js`
  decides by matching the person's surname against the article title. **Check the article is
  actually about the right person** — "Georgi Gerganov" on Wikipedia is a Bulgarian basketball
  player, and the "Shunyu Yao" article does not clearly describe the ReAct author.
- `eventIds`: ids of this person's milestones on the timeline, rendered as chips linking to
  `index.html#<event-id>`. Use `[]` for none. The validator checks every id resolves, so renaming an
  event surfaces as a failure rather than a dead chip. `app.js` reads that hash on load, forces
  Detailed view, and pins the event.

**`now` lines go stale.** Affiliations in this field change often; they were written as best-effort
and current as of 2026, and the page footer says so. Re-check them when touching this data.

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
