# Stage 6: AI log

## Tools
- Claude Code (VS Code extension)

## Key requests

### 1. Studying the guide
- Asked: Read the Stage 6 guide and list what has to be done, without changing anything.
- Got: The steps adapted to this project (resource `filme`, English messages, the catalog moved to the server).
- Changed or rejected: Skipped the verification table. My List stays in `localStorage` until Stage 7.

### 2. API and loading states
- Asked: Do the changes without breaking the earlier features.
- Got: `json-server@0.17.4`, `db.json` generated from the old `catalog.js`, `src/api.js`, `.env.example`, the `useEffect` with `ignore` and the loading / error messages in `App.jsx`, the error styles in `App.css`.
- Changed or rejected: Used the project's red instead of the guide's `--mare`. `npm run lint` and `npm run build` pass; the loading and error screens were checked by hand.

## What I learned
- `fetch` does not throw on 404 / 500, so `res.ok` is checked in `api.js`.
- In development React mounts twice, so two requests appear; `ignore` prevents duplicated state updates.
