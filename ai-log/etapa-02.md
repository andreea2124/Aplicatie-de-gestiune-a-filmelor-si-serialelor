# Stage 2: AI log

## Tools
- Gemini

## Conversations
- https://share.gemini.google/smpGb4MTerlx
- Assistance in structuring immutable array methods (`map`, `filter`, `reduce`, `find`) and validation logic for the movies application.

## Key requests

### 1. Immutable logic implementation
- Asked: How to write update and delete functions without mutating the original array using the spread operator.
- Got: Guidance on using `[...lista, nou]` for adding items, map with object spread for toggling state, and filter for deletion.
- Changed or rejected: Adapted variable names and formats to match the "Plot" movie/series theme.

## What I learned / what did not work
- Understood the core React principle of immutability and why modifying arrays in place breaks state detection.
- Learned how to safely calculate unique IDs using `reduce` instead of `length + 1`.
