// Completează catalogul cu date reale: an, durată, sezoane/episoade (din datasetul IMDb)
// și descrieri (TVmaze pentru seriale, Wikipedia pentru filme).
// Rulare, din rădăcina proiectului:  node scripts/build-catalog.mjs
// - fișierele IMDb (~290 MB) se descarcă în scripts/imdb/ dacă lipsesc (ignorate de git);
// - scripts/cache.json păstrează descrierile deja descărcate, ca să nu se ceară din nou;
// - rezultatul se scrie în scripts/imdb/out.json.
// Cu --scrie se rescrie backend/src/data/catalog.json: titlurile existente își păstrează id-ul
// (My List le referă prin catalogId), iar cele noi primesc id-uri în continuare.
// Posterele se adaugă separat, cu scripts/build-posters.mjs (are nevoie de o cheie TMDB).
import fs from "node:fs";
import zlib from "node:zlib";
import readline from "node:readline";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(SCRIPTS, "imdb");
const CATALOG_VECHI = path.join(SCRIPTS, "..", "backend", "src", "data", "catalog.json");
// --offline: fără cereri noi pentru descrieri, se folosește doar ce e în cache
// --scrie: rescrie backend/src/data/catalog.json cu datele obținute
const OFFLINE = process.argv.includes("--offline");
const SCRIE = process.argv.includes("--scrie");

