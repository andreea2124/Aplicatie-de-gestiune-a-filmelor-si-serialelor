// Toate cererile HTTP stau aici; componentele nu apelează fetch direct.
// Resurse: /filme = catalogul (doar citire), /lista = My List (citire, adăugare, modificare, ștergere).
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// Funcție comună: trimite JSON și aruncă eroare dacă răspunsul nu este 2xx
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
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
