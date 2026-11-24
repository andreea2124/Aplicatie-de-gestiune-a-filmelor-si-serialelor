// Toate cererile HTTP stau aici; componentele nu apelează fetch direct.
// Backend propriu (Express, folderul backend/). Resurse: /filme = catalogul (doar citire), /lista = My List (citire, adăugare, modificare, ștergere).
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// Funcție comună: trimite JSON și aruncă eroare dacă răspunsul nu este 2xx
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    // fetch aruncă TypeError ("Failed to fetch") când serverul nu răspunde deloc
    throw new Error("Could not reach the server. Is the backend running (`npm run dev` in backend/)?");
  }
  if (!res.ok) {
    // API-ul propriu răspunde cu { error: "..." }; fără corp JSON se folosește mesajul generic
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Server error: ${res.status}`);
    err.status = res.status; // ca interfața să poată reacționa diferit la 404
    throw err;
  }
  // 204 No Content nu are corp
  return res.status === 204 ? null : res.json();
}

export function fetchFilme() {
  return request("/filme");
}

export function fetchLista() {
  return request("/lista");
}

export function createFilm(film) {
  return request("/lista", { method: "POST", body: JSON.stringify(film) });
}

export function updateFilm(id, changes) {
  return request(`/lista/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function deleteFilm(id) {
  return request(`/lista/${id}`, { method: "DELETE" });
}

// Un singur element din My List (pagina de detaliu): GET /lista/:id
export function fetchElement(id) {
  return request(`/lista/${id}`);
}

// Adaugă un titlu în catalog: POST /filme. Serverul întoarce titlul cu id (201), sau pe cel existent (200).
export function createTitluCatalog(titlu) {
  return request("/filme", { method: "POST", body: JSON.stringify(titlu) });
}

// Sugestii de titluri de la TMDB, prin backend (formularul „Custom title”): GET /cauta?q=...
export function cautaTitluri(text) {
  return request(`/cauta?q=${encodeURIComponent(text)}`);
}

// Detaliile titlului ales (an, durată sau sezoane, descriere, poster...): GET /cauta/:tip/:id
export function detaliiTitlu(tip, id) {
  return request(`/cauta/${tip}/${id}`);
}

// Un singur titlu din catalog: GET /filme/:id
export function fetchTitluCatalog(id) {
  return request(`/filme/${id}`);
}
