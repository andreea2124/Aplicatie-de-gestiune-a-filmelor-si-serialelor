// Valorile fixe ale interfeței, într-un singur loc (folosite de mai multe componente).
// Catalogul de titluri (primele trei sunt cele din README, id 1-3) se află în backend/src/data/catalog.json
// și este servit de API-ul Express (vezi src/api.js). Valorile de mai jos trebuie să fie
// identice cu cele din backend/src/validation.js.
export const CATEGORII = ["Action", "Comedy", "Drama", "Romance", "Thriller", "SF"];

// Formatele, în ordinea în care apar în interfață (etichete la plural).
export const FORMATE = [
  { id: "movie", eticheta: "Movies" },
  { id: "series", eticheta: "Series" },
  { id: "animation", eticheta: "Animation" },
];

// Eticheta unui format, la singular (pentru insigne).
export const ETICHETE_TIP = { movie: "Movie", series: "Series", animation: "Animation" };
