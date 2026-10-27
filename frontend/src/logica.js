// Logica de date pentru My List (imutabilă), preluată din mockup/filme.js (Etapa 2).

// Adaugă un titlu din catalog în listă, o singură dată; nu modifică lista primită.
export function adaugaInLista(lista, titlu) {
  if (lista.some((f) => f.id === titlu.id)) return lista;
  return [...lista, { ...titlu, vizionat: false, rating: 0 }];
}

export function comutaVazut(lista, id) {
  return lista.map((f) => (f.id === id ? { ...f, vizionat: !f.vizionat } : f));
}

export function stergeFilm(lista, id) {
  return lista.filter((f) => f.id !== id);
}

// Rating 1-5; apăsarea aceleiași valori scoate ratingul (revine la 0).
export function seteazaRating(lista, id, rating) {
  return lista.map((f) =>
    f.id === id ? { ...f, rating: f.rating === rating ? 0 : rating } : f,
  );
}

// Id pentru titlurile adăugate manual: max + 1, dar începând de la 1000,
// ca să nu se ciocnească cu id-urile din catalog.
export function idNou(...liste) {
  return liste.flat().reduce((max, f) => Math.max(max, f.id), 1000) + 1;
}

export function adaugaManual(lista, id, { titlu, format, categorie }) {
  return [...lista, { id, titlu, format, categorie, vizionat: false, rating: 0, manual: true }];
}

// Există deja un titlu cu același nume și format? (fără diferență de majuscule)
export function existaTitlu(titluri, titlu, format) {
  const t = titlu.trim().toLowerCase();
  return titluri.some((f) => f.titlu.toLowerCase() === t && f.format === format);
}

// mod: "adaugate" (ordinea inițială), "nevazute" sau "vazute" (primele sus).
// sort() e stabil, deci în fiecare grup rămâne ordinea în care au fost adăugate.
export function sorteaza(lista, mod) {
  if (mod === "nevazute") return [...lista].sort((a, b) => Number(a.vizionat) - Number(b.vizionat));
  if (mod === "vazute") return [...lista].sort((a, b) => Number(b.vizionat) - Number(a.vizionat));
  return lista;
}

// Filtrează catalogul după text (în titlu) și, opțional, după categorie.
export function filtreazaCatalog(catalog, text, categorie) {
  const q = text.trim().toLowerCase();
  return catalog.filter(
    (t) => (!categorie || t.categorie === categorie) && (!q || t.titlu.toLowerCase().includes(q)),
  );
}

// Candidații pentru Random pick: titlurile din catalog și din listă cu formatul
// (și categoria, dacă e aleasă) cerute, fără cele deja văzute.
export function candidatiRecomandare(catalog, lista, format, categorie) {
  const vazute = new Set(lista.filter((f) => f.vizionat).map((f) => f.id));
  const doarInLista = lista.filter((f) => !catalog.some((t) => t.id === f.id));
  return [...catalog, ...doarInLista].filter(
    (t) =>
      t.format === format &&
      (!categorie || t.categorie === categorie) &&
      !vazute.has(t.id),
  );
}

// Alege la întâmplare un candidat; dacă sunt mai mulți, evită titlul `exclusId`.
export function alegeRandom(candidati, exclusId, rng = Math.random) {
  const optiuni = candidati.length > 1 ? candidati.filter((t) => t.id !== exclusId) : candidati;
  return optiuni.length ? optiuni[Math.floor(rng() * optiuni.length)] : null;
}

// Completează elementele din listă cu datele din catalog (durată, sezoane, descriere),
// ca să apară și pentru titlurile salvate înainte să existe aceste câmpuri.
export function completeazaDinCatalog(lista, catalog) {
  return lista.map((f) => {
    const t = catalog.find((c) => c.id === f.id);
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
