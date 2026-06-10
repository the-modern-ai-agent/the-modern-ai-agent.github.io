// References view: read the timeline data, group every source link by its domain,
// and list dated entries under each. Same data.json as the main page.
const REFS_EL = document.getElementById('refs');

// hostname without a leading "www." — the unique "domain" we group by.
function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Pad a best-effort date (YYYY | YYYY-MM | YYYY-MM-DD) to a sortable key.
function sortKey(d) {
  const [y, m = '01', day = '01'] = String(d).split('-');
  return `${y}-${m}-${day}`;
}

function render(data) {
  const events = data.events ?? [];

  const byDomain = new Map();
  for (const ev of events) {
    if (!ev.link?.url) continue;
    const domain = domainOf(ev.link.url);
    const date = ev.date || String(ev.year);
    if (!byDomain.has(domain)) byDomain.set(domain, []);
    byDomain.get(domain).push({ date, key: sortKey(date), topic: ev.title, url: ev.link.url, era: ev.era });
  }

  // Domains ordered by how many references they anchor (most-cited first), then name.
  const domains = [...byDomain.entries()].sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])
  );

  const frag = document.createDocumentFragment();
  for (const [domain, entries] of domains) {
    entries.sort((a, b) => a.key.localeCompare(b.key)); // oldest first, like the timeline

    const section = document.createElement('section');
    section.className = 'ref-group';

    const head = document.createElement('div');
    head.className = 'ref-domain';
    const name = document.createElement('span');
    name.className = 'ref-domain-name';
    name.textContent = domain;
    const count = document.createElement('span');
    count.className = 'ref-count';
    count.textContent = `${entries.length} ${entries.length === 1 ? 'reference' : 'references'}`;
    head.append(name, count);

    const ul = document.createElement('ul');
    ul.className = 'ref-list';
    for (const e of entries) {
      const li = document.createElement('li');
      li.className = 'ref-entry';
      li.dataset.era = e.era;

      const time = document.createElement('time');
      time.className = 'ref-date';
      time.dateTime = e.date;
      time.textContent = e.date;

      const sep = document.createElement('span');
      sep.className = 'ref-sep';
      sep.textContent = '—';

      const a = document.createElement('a');
      a.className = 'ref-topic';
      a.href = e.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = e.topic;

      li.append(time, sep, a);
      ul.append(li);
    }

    section.append(head, ul);
    frag.append(section);
  }

  REFS_EL.replaceChildren(frag);
}

async function init() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    render(await res.json());
  } catch (err) {
    REFS_EL.innerHTML =
      '<p class="load-error">Could not load <code>data.json</code>. Serve this over http ' +
      '(e.g. <code>python3 -m http.server</code>) rather than opening the file directly.</p>';
  }
}

init();
