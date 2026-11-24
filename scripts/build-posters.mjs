// Adaugă în catalog câte un poster pentru fiecare titlu, de la TMDB (themoviedb.org).
// Rulare, din rădăcina proiectului:  node scripts/build-posters.mjs
//
// Cheia TMDB (gratuită, din Settings > API pe themoviedb.org) se citește din:
//   - variabila de mediu TMDB_API_KEY, sau
//   - fișierul scripts/.env.local, cu o linie:  TMDB_API_KEY=cheia_ta
// Fișierul e ignorat de git (vezi .gitignore: .env.*), iar cheia nu ajunge în aplicație:
// în catalog se salvează doar calea imaginii (de exemplu "/abc123.jpg"), iar frontendul
// construiește adresa https://image.tmdb.org/t/p/w342/abc123.jpg.
//
// Titlurile care au deja `poster` se sar; cu --refa se cer din nou toate.
// Titlurile pentru care TMDB nu are poster se scot din catalog (vezi la final).
// Se caută după id-ul IMDb (câmpul `imdb` din catalog): /find/{imdb_id}.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const CATALOG = path.join(SCRIPTS, "..", "backend", "src", "data", "catalog.json");
const REFA = process.argv.includes("--refa");

function citesteCheia() {
  if (process.env.TMDB_API_KEY) return process.env.TMDB_API_KEY.trim();
  const fisier = path.join(SCRIPTS, ".env.local");
  if (fs.existsSync(fisier)) {
    const linie = fs.readFileSync(fisier, "utf8").split(/\r?\n/).find((l) => l.trim().startsWith("TMDB_API_KEY="));
    if (linie) return linie.slice(linie.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

const cheie = citesteCheia();
if (!cheie) {
  console.error("Lipsește cheia TMDB. Pune în scripts/.env.local linia  TMDB_API_KEY=cheia_ta  (sau variabila de mediu).");
  process.exit(1);
}
// cheia „API Key (v3)” e scurtă și merge ca parametru; „API Read Access Token” e lungă și merge ca Bearer
const BEARER = cheie.length > 60;

const somn = (ms) => new Promise((r) => setTimeout(r, ms));

async function gaseste(imdb, incercari = 6) {
  const url = new URL(`https://api.themoviedb.org/3/find/${imdb}`);
  url.searchParams.set("external_source", "imdb_id");
  if (!BEARER) url.searchParams.set("api_key", cheie);
  for (let i = 0; i < incercari; i++) {
    try {
      const res = await fetch(url, { headers: BEARER ? { Authorization: `Bearer ${cheie}` } : {} });
      if (res.status === 401) throw new Error("Cheia TMDB e respinsă (401). Verific-o în scripts/.env.local.");
      if (res.status === 429) {
        await somn((Number(res.headers.get("retry-after")) || 2) * 1000);
        continue;
      }
      if (!res.ok) {
        await somn(1000 * (i + 1));
        continue;
      }
      return await res.json();
    } catch (err) {
      if (err.message.includes("401")) throw err;
      await somn(1000 * (i + 1));
    }
  }
  return null;
}

const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
const deFacut = catalog.filter((t) => t.imdb && (REFA || !t.poster));
console.log(`${deFacut.length} titluri fără poster din ${catalog.length}`);

let gata = 0;
let gasite = 0;
const lipsa = [];

async function lucrator() {
  while (deFacut.length) {
    const t = deFacut.shift();
    const rez = await gaseste(t.imdb);
    // serialele stau la tv_results, filmele la movie_results; se încearcă și celălalt tip
    const tv = rez?.tv_results ?? [];
    const film = rez?.movie_results ?? [];
    const lista = t.format === "series" || t.sezoane ? [...tv, ...film] : [...film, ...tv];
    const cu = lista.find((x) => x.poster_path);
    if (cu) {
      t.poster = cu.poster_path;
      gasite++;
    } else {
      lipsa.push(t.titlu);
    }
    if (++gata % 100 === 0) {
      fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + "\n");
      console.log(`${gata} gata, ${gasite} cu poster`);
    }
  }
}

// ~5 cereri în paralel sunt mult sub limita TMDB (zeci de cereri pe secundă)
await Promise.all(Array.from({ length: 5 }, lucrator));
console.log(`Gata: ${gasite} postere noi, ${lipsa.length} fără poster.`);

// Titlurile fără poster se scot din catalog (afișul desenat rămâne doar ca variantă de rezervă pentru
// o imagine care nu se încarcă). Excepție: cele 3 titluri din README (id 1-3), care trebuie să rămână.
const PASTRATE = 3;
const scoase = catalog.filter((t) => !t.poster && t.id > PASTRATE);
const ramase = catalog.filter((t) => t.poster || t.id <= PASTRATE);
if (scoase.length) console.log(`Scoase din catalog (fără poster): ${scoase.map((t) => t.titlu).join(", ")}`);
fs.writeFileSync(CATALOG, JSON.stringify(ramase, null, 2) + "\n");
console.log(`În total: ${ramase.filter((t) => t.poster).length}/${ramase.length} titluri au poster.`);
