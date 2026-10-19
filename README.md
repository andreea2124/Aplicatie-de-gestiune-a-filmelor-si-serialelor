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
1. Inception, active, movie
2. Breaking Bad, done, series
3. Spirited Away, active, animation

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
