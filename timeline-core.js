// Shared timeline rendering: era labels, inline diagrams, the acronym glossary,
// and the detail-card builder. Loaded before app.js (vertical spine) and
// years.js (horizontal by-year view) so both render event details identically.
// Relies on a global `DB.byId` (each page builds it) to resolve group members.

const ERA_LABEL = { ai: 'Classic AI → Deep Learning', llm: 'Language Models', agent: 'Agents' };

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
  react: `<svg width="214" height="58" role="img" aria-label="reason-act-observe loop">
    <rect x="6" y="10" width="52" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="78" y="10" width="52" height="16" rx="3" fill="#241b40" stroke="#b39dff"/>
    <rect x="150" y="10" width="58" height="16" rx="3" fill="#10261a" stroke="#7dffb0"/>
    <line x1="58" y1="18" x2="74" y2="18" stroke="#9fb0c6"/><polygon points="74,14 74,22 80,18" fill="#9fb0c6"/>
    <line x1="130" y1="18" x2="146" y2="18" stroke="#9fb0c6"/><polygon points="146,14 146,22 152,18" fill="#9fb0c6"/>
    <path d="M179 26 C179 47 32 47 32 28" fill="none" stroke="#9fb0c6"/><polygon points="32,25 28,33 36,33" fill="#9fb0c6"/></svg>
    thought → action → observation → loop`,
  backprop: `<svg width="200" height="54" role="img" aria-label="backpropagation">
    <rect x="8" y="18" width="32" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="70" y="18" width="32" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="132" y="18" width="32" height="16" rx="3" fill="#241b40" stroke="#b39dff"/>
    <line x1="40" y1="26" x2="68" y2="26" stroke="#7dffb0"/><polygon points="68,22 68,30 74,26" fill="#7dffb0"/>
    <line x1="102" y1="26" x2="130" y2="26" stroke="#7dffb0"/><polygon points="130,22 130,30 136,26" fill="#7dffb0"/>
    <line x1="132" y1="42" x2="42" y2="42" stroke="#ff9e80"/><polygon points="42,38 42,46 36,42" fill="#ff9e80"/></svg>
    forward pass (green) → errors back-propagate (orange)`,
  gan: `<svg width="200" height="54" role="img" aria-label="generative adversarial network">
    <rect x="8" y="18" width="46" height="18" rx="3" fill="#241b40" stroke="#b39dff"/>
    <rect x="118" y="18" width="46" height="18" rx="3" fill="#10261a" stroke="#7dffb0"/>
    <line x1="54" y1="27" x2="116" y2="27" stroke="#9fb0c6"/><polygon points="116,23 116,31 122,27" fill="#9fb0c6"/>
    <text x="12" y="50" font-size="9" fill="#b39dff">Generator</text>
    <text x="120" y="50" font-size="9" fill="#7dffb0">Discriminator</text></svg>
    generator vs. discriminator, adversarial game`,
  resnet: `<svg width="200" height="56" role="img" aria-label="residual skip connection">
    <rect x="20" y="28" width="40" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="92" y="28" width="40" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <line x1="60" y1="36" x2="90" y2="36" stroke="#9fb0c6"/><polygon points="90,32 90,40 96,36" fill="#9fb0c6"/>
    <path d="M40 28 Q76 6 112 28" fill="none" stroke="#7dffb0"/><polygon points="112,29 108,21 116,21" fill="#7dffb0"/>
    <text x="138" y="40" font-size="9" fill="#7dffb0">+ skip</text></svg>
    identity shortcut lets gradients skip layers`,
  rag: `<svg width="210" height="50" role="img" aria-label="retrieval-augmented generation">
    <rect x="6" y="16" width="40" height="18" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="84" y="16" width="40" height="18" rx="3" fill="#0f1f33" stroke="#9fb0c6"/>
    <rect x="162" y="16" width="42" height="18" rx="3" fill="#241b40" stroke="#b39dff"/>
    <line x1="46" y1="25" x2="82" y2="25" stroke="#9fb0c6"/><polygon points="82,21 82,29 88,25" fill="#9fb0c6"/>
    <line x1="124" y1="25" x2="160" y2="25" stroke="#9fb0c6"/><polygon points="160,21 160,29 166,25" fill="#9fb0c6"/>
    <text x="10" y="46" font-size="8" fill="#9fb0c6">query</text>
    <text x="88" y="46" font-size="8" fill="#9fb0c6">retrieve docs</text>
    <text x="168" y="46" font-size="8" fill="#9fb0c6">generate</text></svg>
    ground generation in retrieved evidence`,
  moe: `<svg width="200" height="62" role="img" aria-label="mixture of experts">
    <rect x="8" y="24" width="36" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <text x="10" y="20" font-size="8" fill="#9fb0c6">router</text>
    <rect x="120" y="4" width="40" height="14" rx="3" fill="#0f1f33" stroke="#36465f"/>
    <rect x="120" y="24" width="40" height="14" rx="3" fill="#241b40" stroke="#b39dff"/>
    <rect x="120" y="44" width="40" height="14" rx="3" fill="#0f1f33" stroke="#36465f"/>
    <line x1="44" y1="32" x2="118" y2="11" stroke="#36465f"/>
    <line x1="44" y1="32" x2="118" y2="31" stroke="#b39dff"/>
    <line x1="44" y1="32" x2="118" y2="51" stroke="#36465f"/></svg>
    router sends each token to one expert`,
  cot: `<svg width="210" height="44" role="img" aria-label="chain of thought">
    <rect x="6" y="14" width="34" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="58" y="14" width="34" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="110" y="14" width="34" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="162" y="14" width="42" height="16" rx="3" fill="#10261a" stroke="#7dffb0"/>
    <line x1="40" y1="22" x2="56" y2="22" stroke="#9fb0c6"/><polygon points="56,18 56,26 62,22" fill="#9fb0c6"/>
    <line x1="92" y1="22" x2="108" y2="22" stroke="#9fb0c6"/><polygon points="108,18 108,26 114,22" fill="#9fb0c6"/>
    <line x1="144" y1="22" x2="160" y2="22" stroke="#9fb0c6"/><polygon points="160,18 160,26 166,22" fill="#9fb0c6"/></svg>
    step → step → step → answer`,
  mcp: `<svg width="200" height="58" role="img" aria-label="model context protocol">
    <rect x="8" y="20" width="48" height="18" rx="3" fill="#241b40" stroke="#b39dff"/>
    <rect x="120" y="4" width="72" height="14" rx="3" fill="#0f1f33" stroke="#7dffb0"/>
    <rect x="120" y="24" width="72" height="14" rx="3" fill="#0f1f33" stroke="#7dffb0"/>
    <rect x="120" y="44" width="72" height="14" rx="3" fill="#0f1f33" stroke="#7dffb0"/>
    <line x1="56" y1="29" x2="118" y2="11" stroke="#9fb0c6"/>
    <line x1="56" y1="29" x2="118" y2="31" stroke="#9fb0c6"/>
    <line x1="56" y1="29" x2="118" y2="51" stroke="#9fb0c6"/>
    <text x="10" y="15" font-size="8" fill="#b39dff">client</text></svg>
    one protocol, many tool & data servers`,
  reasoning: `<svg width="210" height="48" role="img" aria-label="inference-time reasoning">
    <rect x="6" y="16" width="30" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <path d="M40 24 H180" fill="none" stroke="#b39dff" stroke-dasharray="3 3"/>
    <circle cx="64" cy="24" r="3" fill="#b39dff"/><circle cx="88" cy="24" r="3" fill="#b39dff"/>
    <circle cx="112" cy="24" r="3" fill="#b39dff"/><circle cx="136" cy="24" r="3" fill="#b39dff"/>
    <circle cx="160" cy="24" r="3" fill="#b39dff"/>
    <rect x="180" y="16" width="24" height="16" rx="3" fill="#10261a" stroke="#7dffb0"/>
    <text x="8" y="12" font-size="8" fill="#7ee0ff">prompt</text>
    <text x="74" y="44" font-size="8" fill="#9fb0c6">long internal chain of thought</text></svg>
    spend more inference compute before answering`,
};

