// Vertical spine view. Shared constants (ERA_LABEL, DIAGRAMS, GLOSSARY,
// annotateAcronyms, yearText, renderDetailCard) come from timeline-core.js,
// which is loaded before this file.

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'paper', label: 'Papers' },
  { key: 'model', label: 'Models' },
  { key: 'product', label: 'Products' },
];

let DB = { events: [], brief: [], byId: new Map() };
let view = localStorage.getItem('timeline-view') || 'brief';
let typeFilter = 'all';
let pinnedId = null;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Normalize a brief entry (ref | group) or a raw event into a uniform "node".
function toNode(entry) {
  if (entry.ref) return { ...DB.byId.get(entry.ref), node: 'event' };
  if (entry.memberIds) return { ...entry, node: 'group' };
  return { ...entry, node: 'event' };
}

// Chronological sort key. Events use their label year with month/day from the
// sourced date, so a couple of events listed under a venue year stay in that
// year but land in the right month. Groups sort by their earliest member.
function eventKey(e) {
  const dm = String(e.date || '').match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  const y = Number(e.year ?? (dm ? dm[1] : 9999));
  const mo = dm ? Number(dm[2]) : 1;
  const da = dm && dm[3] ? Number(dm[3]) : 1;
  return y * 10000 + mo * 100 + da;
}
function chronoKey(n) {
  if (n.memberIds) {
    const keys = n.memberIds.map(id => DB.byId.get(id)).filter(Boolean).map(eventKey);
    return keys.length ? Math.min(...keys) : 99990000;
  }
  return eventKey(n);
}

function activeNodes() {
  let nodes;
  if (view === 'brief') {
    nodes = DB.brief.map(toNode).filter(n => n && n.id);
  } else {
    nodes = DB.events.map(toNode).filter(n => n && n.id);
    // Type filters apply only in the Detailed (per-event) view.
    if (typeFilter !== 'all') nodes = nodes.filter(n => n.type === typeFilter);
  }
  // One continuous chronological timeline — not grouped by era.
  return nodes.sort((a, b) => chronoKey(a) - chronoKey(b));
}

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
  for (const n of activeNodes()) {
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
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') pin(n.id, n, true); });
    spine.appendChild(el);
  }
  // Reveal events as they scroll into view.
  window.revealOnScroll?.(spine.querySelectorAll('.event'));
}

function renderDetail(n, focusPanel) {
  const panel = document.getElementById('detail');
  // First pin from the empty state gets the full spring + staggered entrance;
  // switching between already-pinned events uses a light cross-fade so rapid
  // event-to-event navigation stays smooth instead of replaying the big stagger.
  const isSwap = !!panel.querySelector('.detail-card') && !REDUCE;
  panel.innerHTML = renderDetailCard(n);
  const card = panel.querySelector('.detail-card');
  if (isSwap) { card.classList.remove('revealing'); card.classList.add('swapping'); }
  const finalize = () => card.classList.remove('revealing', 'swapping');
  card.addEventListener('animationend', finalize, { once: true });
  setTimeout(finalize, 700); // backup if the paint clock is throttled
  // Move focus into the panel only for keyboard-initiated pins, so mouse users
  // aren't yanked away from the spine.
  if (focusPanel) card.querySelector('h2').focus();
}

function pin(id, n, focusPanel) {
  pinnedId = id;
  document.querySelectorAll('.event').forEach(e => e.classList.toggle('is-pinned', e.dataset.id === id));
  renderDetail(n, focusPanel);
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

function buildFilters() {
  const bar = document.getElementById('filters');
  if (!bar) return;
  bar.innerHTML =
    `<span class="filter-label">Filter</span>` +
    TYPES.map(t =>
      `<button class="filter-btn${t.key === typeFilter ? ' is-active' : ''}" data-type="${t.key}" aria-pressed="${t.key === typeFilter}">${t.label}</button>`
    ).join('');
  bar.querySelectorAll('.filter-btn').forEach(b =>
    b.addEventListener('click', () => setFilter(b.dataset.type)));
}

// The type filter only makes sense per-event, so the bar shows in Detailed view only.
function syncFilterBar() {
  const bar = document.getElementById('filters');
  if (!bar) return;
  bar.hidden = view !== 'detailed';
  bar.querySelectorAll('.filter-btn').forEach(b => {
    const on = b.dataset.type === typeFilter;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

function setFilter(next) {
  if (next === typeFilter) return;
  typeFilter = next;
  syncFilterBar();
  renderSpine();
}

function setView(next) {
  if (next === view) return;
  view = next;
  localStorage.setItem('timeline-view', view);
  syncToggle();
  syncFilterBar();
  const spine = document.getElementById('spine');
  // If a spine item had focus, the re-render below destroys it; remember to restore.
  const hadSpineFocus = document.activeElement?.classList?.contains('event');
  spine.style.transition = 'opacity .18s ease';
  spine.style.opacity = '0';
  setTimeout(() => {
    renderSpine();
    const pinnedEl = document.querySelector(`.event[data-id="${pinnedId}"]`);
    if (pinnedEl) pinnedEl.classList.add('is-pinned');
    else if (pinnedId !== null) { pinnedId = null; resetDetail(); }
    if (hadSpineFocus) (pinnedEl ?? spine.querySelector('.event'))?.focus();
    spine.style.opacity = '1';
  }, 180);
}

async function init() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    DB.events = data.events;
    DB.brief = data.brief;
    DB.byId = new Map(data.events.map(e => [e.id, e]));
    syncToggle();
    buildFilters();
    syncFilterBar();
    renderSpine();
  } catch (err) {
    document.getElementById('spine').innerHTML =
      `<p class="load-error">Couldn't load the timeline data (${err.message}).<br/>
       Serve this folder over http — e.g. <code>python3 -m http.server</code> — rather than opening the file directly.</p>`;
  }
}

document.querySelectorAll('.toggle-btn').forEach(b =>
  b.addEventListener('click', () => setView(b.dataset.view)));

init();
