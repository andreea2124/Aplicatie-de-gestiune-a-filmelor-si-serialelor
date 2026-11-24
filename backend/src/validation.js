// Validare pe server: datele de la client nu sunt niciodată de încredere.
// Valorile fixe trebuie să fie identice cu cele din frontend/src/constants.js.
export const CATEGORII = ["Action", "Comedy", "Drama", "Romance", "Thriller", "SF"];
export const FORMATE = ["movie", "series", "animation"];
const TITLU_MAX = 100;
const NOTITA_MAX = 500;
const UNDE_MAX = 100;

const esteIntreg = (v, min, max = Infinity) => Number.isInteger(v) && v >= min && v <= max;
const esteData = (v) => typeof v === "string" && !Number.isNaN(Date.parse(v));

// Regulile pe câmp. valid = verifică valoarea; mesaj = ce se spune dacă nu trece;
// obligatoriu = trebuie trimis la POST; implicit = valoarea la POST când lipsește.
const format = { valid: (v) => FORMATE.includes(v), mesaj: `format must be one of: ${FORMATE.join(", ")}`, obligatoriu: true };
const categorie = { valid: (v) => CATEGORII.includes(v), mesaj: `categorie must be one of: ${CATEGORII.join(", ")}`, obligatoriu: true };

// Lista albă a unui element din My List (resursa /lista): doar aceste câmpuri ajung în date,
// orice altceva (de exemplu id) e ignorat. Titlul (obligatoriu) se verifică separat.
const CAMPURI_LISTA = {
  catalogId: { valid: (v) => esteIntreg(v, 1), mesaj: "catalogId must be a positive integer" },
  format,
  categorie,
  vizionat: { valid: (v) => typeof v === "boolean", mesaj: "vizionat must be true or false", implicit: false },
  rating: { valid: (v) => esteIntreg(v, 0, 5), mesaj: "rating must be an integer from 0 to 5", implicit: 0 },
  episoade: { valid: (v) => esteIntreg(v, 0), mesaj: "episoade must be a whole number, 0 or more" },
  manual: { valid: (v) => typeof v === "boolean", mesaj: "manual must be true or false" },
  adaugatLa: { valid: esteData, mesaj: "adaugatLa must be an ISO date" },
  vizionatLa: { valid: (v) => v === null || esteData(v), mesaj: "vizionatLa must be an ISO date or null" },
  notita: { valid: (v) => typeof v === "string" && v.length <= NOTITA_MAX, mesaj: `notita must be text of at most ${NOTITA_MAX} characters` },
  unde: { valid: (v) => typeof v === "string" && v.length <= UNDE_MAX, mesaj: `unde must be text of at most ${UNDE_MAX} characters` },
  revizionari: { valid: (v) => esteIntreg(v, 0), mesaj: "revizionari must be a whole number, 0 or more" },
};

// Lista albă a unui titlu din catalog (resursa /filme): titlul, formatul, categoria și detaliile
// (cele din catalog.json; pentru titlurile scrise de mână vin de la TMDB, prin /cauta).
const CAMPURI_CATALOG = {
  format,
  categorie,
  an: { valid: (v) => esteIntreg(v, 1870, 2100), mesaj: "an must be a year" },
  durata: { valid: (v) => esteIntreg(v, 1, 1000), mesaj: "durata must be a number of minutes" },
  durataEp: { valid: (v) => esteIntreg(v, 1, 1000), mesaj: "durataEp must be a number of minutes" },
  sezoane: {
    valid: (v) => Array.isArray(v) && v.length >= 1 && v.length <= 100 && v.every((n) => esteIntreg(n, 1, 1000)),
    mesaj: "sezoane must be a list of episode counts",
  },
  descriere: { valid: (v) => typeof v === "string" && v.length <= 1000, mesaj: "descriere must be text of at most 1000 characters" },
  imdb: { valid: (v) => typeof v === "string" && /^tt\d{5,10}$/.test(v), mesaj: "imdb must be an IMDb id, like tt0111161" },
  poster: {
    valid: (v) => typeof v === "string" && /^\/[A-Za-z0-9_-]{5,60}\.(jpg|jpeg|png|webp)$/.test(v),
    mesaj: "poster must be an image path, like /abc123.jpg",
  },
};

function valideaza(body, campuri, partial) {
  const erori = [];
  const date = {};

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { erori: ["the body must be a JSON object"], date };
  }

  if (!partial || body.titlu !== undefined) {
    if (typeof body.titlu !== "string" || body.titlu.trim() === "") {
      erori.push("titlu is required");
    } else if (body.titlu.trim().length > TITLU_MAX) {
      erori.push(`titlu must have at most ${TITLU_MAX} characters`);
    } else {
      date.titlu = body.titlu.trim();
    }
  }

  for (const [camp, regula] of Object.entries(campuri)) {
    const valoare = body[camp];
    if (valoare !== undefined) {
      if (regula.valid(valoare)) date[camp] = valoare;
      else erori.push(regula.mesaj);
    } else if (!partial) {
      if (regula.obligatoriu) erori.push(`${camp} is required`);
      else if ("implicit" in regula) date[camp] = regula.implicit;
    }
  }

  return { erori, date };
}

// Un element din My List; partial = true pentru PATCH (se verifică doar câmpurile trimise)
export function valideazaFilm(body, { partial = false } = {}) {
  return valideaza(body, CAMPURI_LISTA, partial);
}

// Un titlu nou pentru catalog (POST /filme)
export function valideazaTitluCatalog(body) {
  return valideaza(body, CAMPURI_CATALOG, false);
}

// Id-urile din adresă vin ca text; se acceptă doar numere întregi pozitive
export function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
