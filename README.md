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
