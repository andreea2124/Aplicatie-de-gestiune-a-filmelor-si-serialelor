const filme = [
    { id: 1, titlu: "Inception", vizionat: false, format: "movie" },
    { id: 2, titlu: "Breaking Bad", vizionat: true, format: "series" },
    { id: 3, titlu: "Spirited Away", vizionat: false, format: "animation" }
];

const FORMATE = ["movie", "series", "animation"];

function listeazaTitluri(lista) {
    return lista.map((t) => t.titlu);
}

function numaraDeVazut(lista) {
    return lista.filter((t) => !t.vizionat).length;
}

function cautaDupaTitlu(lista, text) {
    const textCautat = text.toLowerCase();
    return lista.filter((t) => t.titlu.toLowerCase().includes(textCautat));
}

function nextId(lista) {
    return lista.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

function adaugaFilm(lista, titlu, format = "movie") {
    const titluCurat = titlu.trim();
    if (!titluCurat) {
        console.log("Eroare: Titlul nu poate fi gol!");
        return lista;
    }
    if (!FORMATE.includes(format)) {
        console.log("Eroare: Formatul specificat nu este permis!");
        return lista;
    }
    const nouFilm = {
        id: nextId(lista),
        titlu: titluCurat,
        vizionat: false,
        format: format
    };
    return [...lista, nouFilm];
}

function comutaVazut(lista, id) {
    return lista.map((t) => (t.id === id ? { ...t, vizionat: !t.vizionat } : t));
}

function stergeFilm(lista, id) {
    return lista.filter((t) => t.id !== id);
}

console.log("--- Citire ---");
console.log("Titluri:", listeazaTitluri(filme).join(", "));
console.log("De văzut:", numaraDeVazut(filme));
console.log("Căutare 'inception':", listeazaTitluri(cautaDupaTitlu(filme, "inception")).join(", "));

console.log("--- Adăugare ---");
let lista = adaugaFilm(filme, "Interstellar", "movie");
console.log("Lista nouă:", lista.length, "filme");
console.log("Originalul a rămas cu:", filme.length, "filme");

console.log("--- Modificare și ștergere ---");
lista = comutaVazut(lista, 1);
console.log("După bifarea id 1, de văzut:", numaraDeVazut(lista));
lista = stergeFilm(lista, 3);
console.log("După ștergerea id 3:", listeazaTitluri(lista).join(", "));

console.log("--- Validare ---");
adaugaFilm(lista, " ");
adaugaFilm(lista, "Matrix", "documentar");
