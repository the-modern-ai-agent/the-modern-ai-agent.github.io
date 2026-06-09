# AI → LLM → Agent Interactive Timeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free static web page that presents the history of AI as a vertical, scrollable timeline spine — classic AI → LLMs → Agents — where hovering an event expands a short summary inline, clicking pins a richly-detailed sourced panel on the right, and a top-right toggle switches between a grouped "Brief recap" and the full "Detailed" view.

**Architecture:** Four static files, no build step. `data.json` is the single source of truth (full `events[]` + a `brief[]` recap list). `app.js` (vanilla JS) fetches it, renders the active view's spine, and wires hover/click/toggle interaction. `styles.css` holds the dark/technical theme, era color tokens, and the two signature animations (inline hover-expand, right-panel "opening" reveal). `index.html` is a thin skeleton.

**Tech Stack:** HTML5, CSS3 (custom properties, transitions/keyframes, inline SVG), vanilla ES2020 JavaScript (`fetch`, no framework). Node.js used only for a tiny offline data-validation script. Served over `http://` (a one-liner `python3 -m http.server`) because `fetch('data.json')` is blocked on `file://` in some browsers.

**Reference spec:** `docs/superpowers/specs/2026-06-08-ai-llm-agent-timeline-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `index.html` | Skeleton: header (title + view toggle), `<main>` with `#spine` column and `#detail` panel, script/style links. No event markup. |
| `styles.css` | Theme, era color tokens, spine/node layout, hover-expand animation, panel reveal animation, toggle control, responsive rules. |
| `data.json` | `{ "events": [...~55], "brief": [...~15] }`. All content. |
| `app.js` | Fetch data, render active view, normalize entry shapes, wire hover/click/toggle, manage `localStorage` view state. |
| `scripts/validate-data.mjs` | Offline integrity check for `data.json` (required fields, era enum, `ref`/`memberIds` resolve, chronological order). Run with `node`. |
| `README.md` | How to run (`python3 -m http.server 8000`) + how to add an event. |

**Era color tokens (used everywhere):** `--era-ai: #7ee0ff` (cyan), `--era-llm: #b39dff` (purple), `--era-agent: #7dffb0` (green). Spine gradient flows cyan → purple → green.

---

## Verified reference links (use these exact URLs in `data.json`)

Confirmed canonical sources. arXiv links go to the `/abs/` page. **Step in Task 9 re-checks every one for HTTP 200 before sign-off.**

| id | source URL |
|----|-----------|
| turing-1950 | https://academic.oup.com/mind/article/LIX/236/433/986238 |
| dartmouth-1956 | http://jmc.stanford.edu/articles/dartmouth/dartmouth.pdf |
| perceptron-1958 | https://psycnet.apa.org/record/1959-09865-001 |
| ai-winter-1969 | https://mitpress.mit.edu/9780262630221/perceptrons/ |
| backprop-1986 | https://www.nature.com/articles/323533a0 |
| cnn-lenet-1989 | http://yann.lecun.com/exdb/publis/pdf/lecun-89e.pdf |
| lstm-1997 | https://www.bioinf.jku.at/publications/older/2604.pdf |
| alexnet-2012 | https://proceedings.neurips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html |
| gan-2014 | https://arxiv.org/abs/1406.2661 |
| adam-2014 | https://arxiv.org/abs/1412.6980 |
| resnet-2015 | https://arxiv.org/abs/1512.03385 |
| batchnorm-2015 | https://arxiv.org/abs/1502.03167 |
| word2vec-2013 | https://arxiv.org/abs/1301.3781 |
| seq2seq-attention-2014 | https://arxiv.org/abs/1409.0473 |
| transformers-2017 | https://arxiv.org/abs/1706.03762 |
| bert-2018 | https://arxiv.org/abs/1810.04805 |
| gpt1-2018 | https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf |
| gpt2-2019 | https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf |
| t5-2019 | https://arxiv.org/abs/1910.10683 |
| roberta-2019 | https://arxiv.org/abs/1907.11692 |
| transformer-xl-2019 | https://arxiv.org/abs/1901.02860 |
| scaling-laws-2020 | https://arxiv.org/abs/2001.08361 |
| gpt3-2020 | https://arxiv.org/abs/2005.14165 |
| rag-2020 | https://arxiv.org/abs/2005.11401 |
| lora-2021 | https://arxiv.org/abs/2106.09685 |
| codex-2021 | https://arxiv.org/abs/2107.03374 |
| switch-moe-2021 | https://arxiv.org/abs/2101.03961 |
| palm-2022 | https://arxiv.org/abs/2204.02311 |
| chinchilla-2022 | https://arxiv.org/abs/2203.15556 |
| flash-attention-2022 | https://arxiv.org/abs/2205.14135 |
| instructgpt-rlhf-2022 | https://arxiv.org/abs/2203.02155 |
| chatgpt-2022 | https://openai.com/index/chatgpt/ |
| gpt4-2023 | https://arxiv.org/abs/2303.08774 |
| llama-2023 | https://arxiv.org/abs/2302.13971 |
| llama2-2023 | https://arxiv.org/abs/2307.09288 |
| mistral-2023 | https://arxiv.org/abs/2310.06825 |
| dpo-2023 | https://arxiv.org/abs/2305.18290 |
| gemini-2023 | https://arxiv.org/abs/2312.11805 |
| claude3-2024 | https://www.anthropic.com/news/claude-3-family |
| gpt4o-2024 | https://openai.com/index/hello-gpt-4o/ |
| o1-2024 | https://openai.com/index/learning-to-reason-with-llms/ |
| chain-of-thought-2022 | https://arxiv.org/abs/2201.11903 |
| react-2022 | https://arxiv.org/abs/2210.03629 |
| toolformer-2023 | https://arxiv.org/abs/2302.04761 |
| hugginggpt-2023 | https://arxiv.org/abs/2303.17580 |
| reflexion-2023 | https://arxiv.org/abs/2303.11366 |
| generative-agents-2023 | https://arxiv.org/abs/2304.03442 |
| tree-of-thoughts-2023 | https://arxiv.org/abs/2305.10601 |
| voyager-2023 | https://arxiv.org/abs/2305.16291 |
| autogpt-2023 | https://github.com/Significant-Gravitas/AutoGPT |
| swe-bench-2024 | https://arxiv.org/abs/2310.06770 |
| devin-2024 | https://cognition.ai/blog/introducing-devin |
| computer-use-2024 | https://www.anthropic.com/news/3-5-models-and-computer-use |
| multi-agent-2024 | https://arxiv.org/abs/2308.08155 |
| mcp-2024 | https://www.anthropic.com/news/model-context-protocol |