// Descarcă fișierele IMDb care lipsesc
fs.mkdirSync(DIR, { recursive: true });
for (const nume of ["title.basics", "title.ratings", "title.episode"]) {
  const fisier = path.join(DIR, `${nume}.tsv.gz`);
  if (fs.existsSync(fisier)) continue;
  console.log("descarc", nume);
  const res = await fetch(`https://datasets.imdbws.com/${nume}.tsv.gz`);
  if (!res.ok) throw new Error(`${nume}: HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(fisier));
}
// Total țintă: 1200 titluri. Câte titluri NOI se adaugă la fiecare format (în afara celor existente,
// care sunt 86 filme + 60 seriale + 44 animații): 414 + 340 + 256 = 1010 noi.
const QUOTA = { movie: 414, series: 340, animation: 256 };
const TOTAL = { movie: 500, series: 400, animation: 300 }; // câte titluri are catalogul la fiecare format, în final
const OVERFETCH = 1.5; // se iau mai mulți candidați, pentru că unii nu au descriere sau poster
// Cum se amestecă titlurile noi: 40% recente (de la AN_RECENT încoace), 40% cele mai populare din
// toate timpurile și 20% din ultimii doi ani (anul curent primul, ca noutățile să fie în catalog).
const AN_RECENT = 2015;
// Ce pondere are fiecare categorie într-un format (suma = 1). Categoria unui titlu nou se alege dintre
// cele ale genurilor lui, cu cea mai mare lipsă față de țintă; așa Action nu mai înghite totul.
const PONDERI = { Action: 0.2, Comedy: 0.2, Drama: 0.22, Romance: 0.12, Thriller: 0.14, SF: 0.12 };

const norm = (s) =>
  s.toLowerCase().replace(/&/g, "and").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

async function* linii(fisier) {
  const rl = readline.createInterface({ input: fs.createReadStream(fisier).pipe(zlib.createGunzip()), crlfDelay: Infinity });
  let prima = true;
  for await (const l of rl) {
    if (prima) { prima = false; continue; }
    yield l.split("\t");
  }
}

// ---------- 1. ratings + basics ----------
const voturi = new Map();
for await (const [id, , v] of linii(path.join(DIR, "title.ratings.tsv.gz"))) voturi.set(id, +v);
console.log("ratings", voturi.size);

const TIPURI = new Set(["movie", "tvSeries", "tvMiniSeries"]);
const randuri = []; // doar cu voturi suficiente
for await (const [id, tip, titlu, , adult, an, , rt, genuri] of linii(path.join(DIR, "title.basics.tsv.gz"))) {
  if (!TIPURI.has(tip) || adult === "1") continue;
  const v = voturi.get(id) ?? 0;
  if (v < 500) continue;
  randuri.push({ imdb: id, tip, titlu, an: an === "\\N" ? null : +an, rt: rt === "\\N" ? null : +rt, genuri: genuri === "\\N" ? [] : genuri.split(","), voturi: v });
}
console.log("basics", randuri.length);

const dupaTitlu = new Map();
for (const r of randuri) {
  const k = norm(r.titlu);
  if (!dupaTitlu.has(k)) dupaTitlu.set(k, []);
  dupaTitlu.get(k).push(r);
}

// ---------- 2. catalogul existent -> id IMDb ----------
const vechi = JSON.parse(fs.readFileSync(CATALOG_VECHI, "utf8"));
const esteAnim = (r) => r.genuri.includes("Animation");
const compat = (r, format) =>
  format === "movie" ? r.tip === "movie" : format === "series" ? r.tip !== "movie" : true;

const alese = [];
const nerezolvate = [];
const ALIAS = { "Se7en": "tt0114369", "F1": "tt16311594", "Demon Slayer: Infinity Castle": "tt32820897" };
for (const t of vechi) {
  if (ALIAS[t.titlu]) { alese.push({ ...t, existent: true, r: randuri.find((r) => r.imdb === ALIAS[t.titlu]) }); continue; }
  const cand = (dupaTitlu.get(norm(t.titlu)) ?? []).filter((r) => compat(r, t.format));
  const pref = cand.filter((r) => (t.format === "animation") === esteAnim(r));
  const lista = (pref.length ? pref : cand).sort((a, b) => b.voturi - a.voturi);
  if (!lista.length) { nerezolvate.push(t.titlu); alese.push({ ...t, existent: true }); continue; }
  alese.push({ ...t, existent: true, r: lista[0] });
}
console.log("existente nerezolvate:", nerezolvate);

// ---------- 3. candidați noi ----------
// Fiecare gen IMDb contribuie la una dintre cele 6 categorii ale aplicației; un titlu poate avea mai multe.
const MAP_CATEGORIE = {
  Action: "Action", Adventure: "Action", Comedy: "Comedy", Drama: "Drama", Biography: "Drama", History: "Drama",
  War: "Drama", Music: "Drama", Musical: "Drama", Sport: "Drama", Romance: "Romance", Thriller: "Thriller",
  Crime: "Thriller", Horror: "Thriller", Mystery: "Thriller", "Sci-Fi": "SF", Fantasy: "SF",
};
const EXCLUSE = new Set(["Documentary", "Reality-TV", "Talk-Show", "News", "Game-Show", "Adult", "Short"]);
function categoriiPosibile(r, anim) {
  const cats = new Set();
  for (const g of r.genuri) {
    if (g === "Family") { if (anim) cats.add("Comedy"); continue; }
    if (MAP_CATEGORIE[g]) cats.add(MAP_CATEGORIE[g]);
  }
  return [...cats];
}
const folosite = new Set(alese.filter((a) => a.r).map((a) => a.r.imdb));
const titluriFolosite = new Set(vechi.map((t) => norm(t.titlu) + "|" + t.format));
const an_max = new Date().getFullYear();

// toți candidații posibili pe format, în ordinea voturilor
const grupe = { movie: [], series: [], animation: [] };
for (const r of randuri.sort((a, b) => b.voturi - a.voturi)) {
  if (folosite.has(r.imdb) || r.genuri.some((g) => EXCLUSE.has(g)) || !r.an || r.an > an_max) continue;
  const anim = esteAnim(r);
  const format = anim ? "animation" : r.tip === "movie" ? "movie" : "series";
  if (r.tip === "movie" && (!r.rt || r.rt < 60)) continue;
  const cats = categoriiPosibile(r, anim);
  if (!cats.length) continue;
  const cheie = norm(r.titlu) + "|" + format;
  if (titluriFolosite.has(cheie)) continue;
  titluriFolosite.add(cheie);
  grupe[format].push({ existent: false, titlu: r.titlu, format, cats, r });
}

// alternează două liste (anul curent, apoi cel trecut)
function intercalat(a, b) {
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

// Ordinea în care se încearcă candidații: A (recente) și B (populare din toate timpurile) câte 2,
// apoi unul din C (ultimii doi ani, anul curent primul): 40% / 40% / 20%.
function* amestec(grup) {
  const liste = {
    A: grup.filter((t) => t.r.an >= AN_RECENT && t.r.an < an_max - 1),
    B: grup,
    C: intercalat(grup.filter((t) => t.r.an === an_max), grup.filter((t) => t.r.an === an_max - 1)),
  };
  const poz = { A: 0, B: 0, C: 0 };
  const vazute = new Set();
  let maiSunt = true;
  while (maiSunt) {
    maiSunt = false;
    for (const k of ["A", "B", "A", "B", "C"]) {
      while (poz[k] < liste[k].length && vazute.has(liste[k][poz[k]].r.imdb)) poz[k]++;
      if (poz[k] < liste[k].length) {
        const t = liste[k][poz[k]++];
        vazute.add(t.r.imdb);
        maiSunt = true;
        yield t;
      }
    }
  }
}

// Câte titluri mai lipsesc din fiecare categorie, pe format (față de PONDERI), după cele existente.
const existente = {};
for (const f of Object.keys(TOTAL)) existente[f] = Object.fromEntries(Object.keys(PONDERI).map((c) => [c, 0]));
for (const a of alese) if (existente[a.format] && a.categorie in existente[a.format]) existente[a.format][a.categorie]++;

const candidati = { movie: [], series: [], animation: [] };
for (const format of Object.keys(QUOTA)) {
  const tinta = {};
  for (const c of Object.keys(PONDERI)) {
    tinta[c] = Math.ceil(Math.max(0, Math.round(TOTAL[format] * PONDERI[c]) - existente[format][c]) * OVERFETCH);
  }
  const raman = { ...tinta };
  const cap = Math.ceil(QUOTA[format] * OVERFETCH);
  for (const t of amestec(grupe[format])) {
    if (candidati[format].length >= cap) break;
    // categoria posibilă cu cea mai mare lipsă relativă; dacă toate au ținta atinsă, titlul se sare
    let cat = null;
    let celMaiMare = 0;
    for (const c of t.cats) {
      if (raman[c] > 0 && raman[c] / tinta[c] > celMaiMare) { celMaiMare = raman[c] / tinta[c]; cat = c; }
    }
    if (!cat) continue;
    raman[cat]--;
    t.categorie = cat;
    candidati[format].push(t);
  }
}
console.log("candidați", Object.fromEntries(Object.entries(candidati).map(([k, v]) => [k, v.length])));

const toate = [...alese, ...Object.values(candidati).flat()];

// ---------- 4. episoade pe sezon ----------
const seriale = new Set(toate.filter((t) => t.r && t.r.tip !== "movie").map((t) => t.r.imdb));
const episoadeSerial = new Map(); // serial -> [[sezon, id episod]]
for await (const [idEp, parinte, sez] of linii(path.join(DIR, "title.episode.tsv.gz"))) {
  if (!seriale.has(parinte) || sez === "\\N") continue;
  const s = +sez;
  if (s < 1) continue;
  if (!episoadeSerial.has(parinte)) episoadeSerial.set(parinte, []);
  episoadeSerial.get(parinte).push([s, idEp]);
}

// Anul fiecărui episod: sezoanele doar anunțate (placeholder, fără niciun episod difuzat) se ignoră
const idsEpisoade = new Set([...episoadeSerial.values()].flat().map(([, id]) => id));
const anEpisod = new Map();
for await (const [id, , , , , an] of linii(path.join(DIR, "title.basics.tsv.gz"))) {
  if (idsEpisoade.has(id) && an !== "\\N") anEpisod.set(id, +an);
}

const ep = new Map(); // serial -> Map(sezon -> nr episoade)
for (const [serial, lista] of episoadeSerial) {
  const difuzate = new Set(lista.filter(([, id]) => anEpisod.get(id) <= an_max).map(([s]) => s));
  const m = new Map();
  for (const [s] of lista) if (difuzate.has(s)) m.set(s, (m.get(s) ?? 0) + 1);
  // ultimul sezon cu un singur episod, după sezoane întregi, e tot un placeholder
  const chei = [...m.keys()].sort((a, b) => a - b);
  const [penultim, ultim] = chei.slice(-2);
  if (chei.length > 1 && m.get(ultim) === 1 && m.get(penultim) >= 4) m.delete(ultim);
  if (m.size) ep.set(serial, m);
}

// ---------- 5. descrieri ----------
const CACHE = path.join(SCRIPTS, "cache.json");
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
const salveaza = () => fs.writeFileSync(CACHE, JSON.stringify(cache));
const UA = { "User-Agent": "PlotStudentProject/1.0 (university project)" };
const somn = (ms) => new Promise((r) => setTimeout(r, ms));

async function json(url, incercari = 6) {
  for (let i = 0; i < incercari; i++) {
    try {
      const res = await fetch(url, { headers: UA });
      if (res.status === 404) return null;
      if (res.status === 429 || res.status >= 500) { await somn(3000 * (i + 1)); continue; }
      return await res.json();
    } catch { await somn(1000 * (i + 1)); }
  }
  return null;
}

function propozitii(text) {
  return text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+(?=["“A-Z0-9])/);
}
function scurteaza(text, tinta = 230, max = 400) {
  const p = propozitii(text);
  let out = "";
  for (const s of p) {
    if (out && (out + " " + s).length > max) break;
    out = out ? out + " " + s : s;
    if (out.length >= tinta) break;
  }
  if (out.length > max) out = out.slice(0, max).replace(/\s+\S*$/, "") + "…";
  return out;
}

const potrivesteTitlu = (rez, titlu, larg) => {
  const a = norm(rez.replace(/\s*\(.*?\)\s*/g, ""));
  const b = norm(titlu);
  return a === b || (larg && (a.includes(b) || b.includes(a)));
};
const descFilm = /\b(film|movie)\b/i;
const descSerie = /\b(series|television|miniseries|sitcom|anime|show|drama|animated)\b/i;

async function wikipedia(t) {
  const { r } = t;
  const titluri = [...new Set([t.titlu, r.titlu])];
  const film = r.tip === "movie";
  const interogari = film
    ? titluri.flatMap((x) => [`${x} ${r.an} film`, `${x} film`])
    : [`${r.titlu} ${r.an} television series`, `${r.titlu} television series`];
  for (const q of interogari) {
    const rez = await json(`https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(q)}&limit=6`);
    for (const p of rez?.pages ?? []) {
      if (!titluri.some((x) => potrivesteTitlu(p.title, x, film))) continue;
      const d = p.description ?? "";
      if (film) {
        if (!descFilm.test(d)) continue;
        if (d.match(/\b(18|19|20)\d\d\b/) && Math.abs(+d.match(/\b(18|19|20)\d\d\b/)[0] - r.an) > 1) continue;
      } else if (!descSerie.test(d)) continue;
      const full = await json(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&explaintext=1&redirects=1&titles=${encodeURIComponent(p.title)}`,
      );
      const pagina = Object.values(full?.query?.pages ?? {})[0];
      const txt = pagina?.extract;
      if (!txt) continue;
      const plot = txt.match(/==\s*(Plot|Premise|Synopsis|Plot summary)\s*==\s*([\s\S]*?)(?:\n==|$)/i);
      const bucati = (plot ? plot[2] : txt.split(/\n==/)[0]).split(/\n+/).map((s) => s.trim()).filter((s) => s.length > 60 && !s.startsWith("="));
      if (bucati.length) return scurteaza(bucati[0]);
    }
  }
  return null;
}

