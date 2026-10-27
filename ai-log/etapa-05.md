# Stage 5: AI log

## Tools
- Claude Code (VS Code extension)

## Conversations
- Local Claude Code session in VS Code (no public share link).

## Key requests

### 1. Studying the guide
- Asked: Read the Stage 5 guide and list what has to be done, without changing anything.
- Got: A comparison with the code: toggling, deleting and the derived counter already worked; only the theme button and the docs were missing.
- Changed or rejected: Skipped the verification table. Kept the existing names (`comutaVazut`, `deVazut`) and the mockup's status button instead of a checkbox.

### 2. Light / dark theme button
- Asked: Add the theme button, with a sun and a moon instead of text.
- Got: `temaInitiala`, the `tema` state and `comutaTema` in `App.jsx`; the `data-theme` rules and the button style in `App.css`; the extra dark-mode rules moved into CSS variables; the README section.
- Changed or rejected: I chose the sun / moon icons and the top-right corner. `npm run lint` and `npm run build` pass; the look in the browser was not checked by the AI.

## What I learned / what did not work
- State is written only through `setFilme((lista) => ...)` and the immutable functions; the counter is derived, not stored.
- `:root:not([data-theme="light"])` in the `@media` block lets the button switch back to light when the system is dark.
- `useState(temaInitiala)` gets the function itself, so it runs only once.
