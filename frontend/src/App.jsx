import { useEffect, useState } from "react";
import AddForm from "./components/AddForm.jsx";
import Catalog from "./components/Catalog.jsx";
import FilmList from "./components/FilmList.jsx";
import RandomPick from "./components/RandomPick.jsx";
import { CATEGORII, FORMATE, catalog } from "./data/catalog.js";
import {
  adaugaInLista,
  adaugaManual,
  comutaVazut,
  existaTitlu,
  idNou,
  seteazaRating,
  sorteaza,
  stergeFilm,
} from "./logica.js";

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
  const [sortare, setSortare] = useState("adaugate");
  const [formular, setFormular] = useState(false);
  const [random, setRandom] = useState(false);

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

  // Titlu adăugat de utilizator; întoarce un mesaj de eroare sau null.
  function adaugaTitluManual(date) {
    if (existaTitlu(filme, date.titlu, date.format)) return "This title is already in your list.";
    if (existaTitlu(catalog, date.titlu, date.format)) {
      return "This title is already in the catalog - add it from there.";
    }
    setFilme((lista) => adaugaManual(lista, idNou(lista, catalog), date));
    return null;
  }

  return (
    <>
      <header className="app-header">
        <div className="valance" aria-hidden="true"></div>
        <div className="beam" aria-hidden="true"></div>
        <div className="marquee">
          <span className="bulbs-side bulbs-left" aria-hidden="true"></span>
          <span className="bulbs-side bulbs-right" aria-hidden="true"></span>
          <h1>Plot</h1>
        </div>
        <p>Manage and organize your personal collection of movies and TV shows.</p>
        <p className="app-count">
          {filme.length} {filme.length === 1 ? "item" : "items"}, of which {deVazut} unwatched
        </p>
        <div className="header-actions">
          <button type="button" className="random-btn" onClick={() => setRandom(true)}>
            Random pick
          </button>
        </div>
      </header>
      <div className="filmstrip" aria-hidden="true"></div>

      <main className={intro ? "container intro" : "container"}>
        <section className="panel panel-catalog">
          <h2>Catalog</h2>
          <Catalog
            catalog={catalog}
            categorii={CATEGORII}
            formate={FORMATE}
            idsInLista={filme.map((f) => f.id)}
            onAdauga={(titlu) => setFilme((lista) => adaugaInLista(lista, titlu))}
          />
        </section>

        <section className="panel panel-lista">
          <h2>My List</h2>
          <div className="list-toolbar">
            {filme.length > 1 && (
              <label className="sort-label">
                Sort
                <select value={sortare} onChange={(e) => setSortare(e.target.value)}>
                  <option value="adaugate">Order added</option>
                  <option value="nevazute">Unwatched first</option>
                  <option value="vazute">Watched first</option>
                </select>
              </label>
            )}
            {!formular && (
              <button type="button" className="btn" onClick={() => setFormular(true)}>
                + Custom title
              </button>
            )}
          </div>
          {formular && (
            <AddForm
              categorii={CATEGORII}
              formate={FORMATE}
              onAdauga={adaugaTitluManual}
              onInchide={() => setFormular(false)}
            />
          )}
          <FilmList
            filme={sorteaza(filme, sortare)}
            onComuta={(id) => setFilme((lista) => comutaVazut(lista, id))}
            onSterge={(id) => setFilme((lista) => stergeFilm(lista, id))}
            onRating={(id, n) => setFilme((lista) => seteazaRating(lista, id, n))}
          />
        </section>
      </main>

      <footer className="app-footer">Web Technologies Project</footer>

      {random && (
        <RandomPick
          catalog={catalog}
          lista={filme}
          categorii={CATEGORII}
          formate={FORMATE}
          onAdauga={(titlu) => setFilme((lista) => adaugaInLista(lista, titlu))}
          onInchide={() => setRandom(false)}
        />
      )}
    </>
  );
}