let ultimTvmaze = 0;
async function tvmaze(t) {
  const asteapta = Math.max(0, ultimTvmaze + 600 - Date.now());
  ultimTvmaze = Date.now() + asteapta;
  if (asteapta) await somn(asteapta);
  const s = await json(`https://api.tvmaze.com/lookup/shows?imdb=${t.r.imdb}`);
  const html = s?.summary;
  if (!html) return null;
  const txt = html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, " ").trim();
  return txt.length > 40 ? scurteaza(txt) : null;
}

// Cheia TMDB (din scripts/.env.local sau variabila TMDB_API_KEY), aceeași ca la build-posters.mjs.
// Dacă există, descrierile titlurilor noi se cer întâi de la TMDB: un singur request rapid,
// fără limitele Wikipedia. TVmaze și Wikipedia rămân ca variante de rezervă.
function citesteCheiaTmdb() {
  if (process.env.TMDB_API_KEY) return process.env.TMDB_API_KEY.trim();
  const fisier = path.join(SCRIPTS, ".env.local");
  if (!fs.existsSync(fisier)) return null;
  const linie = fs.readFileSync(fisier, "utf8").split(String.fromCharCode(10)).find((l) => l.trim().startsWith("TMDB_API_KEY="));
  return linie ? linie.slice(linie.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "") : null;
}
const CHEIE_TMDB = citesteCheiaTmdb();