// Acronyms / initialisms that may appear in a long summary, with their expansions.
// Only terms actually present in a given summary get annotated.
const GLOSSARY = {
  AI: 'Artificial intelligence',
  LLM: 'Large language model',
  RLHF: 'Reinforcement learning from human feedback',
  RL: 'Reinforcement learning',
  SFT: 'Supervised fine-tuning',
  GPU: 'Graphics processing unit',
  CNN: 'Convolutional neural network',
  RNN: 'Recurrent neural network',
  LSTM: 'Long short-term memory',
  GAN: 'Generative adversarial network',
  NLP: 'Natural language processing',
  API: 'Application programming interface',
  MoE: 'Mixture of experts',
  RAG: 'Retrieval-augmented generation',
  DPO: 'Direct preference optimization',
  LoRA: 'Low-rank adaptation',
  CoT: 'Chain-of-thought reasoning',
  MCP: 'Model Context Protocol',
  A2A: 'Agent2Agent — an agent-to-agent protocol',
  GUI: 'Graphical user interface',
  IDE: 'Integrated development environment',
  SDK: 'Software development kit',
  QA: 'Question answering',
  STEM: 'Science, technology, engineering and mathematics',
  ReLU: 'Rectified linear unit',
  GPT: 'Generative pre-trained transformer',
  BERT: 'Bidirectional encoder representations from transformers',
  T5: 'Text-to-text transfer transformer',
  MIT: 'Massachusetts Institute of Technology',
};

