# Aplicatie-de-gestiune-a-filmelor-si-serialelor
# Plot
A web application for managing and organizing a personal collection of movies and TV shows.

## Data model
| Field | Type | Notes |
| ----------- | ------------ | ------------------------------------- |
| title | text | required, max 100 chars                             |
| watched | boolean | toggled from the list, default false           |
| format | fixed values | movie, series, animation                   |
| category | relation | Action, Comedy, Drama, Romance, Thriller, SF |
| user | relation | the owner of the item                            |

Sample data used across all stages:
1. Inception, unwatched, movie
2. Breaking Bad, watched, series
3. Spirited Away, unwatched, animation

## How to run
cd frontend
npm install
npm run api    # terminal 1, http://localhost:3001
npm run dev    # terminal 2, http://localhost:5173

Then open the address printed in the terminal (http://localhost:5173). Requires Node `^20.19` or `>=22.12` (Vite 8). The API address is read from `VITE_API_URL` (default `http://localhost:3001`); `frontend/.env.example` documents it.

The static mockup from stages 1 and 2 can still be opened directly: `mockup/index.html` in a browser, no build step, no server.

## Stage 1: Static mockup
The interface designed in plain HTML and CSS, in `mockup/index.html` and `mockup/style.css`.

## Stage 2: Data logic
Plain JavaScript, no DOM. `mockup/filme.js` holds the array and the functions that read and change it. Results are printed in the browser console (F12).

## Stage 3: Vite and React project
The app now lives in `frontend/`, built with Vite. The data from stage 2 moved into the main component; the list is still printed raw.

## Stage 4: components
The list is rendered from the data, through two components:
- `FilmList` receives the whole array and renders one card per item
- `FilmCard` receives a single item through props and displays it

## Stage 5: local state and events
The list lives in React state (`App`). Toggling watched and removing a title work from the page through functions passed down as props (`onComuta`, `onSterge`), and the counter in the header is derived from the list, so it follows automatically. A button in the header switches between light and dark mode: the choice is kept in state and written as `data-theme` on `<html>`, and the CSS only redefines variables. The button shows a sun in light mode and a moon in dark mode. Unlike the guide, the list is not lost on refresh, because it is saved in `localStorage` (see below); the theme choice is lost and falls back to the system theme.

## Stage 6: data from a mock API
The catalog (190 titles) is no longer written in the React code: it is served by json-server from `frontend/db.json` (resource `filme`, route `/filme`). The app fetches it on load, through `fetchFilme` in `src/api.js` (the only place with `fetch`; the address comes from `VITE_API_URL`, see `.env.example`), and shows a loading message, the list, or an error message that says to run `npm run api`. My List stays in `localStorage`; moving it to the server is for stage 7.

    npm run api   # terminal 1, http://localhost:3001
    npm run dev   # terminal 2, http://localhost:5173

## Extra: catalog and My List
Beyond the guide, the interface has two panels:
- **Catalog** (`Catalog`, `CatalogItem`): about 190 titles, including recent ones. A search box and category chips (Action, Comedy, Drama, Romance, Thriller, SF) filter the list, there is one tab per format (Movies, Series, Animation), and the titles in a tab are grouped by category. Each title has a "Show details" panel (`Detalii`) with the year, category, runtime or seasons and episodes, a short description and a link to IMDb. The first three titles are the sample data above; the catalog is served from `frontend/db.json` (see stage 6), while the categories and formats are constants in `frontend/src/data/catalog.js`.
- **My List**: the titles added from the catalog or typed in with the "Custom title" form (`AddForm`: title up to 100 characters, format, category). The status can be toggled between Unwatched and Watched; once a title is watched it can be rated with 1-5 stars (`Stars`). The list can be sorted by Order added, Unwatched first or Watched first, and a title can be removed. The list is kept in `localStorage`, so it survives a page reload.
- **Random pick** (`RandomPick`): a dialog that asks for a format, then a category (or "Surprise me") and suggests a random title that has not been watched yet, which can be added to My List.

The data logic (`adaugaInLista`, `comutaVazut`, `stergeFilm`, plus the newer `seteazaRating`, `adaugaManual`, `sorteaza`, `filtreazaCatalog`, `alegeRandom`) is in `frontend/src/logica.js`, built on the functions from stage 2.

## AI usage
| Tool | Used for |
| ---- | -------- |
| ChatGPT / Gemini | Structuring the README file and adapting the data model for movies and series. |
| Claude Code | Reviewing the project against each stage guide, fixing the React app to match the mockup, and building the catalog, My List, title details and the mock API (stage 6). |

Details per stage: see the `ai-log/` folder.

## Status
- [x] Stage 1: static mockup
- [x] Stage 2: data logic in JavaScript
- [x] Stage 3: Vite and React project
- [x] Stage 4: components rendered from data
- [x] Stage 5: local state and events
- [x] Stage 6: data from a mock API
- [ ] Stage 7: form and validation

## Stage 1: checklist
- [x] **S1-R1** The theme is approved, and the README has the description, the fields, the sample data and how to run.
- [x] **S1-R2** The README has the AI usage section.
- [x] **S1-R3** `ai-log/etapa-01.md` is filled in.
- [x] **S1-R4** The page has the header, the form with the text field and the fixed list, and three cards with the theme's data.
- [x] **S1-R5** One card is clearly marked as finished.
- [x] **S1-R6** Two columns on desktop, one column under 700 px.
- [x] **S1-R7** The focus is visible with Tab, and the dark theme is readable.
- [x] **S1-R8** The code is published on GitHub, in a public repository, with the commit `Stage 1: ...`.

## Stage 2: checklist
- [x] **S2-R1** The JavaScript file is linked to the page and logs to the console when the page opens.
- [x] **S2-R2** The array has at least three items, each with id, name, state and fixed tag.
- [x] **S2-R3** The list, count, search, add, toggle and delete functions work correctly.
- [x] **S2-R4** Adding rejects the empty name and the invalid tag, with a console message.
- [x] **S2-R5** The original array stays unchanged after adding, shown in the console.
- [x] **S2-R6** The README has the Stage 2 section, and `ai-log/etapa-02.md` is filled in.
- [x] **S2-R7** The commit `Stage 2: ...` is published on GitHub.

## Stage 3: checklist
- [x] **S3-R1** `npm run dev` starts without errors.
- [x] **S3-R2** The page shows the app name and the counter computed from data.
- [x] **S3-R3** The data is the one from the README, not the one from the example.
- [x] **S3-R4** The stage 1 styles are present in the app.
- [x] **S3-R5** `node_modules/` is not on GitHub, and `npm run build` runs without errors.
- [x] **S3-R6** The README is updated, and `ai-log/etapa-03.md` is filled in.
- [x] **S3-R7** The commit `Stage 3: ...` is published on GitHub.

## Stage 4: checklist
- [x] **S4-R1** There are at least two components in `src/components/`, one per file.
- [x] **S4-R2** The card receives data through props and does not read the array directly.
- [x] **S4-R3** The list is rendered with `map` and `key={id}`, with no console warnings.
- [x] **S4-R4** The empty list shows a message.
- [x] **S4-R5** The item's state changes the look of the card.
- [x] **S4-R6** The README is updated, and `ai-log/etapa-04.md` is filled in.
- [x] **S4-R7** The commit `Stage 4: ...` is published on GitHub.

## Stage 5: checklist
- [x] **S5-R1** The list is kept in `useState`, in the parent component.
- [x] **S5-R2** Toggling changes the item's state and the look of the card.
- [x] **S5-R3** Deleting removes the item from the list.
- [x] **S5-R4** The header counter updates automatically, without being kept in state.
- [x] **S5-R5** Updates are immutable: no `push`, `splice` or assignments on state items.
- [x] **S5-R6** The header button switches between the light and the dark theme, in both directions, whatever the system theme is.
- [x] **S5-R7** The console has no warnings; the README and `ai-log/etapa-05.md` are updated.
- [x] **S5-R8** The commit `Stage 5: ...` is published on GitHub.

## Stage 6: checklist
- [x] **S6-R1** `npm run api` starts, and the resource route shows JSON in the browser.
- [x] **S6-R2** The data is no longer written in the React code.
- [x] **S6-R3** The loading message appears while loading.
- [x] **S6-R4** With the API stopped, the error message appears, not a blank page.
- [x] **S6-R5** `fetch` appears only in `api.js`, and the API address is read from the environment variable.
- [x] **S6-R6** The README has the stage section, and `ai-log/etapa-06.md` is filled in.
- [ ] **S6-R7** The commit `Stage 6: ...` is published on GitHub.
