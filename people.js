// People view: the researchers behind the milestones, as an era-filtered card
// grid. Reads the same data.json as every other page — `people[]` sits next to
// `events[]`, and each person's `eventIds` resolve against the event list so a
// card can link back to that person's milestones on the timeline.
const PEOPLE_EL = document.getElementById('people');
const FILTERS_EL = document.getElementById('people-filters');

// This page doesn't load timeline-core.js, so it carries its own era labels.
// They're deliberately shorter than the timeline's ("Classic AI" rather than
// "Classic AI → Deep Learning") to sit as a pill above a person's name.
const ERA_NAME = { ai: 'Classic AI', llm: 'Language Models', agent: 'Agents' };
const ERAS = [{ key: 'all', label: 'All' }, ...Object.entries(ERA_NAME).map(([key, label]) => ({ key, label }))];

let PEOPLE = [];
let EVENTS = new Map();
let eraFilter = 'all';

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// One milestone chip: year + title, linking to the timeline's deep-link anchor.
// app.js reads that hash on load, switches to Detailed, and pins the event.
function eventChip(id) {
  const ev = EVENTS.get(id);
  if (!ev) return '';                     // validator blocks this, but never render a dead chip
  const year = ev.yearLabel ?? ev.year ?? '';
  return `<li><a class="person-event" href="index.html#${encodeURIComponent(id)}"
    style="--c: var(--era-${ev.era})" title="${esc(ev.title)}"
    ><span class="pe-year">${esc(year)}</span><span class="pe-title">${esc(ev.title)}</span></a></li>`;
}

function personCard(p) {
  const chips = (p.eventIds ?? []).map(eventChip).join('');
  return `<article class="person-card" data-era="${p.era}" data-reveal style="--c: var(--era-${p.era})">
      <div class="person-era">${esc(ERA_NAME[p.era] ?? p.era)}</div>
      <h2 class="person-name">${esc(p.name)}</h2>
      <p class="person-known">${esc(p.knownFor)}</p>
      <p class="person-bio">${esc(p.bio)}</p>
      <p class="person-now">${esc(p.now)}</p>
      ${chips ? `<ul class="person-events" aria-label="Milestones on this timeline">${chips}</ul>` : ''}
      ${p.wikipedia
        ? `<a class="person-wiki" href="${esc(p.wikipedia)}" target="_blank" rel="noopener">Wikipedia ↗</a>`
        : `<span class="person-wiki is-absent">No Wikipedia article</span>`}
    </article>`;
}

function render() {
  const shown = eraFilter === 'all' ? PEOPLE : PEOPLE.filter(p => p.era === eraFilter);

  PEOPLE_EL.innerHTML =
    `<p class="people-count">${shown.length} ${shown.length === 1 ? 'person' : 'people'}` +
    `${eraFilter === 'all' ? '' : ` in ${esc(ERA_NAME[eraFilter] ?? eraFilter)}`}</p>` +
    `<div class="people-grid">${shown.map(personCard).join('')}</div>`;

  window.revealOnScroll?.(PEOPLE_EL.querySelectorAll('.person-card'));
}

function buildFilters() {
  if (!FILTERS_EL) return;
  FILTERS_EL.innerHTML =
    `<span class="filter-label">Era</span>` +
    ERAS.map(e =>
      `<button class="filter-btn${e.key === eraFilter ? ' is-active' : ''}" data-era="${e.key}" aria-pressed="${e.key === eraFilter}">${e.label}</button>`
    ).join('');
  FILTERS_EL.querySelectorAll('.filter-btn').forEach(b =>
    b.addEventListener('click', () => setEra(b.dataset.era)));
}

function setEra(next) {
  if (next === eraFilter) return;
  eraFilter = next;
  FILTERS_EL.querySelectorAll('.filter-btn').forEach(b => {
    const on = b.dataset.era === eraFilter;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  render();
}

async function init() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    PEOPLE = data.people ?? [];
    EVENTS = new Map((data.events ?? []).map(e => [e.id, e]));
    buildFilters();
    render();
  } catch (err) {
    PEOPLE_EL.innerHTML =
      '<p class="load-error">Could not load <code>data.json</code>. Serve this over http ' +
      '(e.g. <code>python3 -m http.server</code>) rather than opening the file directly.</p>';
  }
}

init();
