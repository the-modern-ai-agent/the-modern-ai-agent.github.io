import { readFile } from 'node:fs/promises';

const ERAS = new Set(['ai', 'llm', 'agent']);
const TYPES = new Set(['paper', 'model', 'product']);
const DIAGRAMS = new Set(['attention', 'perceptron', 'rlhf', 'react', 'backprop', 'gan', 'resnet', 'rag', 'moe', 'cot', 'mcp', 'reasoning']);
const REQUIRED = ['id', 'era', 'type', 'title', 'short', 'long', 'impact', 'link'];

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
  if (!TYPES.has(ev.type)) errors.push(`event "${ev.id}" has bad type "${ev.type}"`);
  if (ev.diagram != null && !DIAGRAMS.has(ev.diagram)) errors.push(`event "${ev.id}" has bad diagram "${ev.diagram}"`);
  if (ev.year == null && ev.yearLabel == null) errors.push(`event "${ev.id}" needs year or yearLabel`);
  // `date` is optional; when present it is a best-effort YYYY, YYYY-MM, or YYYY-MM-DD.
  // Year is not cross-checked against `year` — a few events are listed under their
  // venue year (e.g. ICLR 2024) while their source posted earlier.
  if (ev.date != null && !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(ev.date)) {
    errors.push(`event "${ev.id}" has bad date "${ev.date}" (want YYYY, YYYY-MM, or YYYY-MM-DD)`);
  }
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
    if (b.diagram != null && !DIAGRAMS.has(b.diagram)) errors.push(`brief group "${b.id}" has bad diagram "${b.diagram}"`);
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

// People: the researcher bios behind people.html. `wikipedia` is deliberately
// nullable — a few people genuinely have no article — but when present it must
// be an en.wikipedia.org URL, so a typo can't ship as a dead link. Every
// eventId must resolve, which keeps the "on this timeline" chips from rotting
// silently when an event is renamed.
const people = data.people ?? [];
const PERSON_REQUIRED = ['id', 'name', 'era', 'knownFor', 'bio', 'now'];
const personIds = new Set();

for (const p of people) {
  for (const f of PERSON_REQUIRED) {
    if (p[f] == null || p[f] === '') errors.push(`person "${p.id ?? '?'}" missing "${f}"`);
  }
  if (!ERAS.has(p.era)) errors.push(`person "${p.id}" has bad era "${p.era}"`);
  if (personIds.has(p.id)) errors.push(`duplicate person id "${p.id}"`);
  personIds.add(p.id);

  if (p.wikipedia != null) {
    let host = null;
    try { host = new URL(p.wikipedia).hostname; } catch { /* reported below */ }
    if (host !== 'en.wikipedia.org') {
      errors.push(`person "${p.id}" wikipedia must be an en.wikipedia.org URL or null (got "${p.wikipedia}")`);
    }
  }

  if (!Array.isArray(p.eventIds)) {
    errors.push(`person "${p.id}" needs an eventIds array (use [] for none)`);
  } else {
    for (const id of p.eventIds) {
      if (!ids.has(id)) errors.push(`person "${p.id}" eventId "${id}" has no matching event`);
    }
  }
}

if (errors.length) {
  console.error(`FAIL: ${errors.length} problem(s) in data.json:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`OK: ${events.length} events, ${brief.length} brief nodes, ${people.length} people, all checks pass.`);