// Un singur request /find întoarce și descrierea (overview), și calea posterului.
// Rezultatul se păstrează în cache sub cheia "tmdb:<id imdb>".
async function infoTmdb(t) {
  const cheie = `tmdb:${t.r.imdb}`;
  if (cheie in cache) return cache[cheie];
  const rez = await json(`https://api.themoviedb.org/3/find/${t.r.imdb}?external_source=imdb_id&api_key=${CHEIE_TMDB}`);
  if (!rez) return { descriere: null, poster: null }; // eșec de rețea: nu se salvează în cache
  const tv = rez.tv_results ?? [];
  const film = rez.movie_results ?? [];
  const lista = t.r.tip === "movie" ? [...film, ...tv] : [...tv, ...film];
  const txt = lista.map((x) => (x.overview ?? "").replace(/\s+/g, " ").trim()).find((x) => x.length > 40);
  const info = { descriere: txt ? scurteaza(txt) : null, poster: lista.find((x) => x.poster_path)?.poster_path ?? null };
  cache[cheie] = info;
  return info;
}

// Titlurile noi trebuie să aibă poster: fără el nu se mai pierde timp cu descrierea.
async function descriere(t) {
  const k = t.r.imdb;
  const info = !t.existent && CHEIE_TMDB && !OFFLINE ? await infoTmdb(t) : null;
  if (info) {
    if (!info.poster) return null;
    t.poster = info.poster;
  }
  if (cache[k]) return cache[k];
  if (OFFLINE) return null;
  let d = info?.descriere ?? null;
  if (!d && t.r.tip !== "movie") d = await tvmaze(t);
  if (!d) d = await wikipedia(t);
  cache[k] = d;
  return d;
}

