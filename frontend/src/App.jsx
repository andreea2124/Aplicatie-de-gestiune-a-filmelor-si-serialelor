import { useEffect, useState } from "react";
import Catalog from "./components/Catalog.jsx";
import FilmList from "./components/FilmList.jsx";
import { CATEGORII, catalog } from "./data/catalog.js";
import { adaugaInLista, comutaVazut, stergeFilm } from "./logica.js";

const CHEIE_LISTA = "plot-my-list";

// My List se păstrează în localStorage; dacă nu e disponibil, pornește goală.
function citesteLista() {
  try {
    const salvat = JSON.parse(localStorage.getItem(CHEIE_LISTA));
    return Array.isArray(salvat) ? salvat : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [filme, setFilme] = useState(citesteLista);
  // cât timp rulează intrarea animată, cardurile au întârzieri pe poziție
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(CHEIE_LISTA, JSON.stringify(filme));
    } catch {
      // fără localStorage, lista rămâne doar în memorie
    }
  }, [filme]);

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const deVazut = filme.filter((f) => !f.vizionat).length;

  return (
    <>
      <header className="app-header">
        <div className="beam" aria-hidden="true"></div>
        <div className="marquee">
          <h1>Plot</h1>
        </div>
        <p>Manage and organize your personal collection of movies and TV shows.</p>
        <p className="app-count">
          {filme.length} items, of which {deVazut} active
        </p>
      </header>
      <div className="filmstrip" aria-hidden="true"></div>

      <main className={intro ? "container intro" : "container"}>
        <section className="panel panel-catalog">
          <h2>Catalog</h2>
          <Catalog
            catalog={catalog}
            categorii={CATEGORII}
            idsInLista={filme.map((f) => f.id)}
            onAdauga={(titlu) => setFilme((lista) => adaugaInLista(lista, titlu))}
          />
        </section>

        <section className="panel panel-lista">
          <h2>My List</h2>
          <FilmList
            filme={filme}
            onComuta={(id) => setFilme((lista) => comutaVazut(lista, id))}
            onSterge={(id) => setFilme((lista) => stergeFilm(lista, id))}
          />
        </section>
      </main>

      <footer className="app-footer">Web Technologies Project</footer>
    </>
  );
}
