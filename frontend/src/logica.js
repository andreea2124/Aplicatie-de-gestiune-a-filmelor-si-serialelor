// Logica de date pentru My List (imutabilă), preluată din mockup/filme.js (Etapa 2).

// Adaugă un titlu din catalog în listă, o singură dată; nu modifică lista primită.
export function adaugaInLista(lista, titlu) {
  if (lista.some((f) => f.id === titlu.id)) return lista;
  return [...lista, { ...titlu, vizionat: false }];
}

export function comutaVazut(lista, id) {
  return lista.map((f) => (f.id === id ? { ...f, vizionat: !f.vizionat } : f));
}

export function stergeFilm(lista, id) {
  return lista.filter((f) => f.id !== id);
}
