# Stage 4: AI log

## Tools
- Claude Code (VS Code extension)

## Conversations
- Local Claude Code session in VS Code (no public share link).

## Key requests

### 1. Studying the guide and building the components
- Asked: Read the Stage 4 guide, list what has to change, then make the changes.
- Got: `FilmCard.jsx`, `FilmList.jsx`, `<FilmList filme={filme} />` in `App.jsx` and the README section.
- Changed or rejected: Kept the mockup's texts (`Active` / `Done`, `No items found.`) and CSS classes instead of the guide's. Skipped the verification table.

### 2. Testing the special cases
- Asked: Run the guide's tests (missing `key`, empty list, changed state).
- Got: A throwaway script outside the project confirmed the cards, the empty message, the `done` look and the `key` warning.
- Changed or rejected: The browser console and the visual look were not checked by the AI.

## What I learned / what did not work
- Props are read-only; `key` goes on the component returned from `map`, with the `id` as value.
- `map` needs round brackets (or `return`), otherwise nothing is rendered.
