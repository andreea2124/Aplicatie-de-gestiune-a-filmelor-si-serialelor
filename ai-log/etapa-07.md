# Stage 7: AI log

## Tools
- Claude Code (VS Code extension)

## Key requests

### 1. Studying the guide
- Asked: Read the Stage 7 guide and list what has to be done, without changing anything.
- Got: The steps adapted to this project: My List moves from `localStorage` to a new resource `lista` in `db.json`, and the form is always visible.
- Changed or rejected: Skipped the verification table.

### 2. Form and server saving
- Asked: Make the changes without breaking earlier features.
- Got: `request` and the CRUD functions in `api.js`, the controlled `FilmForm` with validation, server-first add / toggle / rating / delete in `App.jsx`, `tw.json` and the `data-testid` attributes.
- Changed or rejected: Kept English messages and the existing look. `npm run lint` and `npm run build` pass; the flow was tested in the browser.

## What I learned
- The state is updated with the object returned by the server, so the id comes from json-server.
- The form is cleared only after a successful `await`, so a failed save keeps the text.
