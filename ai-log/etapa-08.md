# Stage 8: AI log

## Tools
- Claude Code (VS Code extension)

## Key requests

### 1. Studying the guide
- Asked: Read the Stage 8 guide and say what has to be done before changing anything.
- Got: The steps adapted to this project, with four design questions.
- Changed or rejected: Kept the catalog and My List on one page, removed the "Details" drop-down from My List tickets, and let the detail page toggle watched and rate.

### 2. Routing and CSS Modules
- Asked: Do the stage without breaking the earlier features or the look.
- Got: `react-router-dom`, `Layout`, the pages (`FilmePage`, `FilmDetaliuPage` at `/lista/:id`, `DesprePage`, `NotFoundPage`), `fetchElement` in `api.js`, and `App.css` split into `index.css` and one `.module.css` per component.
- Changed or rejected: Checked in the browser; `npm run lint` and `npm run build` pass.

### 3. Polish after the stage
- Asked: Suggest style and feature improvements, show a preview, then build the ones I accept.
- Got: A static preview page; after I accepted all but the redesigned detail page, a shared `ListaProvider`, a top bar with the logo, search and status filters in My List, dates, notes and rewatches, undo on delete, Random pick from My List, new Plot Wrapped stats and a few style touches.
- Changed or rejected: Kept the current detail page layout and only added the new fields to it.

## What I learned
- `useParams` returns text, and an effect with `[id]` reloads the item when the address changes.
- A class used by several components stays global in `index.css`.
