// Logica de date pentru My List (imutabilă), preluată din mockup/filme.js (Etapa 2).
// Din Etapa 7 lista stă pe server (resursa /lista): id-urile le dă serverul,
// iar aici rămân doar funcțiile care pregătesc datele și actualizează state-ul.

// Elementul trimis la server când se adaugă un titlu din catalog: doar referința
// (catalogId) și câmpurile de bază; detaliile se iau din catalog la afișare.
export function dinCatalog(titlu) {
  return {
    catalogId: titlu.id,
    titlu: titlu.titlu,
    format: titlu.format,
    categorie: titlu.categorie,
    vizionat: false,
    rating: 0,
  };
}

// Elementul trimis la server pentru un titlu scris de utilizator în formular.
export function dinFormular({ titlu, format, categorie }) {
  return { titlu, format, categorie, vizionat: false, rating: 0, manual: true };
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

// Candidații pentru Random pick: titlurile din catalog și cele adăugate manual în listă,
// cu formatul (și categoria, dacă e aleasă) cerute, fără cele deja văzute.
export function candidatiRecomandare(catalog, lista, format, categorie) {
  const vazute = new Set(idsDinCatalog(lista.filter((f) => f.vizionat)));
  const manuale = lista.filter((f) => f.catalogId == null && !f.vizionat);
  return [...catalog.filter((t) => !vazute.has(t.id)), ...manuale].filter(
    (t) => t.format === format && (!categorie || t.categorie === categorie),
  );
}

// Id-urile din catalog și cele din listă pot coincide, deci un candidat
// se recunoaște după sursă + id.
const cheieCandidat = (t) => (t.manual ? `lista-${t.id}` : `catalog-${t.id}`);

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
