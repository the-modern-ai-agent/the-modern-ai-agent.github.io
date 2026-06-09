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
  react: `<svg width="190" height="56" role="img" aria-label="reason-act-observe loop">
    <rect x="10" y="8" width="48" height="16" rx="3" fill="#1b2740" stroke="#7ee0ff"/>
    <rect x="130" y="8" width="48" height="16" rx="3" fill="#241b40" stroke="#b39dff"/>
    <rect x="70" y="34" width="50" height="16" rx="3" fill="#10261a" stroke="#7dffb0"/>
    <line x1="58" y1="16" x2="128" y2="16" stroke="#9fb0c6"/><polygon points="128,12 128,20 134,16" fill="#9fb0c6"/>
    <line x1="150" y1="24" x2="110" y2="36" stroke="#9fb0c6"/><polygon points="112,32 108,40 118,39" fill="#9fb0c6"/>
    <line x1="78" y1="42" x2="34" y2="26" stroke="#9fb0c6"/><polygon points="36,30 30,22 28,33" fill="#9fb0c6"/></svg>
    thought → action → observation → …`,
};

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
    wireHover(el, n);
    el.addEventListener('click', () => pin(n.id, n));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') pin(n.id, n); });
    spine.appendChild(el);
  }
}

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

function resetDetail() {
  document.getElementById('detail').innerHTML =
    `<div class="detail-empty"><p class="detail-empty-icon">◷</p>
     <p>Hover an event to preview it.<br/>Click to pin the full story here.</p></div>`;
}

function syncToggle() {
  document.querySelectorAll('.toggle-btn').forEach(b => {
    const on = b.dataset.view === view;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

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
    const pinnedEl = document.querySelector(`.event[data-id="${pinnedId}"]`);
    if (pinnedEl) pinnedEl.classList.add('is-pinned');
    else { pinnedId = null; resetDetail(); }
    spine.style.opacity = '1';
  }, 180);
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

document.querySelectorAll('.toggle-btn').forEach(b =>
  b.addEventListener('click', () => setView(b.dataset.view)));

init();
