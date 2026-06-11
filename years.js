// Horizontal "by year" view: one column per calendar year from the first event
// to the last (empty years kept, to scale), with an era-colored block per event
// stacked bottom-up so column height shows activity. Hover -> tooltip; click ->
// pin the shared detail card. Constants come from timeline-core.js.

const CHART = document.getElementById('years-chart');
const DETAIL = document.getElementById('years-detail');
const TIP = document.getElementById('years-tip');
const HINT = document.getElementById('years-hint');

let DB = { events: [], byId: new Map() }; // byId used by renderDetailCard
let pinnedId = null;

function sortKey(e) {
  const [y, m = '01', d = '01'] = String(e.date || e.year).split('-');
  return `${y}-${m}-${d}`;
}

function showTip(chip, e) {
  TIP.innerHTML =
    `<span class="tip-meta">${ERA_LABEL[e.era].split(' ')[0]} · ${e.date || e.year}</span>` +
    `<strong class="tip-title">${e.title}</strong>` +
    `<span class="tip-short">${e.short}</span>`;
  TIP.style.setProperty('--c', `var(--era-${e.era})`);
  TIP.hidden = false;
  const r = chip.getBoundingClientRect();
  const tw = TIP.offsetWidth, th = TIP.offsetHeight;
  const vw = document.documentElement.clientWidth;
  let left = Math.min(Math.max(8, r.left + r.width / 2 - tw / 2), vw - tw - 8);
  let top = r.top - th - 10;
  if (top < 8) top = r.bottom + 10; // flip below if no room above
  TIP.style.left = `${left}px`;
  TIP.style.top = `${top}px`;
  TIP.classList.add('is-on');
}

function hideTip() {
  TIP.classList.remove('is-on');
}

function pin(e) {
  pinnedId = e.id;
  document.querySelectorAll('.yr-chip').forEach(c =>
    c.classList.toggle('is-pinned', c.dataset.id === e.id));
  // Light cross-fade when swapping between already-pinned events; full entrance
  // only on the first pin.
  const isSwap = !!DETAIL.querySelector('.detail-card');
  DETAIL.innerHTML = renderDetailCard(e);
  DETAIL.classList.add('has-pinned');
  if (HINT) HINT.classList.add('is-hidden'); // the "click to pin it above" hint no longer applies
  const card = DETAIL.querySelector('.detail-card');
  // Dismiss control.
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'detail-close';
  close.setAttribute('aria-label', 'Dismiss summary');
  close.innerHTML = '\u00d7';
  close.addEventListener('click', dismiss);
  card.appendChild(close);
  if (isSwap) { card.classList.remove('revealing'); card.classList.add('swapping'); }
  const finalize = () => card.classList.remove('revealing', 'swapping');
  card.addEventListener('animationend', finalize, { once: true });
  setTimeout(finalize, 700); // backup if the paint clock is throttled
  DETAIL.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function dismiss() {
  if (pinnedId === null) return;
  pinnedId = null;
  document.querySelectorAll('.yr-chip.is-pinned').forEach(c => c.classList.remove('is-pinned'));
  DETAIL.classList.remove('has-pinned');
  DETAIL.innerHTML = '';
  if (HINT) HINT.classList.remove('is-hidden');
}

function wireChip(chip, e) {
  chip.addEventListener('mouseenter', () => showTip(chip, e));
  chip.addEventListener('mouseleave', hideTip);
  chip.addEventListener('focus', () => showTip(chip, e));
  chip.addEventListener('blur', hideTip);
  chip.addEventListener('click', () => pin(e));
}

function render(data) {
  DB.events = data.events;
  DB.byId = new Map(data.events.map(e => [e.id, e]));

  const byYear = new Map();
  let min = Infinity, max = -Infinity;
  for (const e of data.events) {
    if (typeof e.year !== 'number') continue;
    min = Math.min(min, e.year);
    max = Math.max(max, e.year);
    if (!byYear.has(e.year)) byYear.set(e.year, []);
    byYear.get(e.year).push(e);
  }
  for (const arr of byYear.values()) arr.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

  const frag = document.createDocumentFragment();
  let gi = 0; // global chip index, drives the entrance stagger
  for (let y = min; y <= max; y++) {
    const events = byYear.get(y) || [];
    const col = document.createElement('div');
    col.className = 'yr-col' + (events.length ? ' has-events' : '');
    const labelled = y % 10 === 0 || y === min || y === max;

    const stack = document.createElement('div');
    stack.className = 'yr-stack';
    for (const e of events) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'yr-chip';
      chip.dataset.id = e.id;
      chip.dataset.era = e.era;
      chip.setAttribute('aria-label', `${e.year} — ${e.title}`);
      chip.style.setProperty('--i', gi++);
      wireChip(chip, e);
      stack.appendChild(chip);
    }

    const tick = document.createElement('div');
    tick.className = 'yr-tick' + (labelled ? ' is-labelled' : '');
    tick.textContent = labelled ? y : '';

    col.append(stack, tick);
    frag.appendChild(col);
  }
  CHART.replaceChildren(frag);
  // Trigger the staggered grow-in once the chart scrolls into view.
  window.revealEl?.(CHART);
}

async function init() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    render(await res.json());
  } catch (err) {
    if (HINT) HINT.hidden = true;
    CHART.innerHTML =
      '<p class="load-error">Could not load <code>data.json</code>. Serve this over http ' +
      '(e.g. <code>python3 -m http.server</code>) rather than opening the file directly.</p>';
  }
}

// Keep the hover tooltip from lingering in the wrong place during scroll.
window.addEventListener('scroll', hideTip, true);
// Esc dismisses the pinned summary.
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') dismiss(); });
init();