For brief **group** nodes, use the most representative member's link (specified in Task 6).

---

## Task 1: Scaffold project + run instructions

**Files:**
- Create: `index.html`, `styles.css`, `app.js`, `data.json`, `README.md`, `.gitignore`

- [ ] **Step 1: Initialize git and ignore the brainstorm scratch dir**

Run:
```bash
cd /Users/johnford2002/dev/personal/the-modern-ai-agent
git init
printf ".superpowers/\n.DS_Store\n" > .gitignore
```

- [ ] **Step 2: Create the HTML skeleton**

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI → LLM → Agent · A Timeline</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="site-header">
    <div class="title-block">
      <h1>From Machines that Think to Agents that Act</h1>
      <p class="tagline">Seven decades of AI, the papers that bent the curve — <span class="era-ai">classic AI</span> → <span class="era-llm">language models</span> → <span class="era-agent">agents</span>.</p>
    </div>
    <div class="view-toggle" role="group" aria-label="View density">
      <button id="toggle-brief" class="toggle-btn is-active" data-view="brief" aria-pressed="true">Recap</button>
      <button id="toggle-detailed" class="toggle-btn" data-view="detailed" aria-pressed="false">Detailed</button>
    </div>
  </header>

  <main class="timeline">
    <section id="spine" class="spine" aria-label="Timeline events"></section>
    <aside id="detail" class="detail" aria-live="polite">
      <div class="detail-empty">
        <p class="detail-empty-icon">◷</p>
        <p>Hover an event to preview it.<br/>Click to pin the full story here.</p>
      </div>
    </aside>
  </main>

  <footer class="site-footer">
    <p>A best-effort timeline. Links point to primary papers where they exist, official announcements otherwise.</p>
  </footer>

  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Write the README run instructions**

Create `README.md`:
```markdown
# AI → LLM → Agent — Interactive Timeline

A single-page, dependency-free interactive timeline of AI history.

## Run

The page loads its data with `fetch('data.json')`, which browsers block on the
`file://` protocol. Serve it over http instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Add or edit an event

All content lives in `data.json`:

- Add an object to `events[]` (see the field list at the top of any entry).
- `era` must be one of `"ai" | "llm" | "agent"` (drives the color).
- To surface it in the Recap view, either add `{ "ref": "<id>" }` to `brief[]`
  or include its `id` in a group's `memberIds`.

Validate before committing:

```bash
node scripts/validate-data.mjs
```
```

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css app.js data.json README.md .gitignore
git commit -m "chore: scaffold timeline project"
```
(`styles.css`, `app.js`, `data.json` are empty placeholders for now — create them empty so the commit is coherent.)

---

## Task 2: Data validation script (write the test first)

The "test" for a data-driven static site is a validator over `data.json`. Build it before the data so authoring is checked continuously.

**Files:**
- Create: `scripts/validate-data.mjs`

- [ ] **Step 1: Write the validator**

Create `scripts/validate-data.mjs`:
```js
import { readFile } from 'node:fs/promises';

const ERAS = new Set(['ai', 'llm', 'agent']);
const REQUIRED = ['id', 'era', 'title', 'short', 'long', 'impact', 'link'];

const raw = await readFile(new URL('../data.json', import.meta.url), 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('FAIL: data.json is not valid JSON —', e.message);
  process.exit(1);
}

const errors = [];
const events = data.events ?? [];
const brief = data.brief ?? [];
const ids = new Set();

for (const ev of events) {
  for (const f of REQUIRED) {
    if (ev[f] == null || ev[f] === '') errors.push(`event "${ev.id ?? '?'}" missing "${f}"`);
  }
  if (!ERAS.has(ev.era)) errors.push(`event "${ev.id}" has bad era "${ev.era}"`);
  if (ev.year == null && ev.yearLabel == null) errors.push(`event "${ev.id}" needs year or yearLabel`);
  if (!ev.link?.url || !ev.link?.label) errors.push(`event "${ev.id}" link needs {label,url}`);
  if (ids.has(ev.id)) errors.push(`duplicate event id "${ev.id}"`);
  ids.add(ev.id);
}

// every brief entry resolves
for (const b of brief) {
  if (b.ref) {
    if (!ids.has(b.ref)) errors.push(`brief ref "${b.ref}" has no matching event`);
  } else {
    for (const f of ['id', 'era', 'title', 'short', 'long', 'impact', 'link']) {
      if (b[f] == null || b[f] === '') errors.push(`brief group "${b.id ?? '?'}" missing "${f}"`);
    }
    for (const m of b.memberIds ?? []) {
      if (!ids.has(m)) errors.push(`brief group "${b.id}" memberId "${m}" has no matching event`);
    }
  }
}

// every detailed event must appear in brief exactly once (passthrough or member)
const covered = new Map();
for (const b of brief) {
  if (b.ref) covered.set(b.ref, (covered.get(b.ref) ?? 0) + 1);
  for (const m of b.memberIds ?? []) covered.set(m, (covered.get(m) ?? 0) + 1);
}
for (const ev of events) {
  const n = covered.get(ev.id) ?? 0;
  if (n === 0) errors.push(`event "${ev.id}" is not represented in any brief node`);
  if (n > 1) errors.push(`event "${ev.id}" appears in ${n} brief nodes (must be exactly 1)`);
}

if (errors.length) {
  console.error(`FAIL: ${errors.length} problem(s) in data.json:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`OK: ${events.length} events, ${brief.length} brief nodes, all checks pass.`);
