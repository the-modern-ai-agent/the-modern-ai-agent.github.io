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
    data-era="${esc(ev.era)}" title="${esc(ev.title)}"
    ><span class="pe-year">${esc(year)}</span><span class="pe-title">${esc(ev.title)}</span></a></li>`;
}

// Some people have no biography on Wikipedia but their work does (Gerganov →
// Llama.cpp, Tri Dao → Mamba). Those links are still worth having, but the pill
// must not imply it leads to a profile — so when the linked article isn't about
// the person, name it. Surname match is the test: it tolerates the disambiguated
// and middle-initial titles real biographies use ("John McCarthy (computer
// scientist)", "Richard S. Sutton") without hand-maintaining a flag per person.
// The match compares split tokens rather than building a RegExp from the name,
// which would throw on a surname containing a metacharacter.
function wikiPill(p) {
  if (!p.wikipedia) return `<span class="person-wiki is-absent">No Wikipedia article</span>`;
  const fold = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  // decodeURIComponent throws on a malformed escape in data this function
  // doesn't control, and that throw would take down the whole grid.
  let title = '';
  try { title = decodeURIComponent(p.wikipedia.split('/wiki/')[1] ?? '').replace(/_/g, ' '); } catch { /* leave blank */ }
  const surname = fold(p.name).split(/\s+/).pop();
  const titleWords = fold(title).split(/[^\p{L}\p{N}]+/u);
  const aboutPerson = !!surname && titleWords.includes(surname);
  const label = aboutPerson || !title ? 'Wikipedia ↗' : `Wikipedia: ${title} ↗`;
  return `<a class="person-wiki" href="${esc(p.wikipedia)}" target="_blank" rel="noopener">${esc(label)}</a>`;
}

function personCard(p) {
  const chips = (p.eventIds ?? []).map(eventChip).join('');
  return `<article class="person-card" data-era="${esc(p.era)}" data-reveal>
      <div class="person-era">${esc(ERA_NAME[p.era] ?? p.era)}</div>
      <h2 class="person-name">${esc(p.name)}</h2>
      <p class="person-known">${esc(p.knownFor)}</p>
      <p class="person-bio">${esc(p.bio)}</p>
      <p class="person-now">${esc(p.now)}</p>
      ${chips ? `<ul class="person-events" aria-label="Milestones on this timeline">${chips}</ul>` : ''}
      ${wikiPill(p)}
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
    // Surface the real error: a render-time throw lands here too, and the
    // file-protocol advice below would be a misdiagnosis of it.
    console.error('people.js:', err);
    PEOPLE_EL.innerHTML =
      `<p class="load-error">Could not load the people data (${esc(err.message)}).<br/>` +
      'If this page was opened directly from disk, serve it over http instead ' +
      '— e.g. <code>python3 -m http.server</code>.</p>';
  }
}

init();
