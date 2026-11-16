import { useEffect, useState } from "react";
import Catalog from "./components/Catalog.jsx";
import FilmForm from "./components/FilmForm.jsx";
import FilmList from "./components/FilmList.jsx";
import RandomPick from "./components/RandomPick.jsx";
import Statistici from "./components/Statistici.jsx";
import { createFilm, deleteFilm, fetchFilme, fetchLista, updateFilm } from "./api.js";
import { CATEGORII, FORMATE } from "./data/catalog.js";
import {
  completeazaDinCatalog,
  dinCatalog,
  dinFormular,
  existaTitlu,
  idsDinCatalog,
  inlocuieste,
  ratingNou,
  schimbareEpisoade,
  schimbareVizionat,
  sorteaza,
  stergeFilm,
} from "./logica.js";

// Tema de pornire: cea a sistemului de operare
function temaInitiala() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  // My List vine de la server (resursa /lista); catalogul tot de la server (/filme)
  const [filme, setFilme] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [tema, setTema] = useState(temaInitiala);
  // cât timp rulează intrarea animată, cardurile au întârzieri pe poziție
  const [intro, setIntro] = useState(true);
  const [sortare, setSortare] = useState("adaugate");
  const [random, setRandom] = useState(false);
  const [statsDeschise, setStatsDeschise] = useState(false);
  const [loading, setLoading] = useState(true);
  // eroarea de la încărcare (pagina nu are ce arăta) și eroarea unei acțiuni (lista rămâne)
  const [error, setError] = useState(null);
  const [eroareActiune, setEroareActiune] = useState(null);
  // cereri în curs: id-uri din listă (bifare, rating, ștergere) și id-uri din catalog (adăugare)
  const [idsOcupate, setIdsOcupate] = useState([]);
  const [seAdauga, setSeAdauga] = useState([]);

  // Rulează o singură dată, după prima randare: catalogul și lista, în paralel
  useEffect(() => {
    let ignore = false; // nu se setează state dacă pagina s-a închis între timp

    async function load() {
      try {
        const [dateCatalog, dateLista] = await Promise.all([fetchFilme(), fetchLista()]);
        if (!ignore) {
          setCatalog(dateCatalog);
          setFilme(dateLista);
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const deVazut = filme.filter((f) => !f.vizionat).length;
  // lista cu detaliile din catalog (durată, sezoane), pentru afișare, episoade și statistici
  const listaCompleta = completeazaDinCatalog(filme, catalog);
  const idsInLista = [...idsDinCatalog(filme), ...seAdauga];

  // Comutarea temei: state-ul pentru buton, atributul data-theme pentru CSS
  function comutaTema() {
    const noua = tema === "dark" ? "light" : "dark";
    setTema(noua);
    document.documentElement.dataset.theme = noua;
  }

  // Rulează o cerere marcând cheia ca ocupată; eroarea apare deasupra listei.
  async function cuCerere(setOcupate, cheie, actiune) {
    setOcupate((prev) => [...prev, cheie]);
    try {
      await actiune();
      setEroareActiune(null);
    } catch (err) {
      setEroareActiune(err.message);
    } finally {
      setOcupate((prev) => prev.filter((k) => k !== cheie));
    }
  }

  // Titlu scris în formular. Întâi serverul, apoi state-ul: pe ecran ajunge doar ce
  // s-a salvat. Nu prinde erorile: ajung înapoi în formular, care le afișează.
  async function handleAdd(date) {
    if (existaTitlu(filme, date.titlu, date.format)) {
      throw new Error("This title is already in your list.");
    }
    if (existaTitlu(catalog, date.titlu, date.format)) {
      throw new Error("This title is already in the catalog - add it from there.");
    }
    const creat = await createFilm(dinFormular(date)); // serverul întoarce elementul cu id
    setFilme((prev) => [...prev, creat]);
  }

  // Titlu din catalog (sau din Random pick); butonul e blocat cât timp se trimite.
  function handleAdaugaDinCatalog(titlu) {
    if (idsInLista.includes(titlu.id)) return;
    cuCerere(setSeAdauga, titlu.id, async () => {
      const creat = await createFilm(dinCatalog(titlu));
      setFilme((prev) => [...prev, creat]);
    });
  }

  function handleToggle(id) {
    if (idsOcupate.includes(id)) return; // o cerere pentru element e deja în curs
    const film = listaCompleta.find((f) => f.id === id);
    cuCerere(setIdsOcupate, id, async () => {
      const actualizat = await updateFilm(id, schimbareVizionat(film));
      setFilme((prev) => inlocuieste(prev, actualizat));
    });
  }

  function handleRating(id, n) {
    if (idsOcupate.includes(id)) return; // o cerere pentru element e deja în curs
    const film = filme.find((f) => f.id === id);
    cuCerere(setIdsOcupate, id, async () => {
      const actualizat = await updateFilm(id, { rating: ratingNou(film.rating ?? 0, n) });
      setFilme((prev) => inlocuieste(prev, actualizat));
    });
  }

  // Progresul pe episoade al unui serial; la ultimul episod titlul devine văzut.
  function handleEpisoade(id, nou) {
    if (idsOcupate.includes(id)) return;
    const film = listaCompleta.find((f) => f.id === id);
    cuCerere(setIdsOcupate, id, async () => {
      const actualizat = await updateFilm(id, schimbareEpisoade(film, nou));
      setFilme((prev) => inlocuieste(prev, actualizat));
    });
  }

  function handleDelete(id) {
    if (idsOcupate.includes(id)) return; // o cerere pentru element e deja în curs
    cuCerere(setIdsOcupate, id, async () => {
      await deleteFilm(id);
      setFilme((prev) => stergeFilm(prev, id));
    });
  }

  return (
    <>
      <header className="app-header">
        <button
          type="button"
          className="theme-toggle"
          onClick={comutaTema}
          aria-pressed={tema === "dark"}
          aria-label={tema === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={tema === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span aria-hidden="true">{tema === "dark" ? "🌙" : "☀️"}</span>
        </button>
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
          <button
            type="button"
            className="random-btn stats-btn"
            onClick={() => setStatsDeschise(true)}
            disabled={loading || Boolean(error)}
          >
            Your stats
          </button>
        </div>
      </header>
      <div className="filmstrip" aria-hidden="true"></div>

      <main className={intro ? "container intro" : "container"}>
        {loading && (
          <section className="panel">
            <p className="info" data-testid="loading">
              Loading the list...
            </p>
          </section>
        )}
        {error && (
          <section className="panel">
            <p className="error" data-testid="error">
              Could not load the data: {error}. Is <code>npm run api</code> running?
            </p>
          </section>
        )}
        {!loading && !error && (
          <>
            <section className="panel panel-catalog">
              <h2>Catalog</h2>
              <Catalog
                catalog={catalog}
                categorii={CATEGORII}
                formate={FORMATE}
                idsInLista={idsInLista}
                onAdauga={handleAdaugaDinCatalog}
              />
            </section>

            <section className="panel panel-lista">
              <h2>My List</h2>
              <FilmForm categorii={CATEGORII} formate={FORMATE} onAdd={handleAdd} />
              {eroareActiune && (
                <p className="error" role="alert" data-testid="error">
                  Could not save the change: {eroareActiune}
                </p>
              )}
              {filme.length > 1 && (
                <div className="list-toolbar">
                  <label className="sort-label">
                    Sort
                    <select value={sortare} onChange={(e) => setSortare(e.target.value)}>
                      <option value="adaugate">Order added</option>
                      <option value="nevazute">Unwatched first</option>
                      <option value="vazute">Watched first</option>
                    </select>
                  </label>
                </div>
              )}
              <FilmList
                filme={sorteaza(listaCompleta, sortare)}
                idsOcupate={idsOcupate}
                onComuta={handleToggle}
                onSterge={handleDelete}
                onRating={handleRating}
                onEpisoade={handleEpisoade}
              />
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">Web Technologies Project</footer>

      {statsDeschise && (
        <Statistici
          lista={listaCompleta}
          categorii={CATEGORII}
          onInchide={() => setStatsDeschise(false)}
        />
      )}

      {random && (
        <RandomPick
          catalog={catalog}
          lista={filme}
          idsInLista={idsInLista}
          categorii={CATEGORII}
          formate={FORMATE}
          onAdauga={handleAdaugaDinCatalog}
          onInchide={() => setRandom(false)}
        />
      )}
    </>
  );
}