```

- [ ] **Step 2: Run it against empty data to verify it fails informatively**

Put `{"events":[],"brief":[]}` in `data.json`, then run:
```bash
node scripts/validate-data.mjs
```
Expected: `OK: 0 events, 0 brief nodes, all checks pass.` (empty is technically valid). Now temporarily set `data.json` to `{"events":[{"id":"x","era":"bogus"}],"brief":[]}` and re-run.
Expected: FAIL listing missing fields + bad era + "not represented in any brief node".

- [ ] **Step 3: Commit**

```bash
git add scripts/validate-data.mjs
git commit -m "test: add data.json validator"
```

---

## Task 3: Author the full dataset (`data.json`)

This is the content task. Produce `data.json` with `events[]` (~55) and `brief[]` (~15), driven by the verified link table above. The validator from Task 2 is the gate.

**Files:**
- Modify: `data.json`

**Content spec (apply to every entry):**
- `short` — ONE sentence, ≤ 120 chars, plain language. Shown on hover.
- `long` — 2–3 sentences. What it introduced + how it worked, concretely. Shown in panel.
- `impact` — ONE line beginning with a verb ("Became…", "Made…", "Established…"). Green callout.
- `authors` — "Lead et al., Org, Year" form (e.g. `"Vaswani et al., Google Brain, 2017"`).
- `year` — integer for single events; for groups use `yearLabel` string range instead.
- `era` — `"ai" | "llm" | "agent"`.
- `diagram` — `null` for all events EXCEPT the four in Task 8 (`"attention"`, `"perceptron"`, `"rlhf"`, `"react"`).
- `link` — `{ "label": "<short label>", "url": "<from table>" }`. Label form: `"arXiv:1706.03762"` for arXiv, else publisher/site name (e.g. `"Anthropic"`, `"OpenAI"`, `"Nature"`).
- `id` — exactly the ids in the verified-link table.

- [ ] **Step 1: Write `events[]` (all ~55, ordered chronologically within era)**

Order the array by era blocks (ai, then llm, then agent), each block chronological. Use every id from the verified-link table. Three fully-worked exemplars to match for tone/length/shape — author the remaining events identically:

```jsonc
{
  "events": [
    {
      "id": "turing-1950",
      "year": 1950,
      "era": "ai",
      "title": "Computing Machinery and Intelligence",
      "authors": "Alan Turing, 1950",
      "short": "Poses “can machines think?” and reframes it as the Imitation Game.",
      "long": "Turing sidesteps defining 'thinking' by proposing an imitation game — now the Turing Test — in which a machine passes if its text responses are indistinguishable from a human's. The paper also pre-empts the major objections to machine intelligence.",
      "impact": "Established the foundational question and an operational test for machine intelligence.",
      "diagram": null,
      "link": { "label": "Mind (OUP)", "url": "https://academic.oup.com/mind/article/LIX/236/433/986238" }
    },
    /* … ai-era events … */
    {
      "id": "transformers-2017",
      "year": 2017,
      "era": "llm",
      "title": "Attention Is All You Need",
      "authors": "Vaswani et al., Google Brain, 2017",
      "short": "Replaces recurrence with pure self-attention — the Transformer.",
      "long": "Drops recurrence and convolution entirely, letting every token attend to every other in parallel via scaled dot-product attention. This solved the long-range-dependency and throughput limits of RNNs and made large-scale pretraining practical.",
      "impact": "Became the architectural substrate of essentially every modern LLM.",
      "diagram": "attention",
      "link": { "label": "arXiv:1706.03762", "url": "https://arxiv.org/abs/1706.03762" }
    },
    /* … llm-era events … */
    {
      "id": "react-2022",
      "year": 2022,
      "era": "agent",
      "title": "ReAct: Synergizing Reasoning and Acting",
      "authors": "Yao et al., Princeton & Google, 2022",
      "short": "Interleaves chain-of-thought reasoning with tool/environment actions.",
      "long": "ReAct prompts a model to alternate 'thought' steps with 'action' steps that call tools or query an environment, feeding observations back into the next thought. This grounds reasoning in external state and reduces hallucination on knowledge and decision tasks.",
      "impact": "Defined the reason-act-observe loop at the core of modern LLM agents.",
      "diagram": "react",
      "link": { "label": "arXiv:2210.03629", "url": "https://arxiv.org/abs/2210.03629" }
    }
    /* … remaining agent-era events … */
  ],
  "brief": [ /* Step 2 */ ]
}
```

Author all 55 from the verified-link table. The full id roster to include (era / chronological):
- **ai:** turing-1950, dartmouth-1956, perceptron-1958, ai-winter-1969, backprop-1986, cnn-lenet-1989, lstm-1997, alexnet-2012, gan-2014, adam-2014, resnet-2015, batchnorm-2015
- **llm:** word2vec-2013, seq2seq-attention-2014, transformers-2017, bert-2018, gpt1-2018, gpt2-2019, t5-2019, roberta-2019, transformer-xl-2019, scaling-laws-2020, gpt3-2020, rag-2020, lora-2021, codex-2021, switch-moe-2021, palm-2022, chinchilla-2022, flash-attention-2022, instructgpt-rlhf-2022, chatgpt-2022, gpt4-2023, llama-2023, llama2-2023, mistral-2023, dpo-2023, gemini-2023, claude3-2024, gpt4o-2024, o1-2024
- **agent:** chain-of-thought-2022, react-2022, toolformer-2023, hugginggpt-2023, reflexion-2023, generative-agents-2023, tree-of-thoughts-2023, voyager-2023, autogpt-2023, swe-bench-2024, devin-2024, computer-use-2024, multi-agent-2024, mcp-2024

- [ ] **Step 2: Write `brief[]` (15 nodes)**

Groups use `yearLabel`, a synthesized summary, and `memberIds`. Passthroughs use `{ "ref": "<id>" }`. Two exemplars — author the rest to match (full composition table in Step 3):

```jsonc
"brief": [
  {
    "id": "foundations",
    "yearLabel": "1950–1958",
    "era": "ai",
    "title": "The Foundations of AI",
    "short": "The field is named and its first learning machine is built.",
    "long": "Turing frames machine intelligence as the imitation game; the 1956 Dartmouth workshop coins 'artificial intelligence' and sets its research agenda; Rosenblatt's Perceptron gives it a first trainable, hardware-realized neural model.",
    "impact": "Named the field and produced its first learning machine.",
    "memberIds": ["turing-1950", "dartmouth-1956", "perceptron-1958"],
    "diagram": null,
    "link": { "label": "Dartmouth Proposal", "url": "http://jmc.stanford.edu/articles/dartmouth/dartmouth.pdf" }
  },
  { "ref": "transformers-2017" }
]
```

- [ ] **Step 3: Complete the 15-node brief composition exactly as follows**

| # | type | id/ref | yearLabel | era | members |
|---|------|--------|-----------|-----|---------|
| 1 | group | `foundations` | 1950–1958 | ai | turing-1950, dartmouth-1956, perceptron-1958 |
| 2 | group | `neural-nets-mature` | 1969–1997 | ai | ai-winter-1969, backprop-1986, cnn-lenet-1989, lstm-1997 |
| 3 | passthrough | `alexnet-2012` | — | ai | — |
| 4 | group | `dl-toolkit` | 2014–2015 | ai | gan-2014, adam-2014, resnet-2015, batchnorm-2015 |
| 5 | group | `embeddings-attention` | 2013–2014 | llm | word2vec-2013, seq2seq-attention-2014 |
| 6 | passthrough | `transformers-2017` | — | llm | — |
| 7 | group | `pretraining-explosion` | 2018–2019 | llm | bert-2018, gpt1-2018, gpt2-2019, t5-2019, roberta-2019, transformer-xl-2019 |
| 8 | group | `gpt3-scaling` | 2020 | llm | gpt3-2020, scaling-laws-2020, rag-2020 |
| 9 | group | `efficient-aligned` | 2021–2022 | llm | lora-2021, codex-2021, switch-moe-2021, palm-2022, chinchilla-2022, flash-attention-2022, instructgpt-rlhf-2022 |
| 10 | passthrough | `chatgpt-2022` | — | llm | — |
| 11 | group | `frontier-open-models` | 2023–2024 | llm | gpt4-2023, llama-2023, llama2-2023, mistral-2023, dpo-2023, gemini-2023, claude3-2024, gpt4o-2024, o1-2024 |
| 12 | group | `reasoning-acting` | 2022 | agent | chain-of-thought-2022, react-2022 |
| 13 | group | `autonomous-agents` | 2023 | agent | toolformer-2023, hugginggpt-2023, reflexion-2023, generative-agents-2023, tree-of-thoughts-2023, voyager-2023, autogpt-2023 |
| 14 | group | `agents-at-work` | 2024 | agent | swe-bench-2024, devin-2024, computer-use-2024, multi-agent-2024 |
| 15 | passthrough | `mcp-2024` | — | agent | — |

Each group's `link` = the most representative member: foundations→Dartmouth, neural-nets-mature→backprop-1986, dl-toolkit→resnet-2015, embeddings-attention→word2vec-2013, pretraining-explosion→bert-2018, gpt3-scaling→gpt3-2020, efficient-aligned→instructgpt-rlhf-2022, frontier-open-models→gpt4-2023, reasoning-acting→react-2022, autonomous-agents→react-2022's sibling toolformer-2023, agents-at-work→swe-bench-2024. (This confirms every one of the 55 ids is covered exactly once.)

- [ ] **Step 4: Validate and commit**

```bash
node scripts/validate-data.mjs
```
Expected: `OK: 55 events, 15 brief nodes, all checks pass.`
```bash
git add data.json
git commit -m "feat: author full timeline dataset (55 events, 15 brief nodes)"
```

---

## Task 4: Theme + spine layout (CSS)

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Write the theme, header, toggle, and two-pane layout**

Create `styles.css`:
```css
:root {
  --bg:        #080c14;
  --panel:     #0d1320;
  --panel-2:   #121a2a;
  --line:      #263247;
  --line-soft: #1e2a3e;
  --ink:       #e6edf6;
  --ink-dim:   #9fb0c6;
  --ink-faint: #7f93ac;
  --era-ai:    #7ee0ff;
  --era-llm:   #b39dff;
  --era-agent: #7dffb0;
  --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
  --sans: -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0; background: var(--bg); color: var(--ink);
  font-family: var(--sans); line-height: 1.5;
  background-image: radial-gradient(1200px 600px at 70% -10%, rgba(126,224,255,.05), transparent 60%);
}
.era-ai { color: var(--era-ai); } .era-llm { color: var(--era-llm); } .era-agent { color: var(--era-agent); }

