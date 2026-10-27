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
npm run dev

Then open the address printed in the terminal (http://localhost:5173).

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

## Extra: catalog and My List
Beyond the guide, the interface has two panels:
- **Catalog** (`Catalog`, `CatalogItem`): about 190 titles, including recent ones. A search box and category chips (Action, Comedy, Drama, Romance, Thriller, SF) filter the list, there is one tab per format (Movies, Series, Animation), and the titles in a tab are grouped by category. The first three titles are the sample data above; the catalog lives in `frontend/src/data/catalog.js`.
- **My List**: the titles added from the catalog or typed in with the "Custom title" form (`AddForm`: title up to 100 characters, format, category). The status can be toggled between Unwatched and Watched; once a title is watched it can be rated with 1-5 stars (`Stars`). The list can be sorted by Order added, Unwatched first or Watched first, and a title can be removed. The list is kept in `localStorage`, so it survives a page reload.
- **Random pick** (`RandomPick`): a dialog that asks for a format, then a category (or "Surprise me") and suggests a random title that has not been watched yet, which can be added to My List.

The data logic (`adaugaInLista`, `comutaVazut`, `stergeFilm`, plus the newer `seteazaRating`, `adaugaManual`, `sorteaza`, `filtreazaCatalog`, `alegeRandom`) is in `frontend/src/logica.js`, built on the functions from stage 2.

## AI usage
| Tool | Used for |
| ---- | -------- |
| ChatGPT / Gemini | Structuring the README file and adapting the data model for movies and series. |
| Claude Code | Reviewing the project against the Stage 3 guide and fixing the React app to match the mockup. |

Details per stage: see the `ai-log/` folder.

## Status
- [x] Stage 1: static mockup
- [x] Stage 2: data logic in JavaScript
- [x] Stage 3: Vite and React project
- [x] Stage 4: components rendered from data
- [x] Stage 5: local state and events
- [ ] Stage 6: loading data from a mock API
