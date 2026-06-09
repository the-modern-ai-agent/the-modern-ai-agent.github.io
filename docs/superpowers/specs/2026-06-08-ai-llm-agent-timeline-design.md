# AI → LLM → Agent Interactive Timeline — Design

**Date:** 2026-06-08
**Status:** Approved (pending spec review)

## Context

The user wants an interactive web page that tells the story of AI's evolution across three eras — **classic AI → LLMs → Agents** — anchored to the major research papers and white papers that drove each leap. The page is a personal/educational artifact: a single visual reference you can scroll through to see how the field built on itself, with each milestone linking out to its primary source (papers preferred over blogs, with flexibility where no paper exists).

The goal is something that reads like a polished research artifact, not a generic AI-generated page: a scrollable timeline where hovering reveals a quick summary and clicking opens a richer, sourced explanation.

## Decisions (all confirmed via visual brainstorming)

| Decision | Choice |
|----------|--------|
| **Layout** | Vertical scroll "spine" — a gradient line (AI→LLM→Agent) you scroll top→bottom, events branching off it |
| **Aesthetic** | Modern dark / technical — dark background, neon per-era accents (AI = cyan, LLM = purple, Agent = green), monospace numerals |
| **Scope** | Comprehensive — ~55 events spanning 1950 → 2024 |
| **Hover** | Hovering an event **expands its short summary inline below the entry**, pushing lower events down (soft-accordion feel). Animated open/close, not a hard snap. |
| **Click** | Clicking **pins a full detail panel on the right side**: era label, title, authors/year, expanded description, optional inline diagram, an "impact" callout, and a paper link. Plays a "growing / opening" reveal animation with inner content cascading in. |
| **Delivery** | Small static project — `index.html`, `styles.css`, `app.js`, `data.json`. No build step, no dependencies. Open `index.html` directly. |
| **View toggle** | A top-right toggle switches between **Brief recap** (~15 nodes, with related events grouped & summarized together) and **Detailed** (~55 events). Same UI/UX in both modes. Choice persists across reloads. |

## Architecture

A dependency-free static site. Four files, each with one job:

- **`data.json`** — the single source of truth: the full `events[]` array (~55) **plus** a `brief[]` array (~15) defining the recap view. All content lives here so the timeline can be edited without touching code.
- **`index.html`** — minimal skeleton: a header with the **Brief / Detailed toggle** (top-right), the two-pane layout (`<main>` = spine column + detail panel), and script/style links. No event markup (rendered from data).
- **`styles.css`** — the dark/technical theme, era color tokens (CSS custom properties), spine + node styling, inline-expand animation, the right-panel reveal animation, and the toggle control + view-switch transition.
- **`app.js`** — fetches `data.json`, renders the spine from the active view's list, and wires interaction: hover→inline expand, click→pin detail panel + animate, toggle→re-render from the other list. Vanilla JS, no framework.

### Data flow

```
data.json ──fetch──> app.js ──┬─ view = "detailed" ─> render events[]  ─┐
                              └─ view = "brief"    ─> render brief[]    ├─> spine nodes (left)
                                    ▲                                    │
                          toggle (top-right) ─ re-render + persist ──────┘
                                    │
                  hover ───────────►│ toggle inline summary (CSS animation)
                  click ───────────►│ populate + reveal right panel (CSS animation)
```

### Event data model (`data.json`)

```jsonc
{
  "id": "transformers-2017",      // stable slug, used for deep-link anchors
  "year": 2017,
  "era": "llm",                    // "ai" | "llm" | "agent" — drives color
  "title": "Attention Is All You Need",
  "authors": "Vaswani et al., Google Brain",
  "short": "One-sentence hover summary.",          // shown on hover (inline)
  "long": "2–4 sentence expanded description.",     // shown in right panel
  "impact": "Why it mattered, one line.",           // green callout in panel
  "diagram": "attention",          // optional: key into a small set of inline SVG sketches, or null
  "link": { "label": "arXiv:1706.03762", "url": "https://arxiv.org/abs/1706.03762" }
}
```

`diagram` is optional and only set for a handful of the most illustrative events (e.g. self-attention, perceptron, RLHF loop, ReAct loop). When `null`, the panel simply omits the diagram block. Diagrams are tiny hand-authored inline SVGs keyed by name in `app.js` — not images, so the project stays self-contained.

### Brief recap model (`brief[]`)

`brief[]` is an ordered list (chronological) where each entry is one of two shapes:

```jsonc
// (a) passthrough — reuse a landmark detailed event verbatim
{ "ref": "transformers-2017" }

// (b) group — a synthesized node summarizing several detailed events together
{
  "id": "pretraining-explosion",
  "yearLabel": "2018–2019",        // range shown on the node (vs single `year`)
  "era": "llm",
  "title": "The pretraining explosion",
  "short": "BERT, GPT-1/2, T5 & RoBERTa establish transfer learning from large pretrained transformers.",
  "long": "2–4 sentence synthesis of the cluster.",
  "impact": "Pretraining + fine-tuning becomes the default NLP recipe.",
  "memberIds": ["bert-2018","gpt1-2018","gpt2-2019","t5-2019","roberta-2019"],
  "diagram": null,
  "link": { "label": "BERT — arXiv:1810.04805", "url": "https://arxiv.org/abs/1810.04805" }
}
```

A **group** renders like any node; its pinned right-panel shows the synthesized `long`/`impact` and additionally lists its member milestones (`memberIds` → looked up in `events[]`) as a compact "covers:" list, each linking to its own paper. A **passthrough** simply renders the referenced event. The renderer normalizes both shapes (and `year` vs `yearLabel`) so hover/click code is identical across views.

### Era color tokens

```
--era-ai:    cyan    (#7ee0ff)   classic AI → deep learning
--era-llm:   purple  (#b39dff)   language models
--era-agent: green   (#7dffb0)   agents
```

The spine is a vertical gradient flowing cyan→purple→green; each node, hover border, and panel accent uses its era token.

## Event list (~55, draft — final wording/links during implementation)

**Classic AI → Deep Learning (era: ai)**
Turing Test (1950) · Dartmouth Workshop (1956) · Perceptron (1958) · "Perceptrons" / 1st AI winter (1969) · Backpropagation (1986) · CNNs / LeNet (1989) · LSTM (1997) · AlexNet (2012) · GANs (2014) · Adam optimizer (2014) · ResNet (2015) · Batch/Layer Norm (2015)

**Language Models (era: llm)**
Word2Vec (2013) · Seq2Seq + Attention / Bahdanau (2014) · Transformers (2017) · BERT (2018) · GPT-1 (2018) · GPT-2 (2019) · T5 (2019) · RoBERTa (2019) · Transformer-XL (2019) · GPT-3 (2020) · Scaling Laws / Kaplan (2020) · LoRA (2021) · Codex (2021) · Switch Transformer / MoE (2021) · PaLM (2022) · Chinchilla (2022) · FlashAttention (2022) · InstructGPT / RLHF (2022) · ChatGPT launch (2022) · GPT-4 (2023) · LLaMA (2023) · Llama-2 (2023) · Mistral 7B (2023) · DPO (2023) · Gemini (2023) · Claude 3 (2024) · GPT-4o (2024) · o1 reasoning models (2024)

**Agents (era: agent)**
Chain-of-Thought (2022) · ReAct (2022) · Toolformer (2023) · HuggingGPT (2023) · Reflexion (2023) · Generative Agents (2023) · Tree-of-Thoughts (2023) · Voyager (2023) · AutoGPT (2023) · SWE-bench (2024) · Devin (2024) · Computer-use agents (2024) · Multi-agent frameworks (2024) · Model Context Protocol / MCP (2024)

> Counts to ~55. The user is free to add/cut any event; this is a starting curation. RAG (2020, era llm) to be slotted in as well.

### Brief recap composition (~15 nodes, draft)

Mix of landmark passthroughs (★) and groups (▣). Final wording during implementation.

**AI era**
- ▣ **Foundations of AI (1950–1958)** — Turing Test, Dartmouth, Perceptron
- ▣ **Neural nets mature (1986–1997)** — Backprop, CNNs/LeNet, LSTM
- ★ **AlexNet (2012)** — deep learning ignition
- ▣ **The deep-learning toolkit (2014–2015)** — GANs, Adam, ResNet, normalization

**LLM era**
- ▣ **Embeddings & attention (2013–2014)** — Word2Vec, Seq2Seq + Attention
- ★ **Transformers (2017)**
- ▣ **The pretraining explosion (2018–2019)** — BERT, GPT-1/2, T5, RoBERTa
- ★ **GPT-3 & scaling laws (2020)** — GPT-3, Kaplan scaling laws, RAG
- ▣ **Efficient & aligned LLMs (2021–2022)** — LoRA, Chinchilla, FlashAttention, InstructGPT/RLHF
- ★ **ChatGPT (2022)** — the inflection point
- ▣ **Frontier & open models (2023–2024)** — GPT-4, LLaMA/Llama-2, Mistral, DPO, Gemini, Claude 3, GPT-4o, o1