.site-header {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 24px;
  padding: 28px clamp(16px, 5vw, 64px) 20px;
  border-bottom: 1px solid var(--line-soft);
  position: sticky; top: 0; z-index: 5;
  background: linear-gradient(180deg, var(--bg) 70%, rgba(8,12,20,.85));
  backdrop-filter: blur(6px);
}
.title-block h1 { margin: 0 0 6px; font-size: clamp(20px, 3vw, 30px); letter-spacing: -.02em; }
.tagline { margin: 0; color: var(--ink-dim); font-size: 13px; }

.view-toggle { display: inline-flex; background: var(--panel); border: 1px solid var(--line); border-radius: 999px; padding: 3px; flex-shrink: 0; }
.toggle-btn {
  appearance: none; border: 0; background: transparent; color: var(--ink-dim);
  font-family: var(--sans); font-size: 13px; font-weight: 600; padding: 7px 16px;
  border-radius: 999px; cursor: pointer; transition: color .2s, background .2s;
}
.toggle-btn.is-active { color: var(--bg); background: var(--ink); }
.toggle-btn:not(.is-active):hover { color: var(--ink); }

.timeline {
  display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: clamp(16px, 4vw, 48px);
  padding: 32px clamp(16px, 5vw, 64px) 64px;
  align-items: start;
}

