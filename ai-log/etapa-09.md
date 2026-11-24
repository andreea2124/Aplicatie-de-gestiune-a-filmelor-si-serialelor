# Stage 9: AI log

## Tools
- Claude Code (VS Code extension)

## Key requests

### 1. Studying the guide
- Asked: Read the Stage 9 guide and say what has to be done before changing anything.
- Got: The steps adapted to this project: a `backend/` Express project, routes for `/lista` and `/filme`, server validation, moving the data out of `db.json`, and the small `api.js` change.
- Changed or rejected: Decided that the allow list has to cover all the extra My List fields (rating, episodes, dates, note...), not only the ones in the guide.

### 2. Backend and cleanup
- Asked: Do the changes; ask before important decisions; no commit and no push.
- Got: `backend/` (`app.js`, `server.js`, `validation.js`, two routers, data files), `api.js` reading `body.error`, and `db.json`, the `api` script and `json-server` removed from the frontend.
- Changed or rejected: Tested every route and the CORS header with curl, then ran `npm run lint` and `npm run build`. Error messages are in English, like the rest of the UI, not in Romanian as in the guide.

### 3. Interface, catalog and posters
- Asked: Make the interface nicer (brown and beige), split My List and the Catalog into two pages, add a detail page for catalog titles, and grow the catalog with posters.
- Got: A new header and tickets, a poster grid, `/catalog` and `/catalog/:id`, a catalog of 1200 titles built with `scripts/build-catalog.mjs` (IMDb datasets, TMDB descriptions) and posters from TMDB through `scripts/build-posters.mjs`.
- Changed or rejected: Kept the ticket look from before, kept My List on `/` for the automatic tests, and kept the TMDB key out of the repository (`.env.local` files, ignored by git).

### 4. Details for custom titles, and the catalog
- Asked: Make a title typed by hand show a poster, runtime and episodes like the catalog ones, and also add it to the catalog.
- Got: `GET /cauta` and `GET /cauta/:tip/:id` in the backend (the only code that talks to TMDB), suggestions in the form, and `POST /filme`, so a title typed by hand becomes a catalog title and My List only keeps its `catalogId`. Search in the catalog and in My List now ignores punctuation and accents.
- Changed or rejected: The search lives on the server so the API key never reaches the browser; without a key the form still works as before. The new catalog titles stay in memory for now; I chose to leave the real storage for stage 10 (MariaDB).

## What I learned
- The browser blocks answers between different origins (ports) unless the server sends `Access-Control-Allow-Origin`; the fix is on the server (`cors`).
- Validation on the server is mandatory, because curl or Postman skip the form; an allow list of fields ignores everything unknown.
- Express recognises the error handler by its four parameters, and the order matters: middleware, routes, 404, errors.
