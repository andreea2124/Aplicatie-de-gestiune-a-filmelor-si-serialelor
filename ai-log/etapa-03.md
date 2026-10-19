# Stage 3: AI log

## Tools
- Claude Code (VS Code extension)

## Conversations
- Local Claude Code session in VS Code (no public share link).

## Key requests

### 1. Project review against the Stage 3 guide
- Asked: Analyze all files, find what could cause bugs or break the CSS, and check each step of the guide.
- Got: A list of issues: Google Fonts loaded only in the mockup, stage 2 data missing from `App.jsx`, `<pre>` overflowing on narrow screens, duplicated "How to run" in the README.
- Changed or rejected: Removed the GitHub Pages workflow, kept a single `.gitignore` in the root, kept `lang="en"` and skipped the verification table.

### 2. Making the React app look like the mockup
- Asked: Change the files so the app matches the mockup while following the guide.
- Got: Header copied from the mockup with `className`, app renamed to Plot, stage 2 data and a counter computed from `vizionat`.
- Changed or rejected: Left the cards, the form and the two-column layout for stages 4 and 7, as the guide requires.

## What I learned / what did not work
- Vite serves the app from `localhost:5173`; the page can no longer be opened by double-clicking `index.html`.
- `.container` centers the content and uses CSS Grid to split it into columns (`1fr` now, `1fr 2fr` once the form is added).
- A font used in CSS must also be loaded (Google Fonts `<link>` in `index.html`), and `lang` should match the language of the page text.