/* spine */
.spine { position: relative; padding-left: 30px; }
.spine::before {
  content: ""; position: absolute; left: 11px; top: 8px; bottom: 8px; width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--era-ai), var(--era-llm) 55%, var(--era-agent));
}
.era-band { font: 600 10px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase;
  color: var(--ink-faint); margin: 26px 0 14px; padding-left: 2px; }
.era-band:first-child { margin-top: 0; }

.event { position: relative; margin: 0 0 12px; cursor: pointer; }
.event-dot {
  position: absolute; left: -24px; top: 5px; width: 12px; height: 12px; border-radius: 50%;
  background: #2b3a52; box-shadow: 0 0 0 4px var(--bg); transition: background .2s, box-shadow .2s, transform .2s;
}
.event-year { font: 600 11px/1 var(--mono); color: var(--ink-faint); }
.event-title { font-size: 14px; color: #cddcef; transition: color .2s; }
.event:hover .event-title, .event:focus-visible .event-title { color: #fff; }
.event-count { font: 500 10px/1 var(--mono); color: var(--ink-faint); margin-left: 6px; }
.event:focus-visible { outline: none; }
```

- [ ] **Step 2: Verify in browser**

Run `python3 -m http.server 8000` and open `http://localhost:8000`. (Spine renders blank until Task 5 — confirm header, gradient toggle, and two-column layout appear with no console errors.)

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: dark theme, header, toggle and two-pane layout"
```

---

## Task 5: Render the spine from data (app.js core)

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Write fetch + normalize + render**

Create `app.js`:
```js
const ERA_LABEL = { ai: 'Classic AI → Deep Learning', llm: 'Language Models', agent: 'Agents' };
const ERA_ORDER = ['ai', 'llm', 'agent'];

let DB = { events: [], brief: [], byId: new Map() };
let view = localStorage.getItem('timeline-view') || 'brief';
let pinnedId = null;

// Normalize a brief entry (ref | group) or a raw event into a uniform "node".
function toNode(entry) {
  if (entry.ref) return { ...DB.byId.get(entry.ref), node: 'event' };
  if (entry.memberIds) return { ...entry, node: 'group' };
  return { ...entry, node: 'event' };
}

function activeNodes() {
  const list = view === 'brief' ? DB.brief : DB.events;
  return list.map(toNode).filter(n => n && n.id);
}

function yearText(n) { return n.yearLabel ?? String(n.year ?? ''); }

function renderSpine() {
  const spine = document.getElementById('spine');
  spine.innerHTML = '';
  let lastEra = null;
  for (const n of activeNodes()) {
    if (n.era !== lastEra) {
      const band = document.createElement('div');
      band.className = `era-band era-${n.era}`;
      band.textContent = ERA_LABEL[n.era];
      spine.appendChild(band);
      lastEra = n.era;
    }
    const el = document.createElement('article');
    el.className = 'event';
    el.tabIndex = 0;
    el.dataset.id = n.id;
    el.innerHTML = `
      <span class="event-dot" style="--c: var(--era-${n.era})"></span>
      <div class="event-year">${yearText(n)}</div>
      <div class="event-title">${n.title}${
        n.node === 'group' ? `<span class="event-count">· ${n.memberIds.length} milestones</span>` : ''
      }</div>
      <div class="event-inline" hidden></div>`;
    spine.appendChild(el);
  }
}

async function init() {
  const res = await fetch('data.json');
  const data = await res.json();
  DB.events = data.events;
  DB.brief = data.brief;
  DB.byId = new Map(data.events.map(e => [e.id, e]));
  syncToggle();
  renderSpine();
}

function syncToggle() {
  document.querySelectorAll('.toggle-btn').forEach(b => {
    const on = b.dataset.view === view;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

init();
```

- [ ] **Step 2: Verify**

Reload `http://localhost:8000`. Expected: the spine fills with era bands + nodes for the **brief** view (~15 nodes, groups show "· N milestones"). No console errors. Toggle buttons don't switch yet (Task 7).

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: render timeline spine from data"
```

---

## Task 6: Hover inline-expand with animation

**Files:**
- Modify: `styles.css`, `app.js`

- [ ] **Step 1: Add the inline-expand styles + dot flair**

Append to `styles.css`:
```css
.event:hover .event-dot, .event:focus-visible .event-dot {
  background: var(--c); box-shadow: 0 0 0 4px var(--bg), 0 0 12px var(--c);
  transform: scale(1.15);
}
.event-inline { overflow: hidden; max-height: 0; opacity: 0;
  transition: max-height .22s ease, opacity .22s ease, margin .22s ease; margin-top: 0; }
.event-inline[hidden] { display: block; } /* animate instead of snap */
.event.is-open .event-inline { max-height: 180px; opacity: 1; margin-top: 8px; }
.inline-card {
  background: var(--panel-2); border: 1px solid var(--line);
  border-left: 3px solid var(--c); border-radius: 9px; padding: 9px 12px;
  font-size: 12px; line-height: 1.5; color: var(--ink-dim);
}
.inline-card .it { font: 600 9px/1.4 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--c); display: block; margin-bottom: 3px; }
.inline-card .hint { color: var(--ink-faint); }
@media (prefers-reduced-motion: reduce) {
  .event-inline { transition: none; }
}
```

- [ ] **Step 2: Wire hover to populate + open the inline card**

In `app.js`, add inside `renderSpine()` after `spine.appendChild(el)` is set up — replace the loop body's element creation to attach listeners. Add this helper and call it once per `el`:
```js
function wireHover(el, n) {
  const inline = el.querySelector('.event-inline');
  const fill = () => {
    if (inline.dataset.filled) return;
    inline.innerHTML = `<div class="inline-card" style="--c: var(--era-${n.era})">
      <span class="it">${ERA_LABEL[n.era].split(' ')[0]} · ${yearText(n)}</span>
      ${n.short} <span class="hint">— click to pin full details →</span>
    </div>`;
    inline.dataset.filled = '1';
  };
  const open = () => { fill(); el.classList.add('is-open'); };
  const close = () => el.classList.remove('is-open');
  el.addEventListener('mouseenter', open);
  el.addEventListener('mouseleave', close);
  el.addEventListener('focus', open);
  el.addEventListener('blur', close);
}
```
Call `wireHover(el, n);` right before `spine.appendChild(el);`.

- [ ] **Step 3: Verify**

Reload. Hover a node → inline card animates open below it, lower nodes slide down; the dot brightens and scales. Mouse off → it collapses. Keyboard Tab also opens/closes.

- [ ] **Step 4: Commit**

```bash
git add styles.css app.js
git commit -m "feat: animated inline hover-expand summaries"
```

---

## Task 7: Click → pinned detail panel with "opening" reveal + diagrams

**Files:**
- Modify: `styles.css`, `app.js`

- [ ] **Step 1: Add detail-panel styles + reveal animation**

Append to `styles.css`:
```css
.detail { position: sticky; top: 120px; }
.detail-empty { border: 1px dashed var(--line); border-radius: 14px; padding: 40px 24px;
  text-align: center; color: var(--ink-faint); }
.detail-empty-icon { font-size: 28px; margin: 0 0 10px; opacity: .6; }

.detail-card {
  background: var(--panel); border: 1px solid var(--line);
  border-left: 3px solid var(--c); border-radius: 14px; padding: 22px 22px 24px;
  transform-origin: top center;
}
.detail-card.revealing { animation: cardOpen .26s cubic-bezier(.2,.7,.3,1); }
@keyframes cardOpen {
  from { opacity: 0; transform: scaleY(.96) translateY(-6px); }
  to   { opacity: 1; transform: none; }
}
.detail-card .d-era { font: 600 10px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--c); }
.detail-card h2 { margin: 6px 0 2px; font-size: 21px; color: #fff; }
.detail-card .d-meta { font: 11px/1.4 var(--mono); color: var(--ink-faint); margin-bottom: 14px; }
.detail-card .d-long { font-size: 13.5px; line-height: 1.65; color: #c4d2e4; margin: 0 0 14px; }
.detail-card .d-diagram { background: #0a0f17; border: 1px dashed var(--line); border-radius: 10px;
  padding: 14px; margin: 0 0 14px; text-align: center; font: 10px/1.4 var(--mono); color: var(--ink-faint); }
.detail-card .d-diagram svg { display: block; margin: 0 auto 6px; }
.detail-card .d-impact { background: rgba(125,255,176,.06); border-left: 2px solid var(--era-agent);
  border-radius: 7px; padding: 9px 12px; font-size: 12px; color: #a9e8c4; margin: 0 0 14px; }
.detail-card .d-members { list-style: none; padding: 0; margin: 0 0 14px; }
.detail-card .d-members li { font-size: 12px; padding: 4px 0; border-top: 1px solid var(--line-soft); }
.detail-card .d-members .my { font-family: var(--mono); color: var(--ink-faint); margin-right: 8px; }
.detail-card .d-members a { color: var(--ink-dim); text-decoration: none; }
.detail-card .d-members a:hover { color: var(--ink); text-decoration: underline; }
.detail-card .d-link { display: inline-block; font: 600 12px/1 var(--sans); color: var(--bg);
  background: var(--c); border-radius: 7px; padding: 9px 14px; text-decoration: none; }
/* staggered cascade of inner blocks */
.detail-card.revealing > * { animation: blockIn .3s both; }
.detail-card.revealing > *:nth-child(1){animation-delay:.02s}
.detail-card.revealing > *:nth-child(2){animation-delay:.05s}
.detail-card.revealing > *:nth-child(3){animation-delay:.09s}
.detail-card.revealing > *:nth-child(4){animation-delay:.13s}
.detail-card.revealing > *:nth-child(5){animation-delay:.17s}
.detail-card.revealing > *:nth-child(6){animation-delay:.21s}
@keyframes blockIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.event.is-pinned .event-dot { background: var(--c); box-shadow: 0 0 0 4px var(--bg), 0 0 14px var(--c); }
@media (prefers-reduced-motion: reduce) {
  .detail-card.revealing, .detail-card.revealing > * { animation: none; }
}
```

- [ ] **Step 2: Add the four inline SVG diagrams + panel renderer to `app.js`**

```js
const DIAGRAMS = {
  attention: `<svg width="190" height="44" role="img" aria-label="self-attention">
    <rect x="6" y="15" width="26" height="14" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="46" y="15" width="26" height="14" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="86" y="15" width="26" height="14" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="130" y="15" width="44" height="14" rx="3" fill="#241b40" stroke="#b39dff"/>
    <line x1="19" y1="15" x2="150" y2="13" stroke="#b39dff" opacity=".6"/>
    <line x1="59" y1="15" x2="150" y2="13" stroke="#b39dff" opacity=".6"/>
    <line x1="99" y1="15" x2="150" y2="13" stroke="#b39dff" opacity=".6"/></svg>
    every token attends to all others`,
  perceptron: `<svg width="180" height="60" role="img" aria-label="perceptron">
    <circle cx="20" cy="14" r="6" fill="#1b2740" stroke="#7ee0ff"/>
    <circle cx="20" cy="30" r="6" fill="#1b2740" stroke="#7ee0ff"/>
    <circle cx="20" cy="46" r="6" fill="#1b2740" stroke="#7ee0ff"/>
    <circle cx="120" cy="30" r="9" fill="#241b40" stroke="#b39dff"/>
    <line x1="26" y1="14" x2="111" y2="30" stroke="#7ee0ff" opacity=".6"/>
    <line x1="26" y1="30" x2="111" y2="30" stroke="#7ee0ff" opacity=".6"/>
    <line x1="26" y1="46" x2="111" y2="30" stroke="#7ee0ff" opacity=".6"/>
    <line x1="129" y1="30" x2="165" y2="30" stroke="#7dffb0"/></svg>
    weighted sum → threshold → output`,
  rlhf: `<svg width="190" height="44" role="img" aria-label="RLHF loop">
    <rect x="4" y="14" width="42" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="74" y="14" width="42" height="16" rx="3" fill="#241b40" stroke="#b39dff"/>
    <rect x="144" y="14" width="42" height="16" rx="3" fill="#10261a" stroke="#7dffb0"/>
    <line x1="46" y1="22" x2="72" y2="22" stroke="#9fb0c6"/><polygon points="72,18 72,26 78,22" fill="#9fb0c6"/>
    <line x1="116" y1="22" x2="142" y2="22" stroke="#9fb0c6"/><polygon points="142,18 142,26 148,22" fill="#9fb0c6"/></svg>
    samples → reward model → policy update`,
  react: `<svg width="190" height="56" role="img" aria-label="reason-act-observe loop">
    <rect x="10" y="8" width="48" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="130" y="8" width="48" height="16" rx="3" fill="#241b40" stroke="#b39dff"/>
    <rect x="70" y="34" width="50" height="16" rx="3" fill="#10261a" stroke="#7dffb0"/>
    <line x1="58" y1="16" x2="128" y2="16" stroke="#9fb0c6"/><polygon points="128,12 128,20 134,16" fill="#9fb0c6"/>
    <line x1="150" y1="24" x2="110" y2="36" stroke="#9fb0c6"/><polygon points="112,32 108,40 118,39" fill="#9fb0c6"/>
    <line x1="78" y1="42" x2="34" y2="26" stroke="#9fb0c6"/><polygon points="36,30 30,22 28,33" fill="#9fb0c6"/></svg>
    thought → action → observation → …`,
};

function renderDetail(n) {
  const panel = document.getElementById('detail');
  const members = (n.memberIds ?? [])
    .map(id => DB.byId.get(id)).filter(Boolean)
    .map(m => `<li><span class="my">${m.year ?? ''}</span><a href="${m.link.url}" target="_blank" rel="noopener">${m.title} ↗</a></li>`)
    .join('');
  panel.innerHTML = `
    <article class="detail-card revealing" style="--c: var(--era-${n.era})">
      <div class="d-era">${ERA_LABEL[n.era]} · ${yearText(n)}</div>
      <h2>${n.title}</h2>
      <div class="d-meta">${n.authors ?? ''}</div>
      <p class="d-long">${n.long}</p>
      ${n.diagram ? `<div class="d-diagram">${DIAGRAMS[n.diagram] ?? ''}</div>` : ''}
      <div class="d-impact">▸ ${n.impact}</div>
      ${members ? `<ul class="d-members"><li style="border:0;color:var(--ink-faint);font:600 10px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase">Covers</li>${members}</ul>` : ''}
      <a class="d-link" href="${n.link.url}" target="_blank" rel="noopener">↗ ${n.link.label}</a>
    </article>`;
  const card = panel.querySelector('.detail-card');
  card.addEventListener('animationend', () => card.classList.remove('revealing'), { once: true });
}

function pin(id, n) {
  pinnedId = id;
  document.querySelectorAll('.event').forEach(e => e.classList.toggle('is-pinned', e.dataset.id === id));
  renderDetail(n);
}
```

- [ ] **Step 3: Wire click in `renderSpine()`**

Where `wireHover(el, n)` is called, also add:
```js
el.addEventListener('click', () => pin(n.id, n));
el.addEventListener('keydown', (e) => { if (e.key === 'Enter') pin(n.id, n); });
```

- [ ] **Step 4: Verify**

Reload. Click any node → right panel plays the scale/fade "opening" reveal with inner blocks cascading; the dot becomes a solid glowing pin. Group nodes (brief view) show a "Covers" list of member papers, each link opening the paper. Diagram appears for Transformers, Perceptron's group? (no — only events with `diagram` set: transformers, react in detailed view; perceptron/rlhf where assigned). Links open in a new tab.

- [ ] **Step 5: Commit**

```bash
git add styles.css app.js
git commit -m "feat: pinned detail panel with opening reveal, diagrams, group member lists"
```

---

## Task 8: Wire the Brief/Detailed toggle

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add toggle handler with cross-fade + persistence**

Append to `app.js`:
```js
function setView(next) {
  if (next === view) return;
  view = next;
  localStorage.setItem('timeline-view', view);
  syncToggle();
  const spine = document.getElementById('spine');
  spine.style.transition = 'opacity .18s ease';
  spine.style.opacity = '0';
  setTimeout(() => {
    renderSpine();
    // keep the pin if the same node still exists in this view, else reset panel
    const stillThere = !!document.querySelector(`.event[data-id="${pinnedId}"]`);
    if (stillThere) document.querySelector(`.event[data-id="${pinnedId}"]`).classList.add('is-pinned');
    else { pinnedId = null; resetDetail(); }
    spine.style.opacity = '1';
  }, 180);
}

function resetDetail() {
  document.getElementById('detail').innerHTML =
    `<div class="detail-empty"><p class="detail-empty-icon">◷</p>
     <p>Hover an event to preview it.<br/>Click to pin the full story here.</p></div>`;
}

document.querySelectorAll('.toggle-btn').forEach(b =>
  b.addEventListener('click', () => setView(b.dataset.view)));
```

- [ ] **Step 2: Honor the persisted view on first paint**

Confirm `init()` already sets `view` from `localStorage` (Task 5 Step 1) and `syncToggle()` runs before `renderSpine()`. No code change if so; otherwise move `syncToggle()` above `renderSpine()` in `init()`.

- [ ] **Step 3: Verify**

Reload. Default view = Recap (or last-used). Click **Detailed** → spine cross-fades to ~55 events; **Recap** → back to ~15. Reload the page → it remembers the last view. Pinning persists across a toggle when the node exists in both (e.g. `transformers-2017`), otherwise the panel resets to empty state.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: brief/detailed view toggle with cross-fade and persistence"
```

---

## Task 9: Responsive layout, link audit, final verification

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add responsive rules**

Append to `styles.css`:
```css
@media (max-width: 760px) {
  .timeline { grid-template-columns: 1fr; }
  .detail { position: static; order: 2; }
  .detail:empty { display: none; }
  .site-header { flex-direction: column; gap: 14px; }
}
```
(On narrow screens the panel falls below the spine instead of beside it; sticky is dropped.)

- [ ] **Step 2: Run the data validator one more time**

```bash
node scripts/validate-data.mjs
```
Expected: `OK: 55 events, 15 brief nodes, all checks pass.`

- [ ] **Step 3: Audit every link resolves (no 404s)**

```bash
node -e '
const fs=require("fs");
const d=JSON.parse(fs.readFileSync("data.json","utf8"));
const urls=[...new Set([...d.events,...d.brief].filter(x=>x.link).map(x=>x.link.url))];
(async()=>{let bad=0;for(const u of urls){try{const r=await fetch(u,{method:"HEAD",redirect:"follow"});
if(r.status>=400){console.log(r.status,u);bad++}}catch(e){console.log("ERR",u,e.message);bad++}}
console.log(bad? `\n${bad} link(s) need attention`:"All links OK");})();
'
```
For any non-200: open it manually; some publishers (arXiv occasionally) reject HEAD — re-check those with a browser before treating as broken. Fix the URL in `data.json` and re-run.

- [ ] **Step 4: Manual browser pass (the spec's acceptance checklist)**

With `python3 -m http.server 8000` running, confirm in the browser:
1. All ~55 events render in detailed view, chronological within AI → LLM → Agent bands, colored by era.
2. Hover several events across all three eras → inline summary animates open/closed; lower events reflow.
3. Click events across all eras → panel plays the opening reveal with correct content; diagram shows only for the four assigned ids.
4. Toggle Recap ⇄ Detailed → cross-fade; ~15 vs ~55; choice persists across reload.
5. In Recap, click a group → "Covers" list of member papers, each link live.
6. Resize to < 760px → panel drops below spine, interactions + toggle still work.
7. No console errors at any point.

- [ ] **Step 5: Final commit**

```bash
git add styles.css
git commit -m "feat: responsive layout; final verification pass"
```

---

## Self-Review Notes (author → engineer)

- **Spec coverage:** layout (Task 4), aesthetic/era colors (Task 4), comprehensive ~55 scope (Task 3), hover inline-expand + animation (Task 6), click pinned panel + opening reveal + diagrams (Task 7), brief/detailed toggle + grouping + persistence (Tasks 3 & 8), small-static-project delivery (Task 1), link sourcing + verification (verified-link table + Task 9 Step 3), responsive (Task 9). All present.
- **Group→member coverage** is machine-checked: the validator (Task 2) fails unless every one of the 55 ids appears in exactly one brief node; the Task 3 composition table satisfies this.
- **Naming consistency:** `renderSpine`, `renderDetail`, `setView`, `pin`, `toNode`, `activeNodes`, `DB.byId`, `view`, `pinnedId` are used identically across Tasks 5–8. Era tokens `--era-ai/llm/agent` and the `data-id` attribute are the join keys between CSS and JS.
- **No `file://` trap:** README + every verify step uses `python3 -m http.server` because `fetch` needs http.
