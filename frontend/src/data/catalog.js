// Constantele interfeței. Catalogul de titluri (primele trei sunt cele din README, id 1-3)
// se află în db.json și este servit de json-server (vezi src/api.js).
export const CATEGORII = ["Action", "Comedy", "Drama", "Romance", "Thriller", "SF"];

// Formatele, în ordinea în care apar în interfață (etichete la plural).
export const FORMATE = [
  { id: "movie", eticheta: "Movies" },
  { id: "series", eticheta: "Series" },
  { id: "animation", eticheta: "Animation" },
];