const lucrari = toate.filter((t) => t.r);
let gata = 0;
async function lucrator() {
  while (lucrari.length) {
    const t = lucrari.shift();
    t.descriere = await descriere(t);
    if (++gata % 50 === 0) { salveaza(); console.log("descrieri", gata); }
  }
}
// TVmaze e limitat la ritm (are propriul spațiu între cereri), TMDB și Wikipedia suportă paralelism
await Promise.all(Array.from({ length: CHEIE_TMDB ? 6 : 2 }, lucrator));
salveaza();

// ---------- 6. selecție finală ----------
const rezultat = [];
for (const t of alese) rezultat.push(t);
for (const format of Object.keys(QUOTA)) {
  const buni = candidati[format].filter((t) => t.descriere && (!CHEIE_TMDB || t.poster) && (t.r.tip === "movie" || ep.get(t.r.imdb)?.size));
  rezultat.push(...buni.slice(0, QUOTA[format]));
  console.log(format, "bune", buni.length, "folosite", Math.min(buni.length, QUOTA[format]));
}
let urmator = Math.max(...vechi.map((t) => t.id)) + 1;
for (const t of rezultat) if (!t.existent) t.id = urmator++;
const iesire = rezultat.map((t) => {
  const o = { id: t.id, titlu: t.titlu, format: t.format, categorie: t.categorie };
  if (t.r) {
    o.an = t.r.an;
    if (t.r.tip === "movie") { if (t.r.rt) o.durata = t.r.rt; }
    else {
      const m = ep.get(t.r.imdb);
      if (m) o.sezoane = [...m.keys()].sort((a, b) => a - b).map((s) => m.get(s));
      if (t.r.rt) o.durataEp = t.r.rt;
    }
    if (t.descriere) o.descriere = t.descriere;
    o.imdb = t.r.imdb;
    if (t.poster) o.poster = t.poster;
  }
  return o;
});
fs.writeFileSync(path.join(DIR, "out.json"), JSON.stringify(iesire, null, 1));
console.log("total", iesire.length, "fără descriere:", iesire.filter((o) => o.imdb && !o.descriere).map((o) => o.titlu));

// ---------- 7. scrierea catalogului ----------
if (SCRIE) {
  const CAMPURI = ["id", "titlu", "format", "categorie", "an", "durata", "sezoane", "durataEp", "descriere", "imdb", "poster"];
  const sortat = [...iesire].sort((a, b) => a.id - b.id).map((o) => Object.fromEntries(CAMPURI.filter((c) => o[c] !== undefined).map((c) => [c, o[c]])));
  fs.writeFileSync(CATALOG_VECHI, JSON.stringify(sortat, null, 2) + "\n");
  console.log("scris", CATALOG_VECHI, sortat.length, "titluri");
}
