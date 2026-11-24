// Cereri către TMDB (themoviedb.org), făcute doar din backend: cheia (TMDB_API_KEY din .env)
// nu ajunge niciodată în browser. Fără cheie, căutarea de titluri răspunde 503, iar restul
// aplicației merge ca până acum.
const BAZA = "https://api.themoviedb.org/3";

function eroare(status, mesaj) {
  const err = new Error(mesaj);
  err.status = status;
  return err;
}

async function tmdb(cale, parametri = {}) {
  const cheie = process.env.TMDB_API_KEY?.trim();
  if (!cheie) throw eroare(503, "Title search is not configured on the server");
  const url = new URL(BAZA + cale);
  // „API Key (v3)” e scurtă și merge ca parametru; „Read Access Token” e lungă și merge ca Bearer
  const bearer = cheie.length > 60;
  if (!bearer) url.searchParams.set("api_key", cheie);
  for (const [k, v] of Object.entries(parametri)) url.searchParams.set(k, v);

  let res;
  try {
    res = await fetch(url, {
      headers: bearer ? { Authorization: `Bearer ${cheie}` } : {},
      signal: AbortSignal.timeout(6000),
    });
  } catch {
    throw eroare(502, "Could not reach the title database");
  }
  if (res.status === 404) throw eroare(404, "Title not found");
  if (!res.ok) throw eroare(502, "The title database is not available right now");
  return res.json();
}

// ---------- genuri TMDB -> format și categorie din aplicație ----------

// O categorie pentru fiecare gen; prioritatea de mai jos alege una când titlul are mai multe.
const CATEGORIE_GEN = {
  10749: "Romance",
  878: "SF", 14: "SF", 10765: "SF",
  53: "Thriller", 80: "Thriller", 27: "Thriller", 9648: "Thriller",
  35: "Comedy",
  28: "Action", 12: "Action", 10759: "Action",
  18: "Drama", 36: "Drama", 10752: "Drama", 10402: "Drama", 10768: "Drama", 37: "Drama",
};
const PRIORITATE = ["Romance", "SF", "Thriller", "Comedy", "Action", "Drama"];

function categorie(idGenuri) {
  const gasite = new Set(idGenuri.map((id) => CATEGORIE_GEN[id]).filter(Boolean));
  return PRIORITATE.find((c) => gasite.has(c)) ?? "Drama";
}

// 16 = Animation: animațiile au formatul lor, indiferent dacă sunt filme sau seriale
function format(tip, idGenuri) {
  if (idGenuri.includes(16)) return "animation";
  return tip === "tv" ? "series" : "movie";
}

const an = (data) => (data ? Number(data.slice(0, 4)) || null : null);

// Descrierea se scurtează la sfârșit de propoziție, ca în catalog
function scurteaza(text, max = 400) {
  const curat = (text ?? "").replace(/\s+/g, " ").trim();
  if (curat.length <= max) return curat;
  const taiat = curat.slice(0, max);
  const punct = Math.max(taiat.lastIndexOf(". "), taiat.lastIndexOf("! "), taiat.lastIndexOf("? "));
  return punct > 120 ? taiat.slice(0, punct + 1) : taiat.replace(/\s+\S*$/, "") + "…";
}

// ---------- ce folosește aplicația ----------

// Sugestii pentru un text: filme și seriale (nu și persoane), cele mai relevante 8.
export async function cautaTitluri(text) {
  const date = await tmdb("/search/multi", { query: text, include_adult: "false", language: "en-US" });
  return (date.results ?? [])
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .slice(0, 8)
    .map((r) => ({
      tmdbId: r.id,
      tip: r.media_type,
      titlu: r.title ?? r.name,
      an: an(r.release_date ?? r.first_air_date),
      poster: r.poster_path ?? null,
      format: format(r.media_type, r.genre_ids ?? []),
      categorie: categorie(r.genre_ids ?? []),
    }));
}

// Multe seriale n-au „durata unui episod”; atunci se ia mediana episoadelor din primul sezon
// (durata ultimului episod ar putea fi a unui final dublu). Dacă nu merge, se întoarce null.
async function durataMedianaEpisod(id, sezoane = []) {
  const primul = sezoane.find((s) => s.season_number >= 1 && s.episode_count > 0);
  if (!primul) return null;
  try {
    const sezon = await tmdb(`/tv/${id}/season/${primul.season_number}`, { language: "en-US" });
    const durate = (sezon.episodes ?? []).map((e) => e.runtime).filter((m) => m > 0).sort((a, b) => a - b);
    return durate.length ? durate[Math.floor(durate.length / 2)] : null;
  } catch {
    return null;
  }
}

// Detaliile unui titlu, în câmpurile din catalog: an, durată sau sezoane (episoade pe sezon),
// durata unui episod, descriere, id IMDb și poster. Câmpurile lipsă nu apar în răspuns.
export async function detaliiTitlu(tip, id) {
  const d = await tmdb(`/${tip}/${id}`, { append_to_response: "external_ids", language: "en-US" });
  const idGenuri = (d.genres ?? []).map((g) => g.id);
  const rezultat = {
    titlu: d.title ?? d.name,
    format: format(tip, idGenuri),
    categorie: categorie(idGenuri),
    an: an(d.release_date ?? d.first_air_date),
  };

  if (tip === "movie") {
    if (d.runtime) rezultat.durata = d.runtime;
  } else {
    // doar sezoanele deja difuzate (fără „sezonul 0” cu speciale și fără cele doar anunțate)
    const azi = new Date().toISOString().slice(0, 10);
    const sezoane = (d.seasons ?? [])
      .filter((s) => s.season_number >= 1 && s.episode_count > 0 && s.air_date && s.air_date <= azi)
      .sort((a, b) => a.season_number - b.season_number)
      .map((s) => s.episode_count);
    if (sezoane.length) rezultat.sezoane = sezoane;
    const durataEp = d.episode_run_time?.[0] ?? (await durataMedianaEpisod(id, d.seasons)) ?? d.last_episode_to_air?.runtime;
    if (durataEp) rezultat.durataEp = durataEp;
  }

  const descriere = scurteaza(d.overview);
  if (descriere) rezultat.descriere = descriere;
  const imdb = d.external_ids?.imdb_id ?? d.imdb_id;
  if (imdb) rezultat.imdb = imdb;
  if (d.poster_path) rezultat.poster = d.poster_path;
  return rezultat;
}