// Wrap the FIRST occurrence of each glossary term in a tooltip. Resets per call,
// so the same term is re-annotated in a different summary but only once within one.
function annotateAcronyms(text) {
  const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
  const esc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // \b … s? \b  matches the term (+ optional plural); (?![\w-]) skips hyphenated
  // forms like "GPT-4" so we don't wrap a fragment of a model name.
  const re = new RegExp('\\b(' + terms.map(esc).join('|') + ')s?\\b(?![\\w-])', 'g');
  const seen = new Set();
  return text.replace(re, (m, term) => {
    if (!GLOSSARY[term] || seen.has(term)) return m;
    seen.add(term);
    const tip = GLOSSARY[term].replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return `<abbr class="gloss" tabindex="0" data-tip="${tip}" aria-label="${term}: ${tip}">${m}</abbr>`;
  });
}

function yearText(n) { return n.yearLabel ?? String(n.year ?? ''); }

// Build the pinned detail-card markup for a node (event or group). Group members
// are resolved through the global DB.byId that each page populates.
function renderDetailCard(n) {
  const members = (n.memberIds ?? [])
    .map(id => DB.byId.get(id)).filter(Boolean)
    .map(m => `<li><span class="my">${m.year ?? ''}</span><a href="${m.link.url}" target="_blank" rel="noopener">${m.title} ↗</a></li>`)
    .join('');
  return `<article class="detail-card revealing" style="--c: var(--era-${n.era})">
      <div class="d-era">${ERA_LABEL[n.era]} · ${yearText(n)}</div>
      <h2 tabindex="-1">${n.title}</h2>
      <div class="d-meta">${n.authors ?? ''}</div>
      <p class="d-long">${annotateAcronyms(n.long)}</p>
      ${n.diagram ? `<div class="d-diagram">${DIAGRAMS[n.diagram] ?? ''}</div>` : ''}
      ${n.image ? `<figure class="d-image"><img src="${n.image.src}" alt="${n.image.alt ?? ''}" loading="lazy"/>${n.image.credit ? `<figcaption>${n.image.credit}</figcaption>` : ''}</figure>` : ''}
      <div class="d-impact">▸ ${n.impact}</div>
      ${members ? `<ul class="d-members"><li style="border:0;color:var(--ink-faint);font:600 10px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase">Covers</li>${members}</ul>` : ''}
      <a class="d-link" href="${n.link.url}" target="_blank" rel="noopener">↗ ${n.link.label}</a>
    </article>`;
}

// ── Shared touch/mobile UI plumbing (used by both the spine and by-year views) ──

// Inject the bottom-sheet scrim once and wire its tap to the page's dismiss.
// Visibility is CSS-driven (body:has(.detail-card) on mobile); this only
// supplies the tap-to-dismiss handler.
function installSheetScrim(onDismiss) {
  if (document.querySelector('.sheet-scrim')) return;
  const scrim = document.createElement('div');
  scrim.className = 'sheet-scrim';
  scrim.addEventListener('click', onDismiss);
  document.body.appendChild(scrim);
}

// Tap-to-toggle the acronym glossary tips. Desktop keeps its hover tooltip; this
// adds a touch path plus tap-elsewhere-to-close. One delegated handler does both:
// a tap on a .gloss toggles it, a tap anywhere else closes any open tip.
document.addEventListener('click', (e) => {
  const g = e.target.closest('.gloss');
  const wasOpen = g && g.classList.contains('is-tip');
  document.querySelectorAll('.gloss.is-tip').forEach(el => el.classList.remove('is-tip'));
  if (g && !wasOpen) g.classList.add('is-tip');
});
