import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FilmForm from "../components/FilmForm.jsx";
import FilmList from "../components/FilmList.jsx";
import { CATEGORII, FORMATE } from "../constants.js";
import { filtreazaLista, numaraStatus, sorteaza } from "../logica.js";
import { useLista } from "../useLista.js";
import { useTitlu } from "../useTitlu.js";
import styles from "./FilmePage.module.css";

// Intrarea animată a cardurilor rulează o singură dată pe sesiune, nu la fiecare revenire pe pagină.
let introTrecut = false;

const STATUSURI = [
  { id: "toate", eticheta: "All" },
  { id: "nevazute", eticheta: "To watch" },
  { id: "vazute", eticheta: "Watched" },
];

// Pagina principală (/): My List și formularul pentru titlu propriu. Catalogul are pagina lui (/catalog).
// Datele și acțiunile vin din ListaProvider (useLista).
export default function FilmePage() {
  useTitlu("My List");
  const {
    filme,
    catalog,
    listaCompleta,
    deVazut,
    loading,
    error,
    eroareActiune,
    idsOcupate,
    handleAdd,
    handleToggle,
    handleRating,
    handleEpisoade,
    handleDelete,
    statusLista: status,
    setStatusLista: setStatus,
  } = useLista();
  const navigate = useNavigate();

  // cât timp rulează intrarea animată, cardurile au întârzieri pe poziție
  const [intro, setIntro] = useState(!introTrecut);
  const [sortare, setSortare] = useState("adaugate");
  const [text, setText] = useState("");

  useEffect(() => {
    if (introTrecut) return;
    const timer = setTimeout(() => {
      introTrecut = true;
      setIntro(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="panel" data-testid="loading" role="status">
        <span className="sr-only">Loading the list...</span>
        <div className={styles.skeleton}></div>
        <div className={styles.skeleton}></div>
        <div className={`${styles.skeleton} ${styles.skeletonShort}`}></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <p className="error" data-testid="error">
          Could not load the data: {error}. Is the backend running (<code>npm run dev</code> in <code>backend/</code>)?
        </p>
      </section>
    );
  }

  const numere = numaraStatus(filme);
  const vizibile = sorteaza(filtreazaLista(listaCompleta, text, status), sortare);

  return (
    <>
      <FilmForm categorii={CATEGORII} formate={FORMATE} catalog={catalog} onAdd={handleAdd} />

      <section className="panel" id="my-list" aria-labelledby="titlu-lista">
        <div className="panel-head">
          <h2 id="titlu-lista">My List</h2>
          <span className="panel-sub">
            {filme.length} {filme.length === 1 ? "item" : "items"} · {deVazut} unwatched
          </span>
          <div className="panel-tools">
            {filme.length > 1 && (
              <label className={styles.sortLabel}>
                <span className="sr-only">Sort</span>
                <select value={sortare} onChange={(e) => setSortare(e.target.value)}>
                  <option value="adaugate">Order added</option>
                  <option value="nevazute">Unwatched first</option>
                  <option value="vazute">Watched first</option>
                </select>
              </label>
            )}
            <Link to="/catalog" className="btn">
              Browse the catalog &rarr;
            </Link>
          </div>
        </div>
        {filme.length > 0 && (
          <div className={styles.tools}>
            <label className="search-field">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Search My List..."
                aria-label="Search My List"
              />
            </label>
            <div className="segmented" role="group" aria-label="Filter by status">
              {STATUSURI.map((s) => (
                <button key={s.id} type="button" aria-pressed={status === s.id} onClick={() => setStatus(s.id)}>
                  {s.eticheta}
                  <span className="count">{numere[s.id]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {eroareActiune && (
          <p className={`error ${styles.eroare}`} role="alert" data-testid="error">
            Could not save the change: {eroareActiune}
          </p>
        )}
        <FilmList
          filme={vizibile}
          listaGoala={filme.length === 0}
          idsOcupate={idsOcupate}
          intro={intro}
          onComuta={handleToggle}
          onSterge={handleDelete}
          onRating={handleRating}
          onEpisoade={handleEpisoade}
          onCatalog={() => navigate("/catalog", { state: { cauta: true } })}
        />
      </section>
    </>
  );
}
