// Logica de date pentru My List (imutabilă), preluată din mockup/filme.js (Etapa 2).
// Din Etapa 7 lista stă pe server (resursa /lista): id-urile le dă serverul,
// iar aici rămân doar funcțiile care pregătesc datele și actualizează state-ul.

// Elementul trimis la server când se adaugă un titlu din catalog: doar referința
// (catalogId) și câmpurile de bază; detaliile se iau din catalog la afișare.
export function dinCatalog(titlu, acum = new Date()) {
  return {
    catalogId: titlu.id,
    titlu: titlu.titlu,
    format: titlu.format,
    categorie: titlu.categorie,
    vizionat: false,
    rating: 0,
    ...campuriNoi(acum),
  };
}

// Câmpurile personale ale unui element nou: data adăugării, notiță, unde se vede, re-vizionări.
function campuriNoi(acum) {
  return { adaugatLa: acum.toISOString(), notita: "", unde: "", revizionari: 0 };
}

// Titlul trimis la catalog (POST /filme) pentru ce a scris utilizatorul în formular.
// detalii (opțional) = ce a găsit TMDB pentru titlul ales din sugestii: an, durată sau sezoane,
// descriere, id IMDb, poster. Elementul din My List se face apoi din intrarea din catalog, cu dinCatalog.
export function titluDinFormular({ titlu, format, categorie, detalii }) {
  return { ...detalii, titlu, format, categorie };
}

// Înlocuiește în listă elementul cu același id cu cel întors de server.
export function inlocuieste(lista, element) {
  return lista.map((f) => (f.id === element.id ? element : f));
}

export function stergeFilm(lista, id) {
  return lista.filter((f) => f.id !== id);
}

// Rating 1-5; apăsarea aceleiași valori scoate ratingul (revine la 0).
export function ratingNou(curent, ales) {
  return curent === ales ? 0 : ales;
}

// Id-urile din catalog ale titlurilor aflate deja în listă.
export function idsDinCatalog(lista) {
  return lista.filter((f) => f.catalogId != null).map((f) => f.catalogId);
}

// Există deja un titlu cu același nume și format? (fără diferență de majuscule)
export function existaTitlu(titluri, titlu, format) {
  const t = titlu.trim().toLowerCase();
  return titluri.some((f) => f.titlu.toLowerCase() === t && f.format === format);
}

