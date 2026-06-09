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

if (errors.length) {
  console.error(`FAIL: ${errors.length} problem(s) in data.json:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`OK: ${events.length} events, ${brief.length} brief nodes, all checks pass.`);
