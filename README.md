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
Open `index.html` in a browser. No build step, no server.

## AI usage
| Tool | Used for |
| ---- | -------- |
| ChatGPT / Gemini | Structuring the README file and adapting the data model for movies and series. |

Details per stage:
- Stage 1: see the ai-log/ folder.

## Status
[x] Stage 1: static mockup  
[ ] Stage 2: data logic in JavaScript  