// Text pentru căutare: litere mici, fără diacritice și fără punctuație, ca "dune prophecy"
// să găsească "Dune: Prophecy" și "amelie" să găsească "Amélie".
export function normalizeaza(text) {
  return (text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// mod: "adaugate" (ordinea inițială), "nevazute" sau "vazute" (primele sus).
// sort() e stabil, deci în fiecare grup rămâne ordinea în care au fost adăugate.
export function sorteaza(lista, mod) {
  if (mod === "nevazute") return [...lista].sort((a, b) => Number(a.vizionat) - Number(b.vizionat));
  if (mod === "vazute") return [...lista].sort((a, b) => Number(b.vizionat) - Number(a.vizionat));
  return lista;
}

// Filtrează My List după text (în titlu sau în notiță) și după status: "toate", "nevazute", "vazute".
export function filtreazaLista(lista, text, status) {
  const q = normalizeaza(text);
  return lista.filter((f) => {
    const statusOk = status === "toate" || (status === "vazute" ? Boolean(f.vizionat) : !f.vizionat);
    const textOk = !q || normalizeaza(f.titlu).includes(q) || normalizeaza(f.notita).includes(q);
    return statusOk && textOk;
  });
}

// Câte elemente are fiecare filtru de status.
export function numaraStatus(lista) {
  const vazute = lista.filter((f) => f.vizionat).length;
  return { toate: lista.length, nevazute: lista.length - vazute, vazute };
}

// "2026-11-12T10:00:00.000Z" -> "12 Nov 2026" ("" dacă lipsește)
const formatData = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
export function formateazaData(iso) {
  return iso ? formatData.format(new Date(iso)) : "";
}

// Filtrează catalogul după text (în titlu) și, opțional, după categorie.
export function filtreazaCatalog(catalog, text, categorie) {
  const q = normalizeaza(text);
  return catalog.filter(
    (t) => (!categorie || t.categorie === categorie) && (!q || normalizeaza(t.titlu).includes(q)),
  );
}

// Candidații pentru Random pick: titlurile din catalog și cele adăugate manual în listă,
// cu formatul (și categoria, dacă e aleasă) cerute, fără cele deja văzute.
export function candidatiRecomandare(catalog, lista, format, categorie, sursa = "catalog") {
  // din My List: doar titlurile nevăzute, marcate cu deLista (id-ul e cel din listă)
  if (sursa === "lista") {
    return lista
      .filter((f) => !f.vizionat && f.format === format && (!categorie || f.categorie === categorie))
      .map((f) => ({ ...f, deLista: true }));
  }
  const vazute = new Set(idsDinCatalog(lista.filter((f) => f.vizionat)));
  const manuale = lista.filter((f) => f.catalogId == null && !f.vizionat);
  return [...catalog.filter((t) => !vazute.has(t.id)), ...manuale].filter(
    (t) => t.format === format && (!categorie || t.categorie === categorie),
  );
}

// Id-urile din catalog și cele din listă pot coincide, deci un candidat
// se recunoaște după sursă + id.
const cheieCandidat = (t) => (t.manual || t.deLista ? `lista-${t.id}` : `catalog-${t.id}`);

// Alege la întâmplare un candidat; dacă sunt mai mulți, evită titlul `exclus`.
export function alegeRandom(candidati, exclus, rng = Math.random) {
  const optiuni =
    candidati.length > 1 && exclus
      ? candidati.filter((t) => cheieCandidat(t) !== cheieCandidat(exclus))
      : candidati;
  return optiuni.length ? optiuni[Math.floor(rng() * optiuni.length)] : null;
}

// Completează elementele din listă cu datele din catalog (durată, sezoane, descriere);
// pe server se salvează doar catalogId, nu și detaliile. Id-ul rămâne cel din listă.
export function completeazaDinCatalog(lista, catalog) {
  return lista.map((f) => {
    const t = f.catalogId != null && catalog.find((c) => c.id === f.catalogId);
    return t ? { ...t, ...f } : f;
  });
}

// Are titlul ceva de arătat în panoul de detalii?
export function areDetalii(t) {
  return Boolean(t.descriere || t.durata || t.sezoane);
}

// 148 -> "2h 28m", 120 -> "2h", 45 -> "45m"
export function formateazaDurata(minute) {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ---------- Episoade (seriale cu sezoane în catalog) ----------

export function totalEpisoade(t) {
  return t.sezoane ? t.sezoane.reduce((a, b) => a + b, 0) : 0;
}

// Câte episoade s-au văzut: toate, dacă titlul e bifat; altfel câmpul `episoade`.
export function episoadeVazute(f) {
  const total = totalEpisoade(f);
  return f.vizionat ? total : Math.min(f.episoade ?? 0, total);
}

// Din numărul de episoade văzute -> sezonul și episodul următor (null = terminat).
export function urmatorulEpisod(sezoane, vazute) {
  let ramase = vazute;
  for (let i = 0; i < sezoane.length; i++) {
    if (ramase < sezoane[i]) return { sezon: i + 1, episod: ramase + 1 };
    ramase -= sezoane[i];
  }
  return null;
}

// Câte episoade s-ar vedea după terminarea sezonului curent.
export function finalSezon(sezoane, vazute) {
  let suma = 0;
  for (const n of sezoane) {
    suma += n;
    if (vazute < suma) return suma;
  }
  return suma;
}

// Modificarea trimisă la server când se schimbă numărul de episoade:
// la ultimul episod titlul devine văzut, iar sub el redevine nevăzut.
export function schimbareEpisoade(f, nou, acum = new Date()) {
  const total = totalEpisoade(f);
  const n = Math.max(0, Math.min(nou, total));
  const vizionat = n === total;
  const schimbare = { episoade: n, vizionat };
  // data vizionării se notează când titlul devine văzut și se șterge când nu mai e
  if (vizionat && !f.vizionat) schimbare.vizionatLa = acum.toISOString();
  if (!vizionat && f.vizionat) schimbare.vizionatLa = null;
  return schimbare;
}

// Modificarea trimisă la bifare. Un serial terminat din episoade și debifat
// pornește de la zero (altfel ar arăta toate episoadele văzute, dar nebifat).
export function schimbareVizionat(f, acum = new Date()) {
  const total = totalEpisoade(f);
  if (f.vizionat && total > 0 && (f.episoade ?? 0) >= total) {
    return { vizionat: false, episoade: 0, vizionatLa: null };
  }
  return f.vizionat
    ? { vizionat: false, vizionatLa: null }
    : { vizionat: true, vizionatLa: acum.toISOString() };
}

// În câte zile și la ce dată se termină `ramase` episoade, la `peZi` pe zi.
export function dataTerminare(ramase, peZi, azi = new Date()) {
  const zile = Math.ceil(ramase / peZi);
  const data = new Date(azi);
  data.setDate(data.getDate() + zile);
  return { zile, data };
}

// ---------- Statistici ("Plot Wrapped") ----------

// Minutele văzute dintr-un titlu: durata filmului sau episoadele văzute x durata unui episod.
export function minuteVazute(f) {
  if (f.sezoane) return episoadeVazute(f) * (f.durataEp ?? 0);
  return f.vizionat ? f.durata ?? 0 : 0;
}

// Ziua locală a unei date, ca text: "2026-11-12"
const cheieZi = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// Câte zile la rând (până azi sau ieri) s-a terminat cel puțin un titlu.
export function serieZile(lista, azi = new Date()) {
  const zile = new Set(lista.filter((f) => f.vizionatLa).map((f) => cheieZi(new Date(f.vizionatLa))));
  const ziua = new Date(azi.getFullYear(), azi.getMonth(), azi.getDate());
  if (!zile.has(cheieZi(ziua))) ziua.setDate(ziua.getDate() - 1); // seria poate fi încă activă de ieri
  let serie = 0;
  while (zile.has(cheieZi(ziua))) {
    serie++;
    ziua.setDate(ziua.getDate() - 1);
  }
  return serie;
}

// Titlurile terminate în ultimele `n` luni (inclusiv cea curentă), de la cea mai veche la cea mai nouă.
export function peLuni(lista, azi = new Date(), n = 6) {
  const nume = new Intl.DateTimeFormat("en-GB", { month: "short" });
  return Array.from({ length: n }, (_, i) => {
    const luna = new Date(azi.getFullYear(), azi.getMonth() - (n - 1 - i), 1);
    const cate = lista.filter((f) => {
      if (!f.vizionatLa) return false;
      const d = new Date(f.vizionatLa);
      return d.getFullYear() === luna.getFullYear() && d.getMonth() === luna.getMonth();
    }).length;
    return { eticheta: nume.format(luna), n: cate };
  });
}

export function statistici(lista, categorii, azi = new Date()) {
  const vazute = lista.filter((f) => f.vizionat);
  const minute = lista.reduce((s, f) => s + minuteVazute(f), 0);
  const episoade = lista.reduce((s, f) => s + (f.sezoane ? episoadeVazute(f) : 0), 0);
  const notate = vazute.filter((f) => f.rating > 0);
  const medie = notate.length ? notate.reduce((s, f) => s + f.rating, 0) / notate.length : 0;

  const peCategorie = categorii
    .map((c) => ({ categorie: c, n: vazute.filter((f) => f.categorie === c).length }))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n);

  const peFormat = ["movie", "series", "animation"].map((format) => ({
    format,
    n: vazute.filter((f) => f.format === format).length,
  }));

  // cel mai bine notat, cel mai lung film văzut, serialul cu cele mai multe episoade văzute
  const maxDupa = (arr, fn) => arr.reduce((best, f) => (!best || fn(f) > fn(best) ? f : best), null);
  const topNotat = maxDupa(notate, (f) => f.rating);
  const celMaiLungFilm = maxDupa(vazute.filter((f) => f.durata), (f) => f.durata);
  const serialTop = maxDupa(lista.filter((f) => f.sezoane && episoadeVazute(f) > 0), episoadeVazute);
  const faraDurata = vazute.filter((f) => !f.durata && !f.durataEp).length;

  const luni = peLuni(lista, azi);

  return {
    luni,
    lunaAceasta: luni[luni.length - 1].n,
    serie: serieZile(lista, azi),
    cuDate: lista.some((f) => f.vizionatLa),
    total: lista.length,
    vazute: vazute.length,
    minute,
    episoade,
    medie,
    notate: notate.length,
    peCategorie,
    peFormat,
    topNotat,
    celMaiLungFilm,
    serialTop,
    faraDurata,
  };
}

// ---------- Random pick ca slot machine ----------

// Banda ruletei: titluri la întâmplare dintre candidați, iar ultimul e cel ales.
export function bandaRuleta(candidati, ales, lungime = 24, rng = Math.random) {
  const banda = Array.from({ length: lungime - 1 }, () => candidati[Math.floor(rng() * candidati.length)]);
  return [...banda, ales];
}