**Agent era**
- ▣ **Reasoning + acting (2022)** — Chain-of-Thought, ReAct
- ▣ **Autonomous & tool-using agents (2023)** — Toolformer, HuggingGPT, Reflexion, Generative Agents, Tree-of-Thoughts, Voyager, AutoGPT
- ▣ **Agents go to work (2024)** — SWE-bench, Devin, computer-use, multi-agent frameworks
- ★ **Model Context Protocol / MCP (2024)** — standardizing tool/context access

Every detailed event belongs to exactly one brief node (group member or passthrough), so the brief view loses no era and the two views stay reconcilable.

### View toggle interaction

- Control lives **top-right** of the header — a two-state segmented toggle ("Recap" / "Detailed"). Default = **Brief recap** (the friendlier entry point); persisted to `localStorage` and restored on load.
- Flipping it re-renders the spine from the other list with a brief cross-fade + reflow (≈200ms); the spine gradient and era grouping are preserved. Any pinned right-panel selection is cleared (or, if the pinned event still exists in the new view, kept) and the empty-state prompt returns otherwise.
- Hover-expand and click-pin behave identically in both views; only the node set differs.

### Link sourcing policy

Prefer the primary research paper or official white paper (arXiv abstract page, ACL anthology, lab publication). For events without a formal paper (ChatGPT launch, AutoGPT, Devin), link the canonical announcement / repo. **During implementation, links will be verified** (WebFetch/WebSearch) rather than relied on from memory, since a dead or wrong link undermines the page's purpose.

## Interaction & animation detail

- **Hover (inline expand):** on `mouseenter`, the event's `short` summary container animates from `max-height:0; opacity:0` to its natural height (≈180ms ease), the node dot pulses/brightens, and lower events reflow down. `mouseleave` reverses it. Only one inline summary open at a time isn't required — natural hover handles it. Keyboard focus mirrors hover for accessibility.
- **Click (pin panel):** clicking sets the event active (persistent purple glowing dot) and populates the right panel. The panel plays a "growing/opening" reveal — a quick scale (≈0.96→1) + fade, and the inner blocks (title → meta → description → diagram → impact → link) cascade in with small staggered delays so it unfolds rather than snaps. Clicking another event re-runs the reveal with new content.
- **Deep links:** `id` slugs enable `#transformers-2017` anchors that auto-pin on load (nice-to-have).
- **Empty state:** before any click, the right panel shows a short "hover to preview · click to pin" prompt.

## Responsive behavior

Desktop is two-pane (spine left, panel right). On narrow screens (< ~720px) the panel moves to a pinned card that appears below the clicked event (or a slide-up sheet), since a side panel won't fit. Hover-expand still works (and is the primary interaction on touch via tap-to-expand).

## Out of scope (YAGNI)

- No search/filter, no zoom, no horizontal pan.
- No backend, no analytics, no build tooling.
- No exhaustive paper bibliography — one best link per event.
- No automated tests beyond manual browser verification (static content site; behavior is visual).

## Verification

1. Open `index.html` directly in a browser (and via a simple `python3 -m http.server` since `fetch` of `data.json` needs http(s) in some browsers — note this in a README line).
2. Confirm all ~55 events render on the spine in chronological order, grouped/colored by era.
3. Hover several events → inline summary animates open/closed; lower events reflow.
4. Click events across all three eras → right panel reveals with the growing/opening animation and correct content; diagram appears only where defined.
5. Click each event's paper link → resolves to a live, correct source (spot-check all; no 404s).
6. Toggle **Recap ⇄ Detailed** → spine re-renders with the cross-fade; brief shows ~15 nodes (groups + landmarks), detailed shows ~55; choice persists across reload.
7. In brief view, click a **group** node → panel shows the synthesized summary plus a "covers:" list of its member milestones, each with a working paper link.
8. Confirm every detailed event maps into exactly one brief node (no era dropped, no orphan).
9. Resize to mobile width → layout collapses gracefully, interactions and toggle still work.
10. Validate `data.json` parses (no trailing-comma errors); every event has required fields; every `brief` `ref`/`memberIds` resolves to a real event `id`.

## Notes

- The project directory is **not** a git repo. This spec is written to disk but not committed; recommend `git init` before implementation if version history is wanted.
- `.superpowers/` (visual-companion mockups) should be added to `.gitignore` if the repo is initialized.
