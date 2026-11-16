import { useEffect, useState } from "react";
import Catalog from "../components/Catalog.jsx";
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
  { id: "nevazute", eticheta: "Unwatched" },
  { id: "vazute", eticheta: "Watched" },
];

// Pagina principală: formularul pentru titlu propriu, Catalog și My List.
// Datele și acțiunile vin din ListaProvider (useLista).
export default function FilmePage() {
  useTitlu("My List");
  const {
    filme,
    catalog,
    listaCompleta,
    idsInLista,
    deVazut,
    loading,
    error,
    eroareActiune,
    idsOcupate,
    handleAdd,
    handleAdaugaDinCatalog,
    handleToggle,
    handleRating,
    handleEpisoade,
    handleDelete,
  } = useLista();

  // cât timp rulează intrarea animată, cardurile au întârzieri pe poziție
  const [intro, setIntro] = useState(!introTrecut);
  const [sortare, setSortare] = useState("adaugate");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("toate");

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
          Could not load the data: {error}. Is <code>npm run api</code> running?
        </p>
      </section>
    );
  }

  const numere = numaraStatus(filme);
  const vizibile = sorteaza(filtreazaLista(listaCompleta, text, status), sortare);

  return (
    <>
      <FilmForm categorii={CATEGORII} formate={FORMATE} onAdd={handleAdd} />

      <div className={styles.grid}>
        <section className="panel">
          <h2>Catalog</h2>
          <Catalog
            catalog={catalog}
            categorii={CATEGORII}
            formate={FORMATE}
            idsInLista={idsInLista}
            onAdauga={handleAdaugaDinCatalog}
          />
        </section>

        <section className={`panel ${styles.lista}`}>
          <h2>My List</h2>
          <div className={styles.listHead}>
            <span>
              {filme.length} {filme.length === 1 ? "item" : "items"} · {deVazut} unwatched
            </span>
            {filme.length > 1 && (
              <label className={styles.sortLabel}>
                Sort
                <select value={sortare} onChange={(e) => setSortare(e.target.value)}>
                  <option value="adaugate">Order added</option>
                  <option value="nevazute">Unwatched first</option>
                  <option value="vazute">Watched first</option>
                </select>
              </label>
            )}
          </div>

          {filme.length > 0 && (
            <>
              <input
                type="search"
                className={styles.search}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Search My List..."
                aria-label="Search My List"
              />
              <div className={styles.chips} role="group" aria-label="Filter by status">
                {STATUSURI.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={styles.chip}
                    aria-pressed={status === s.id}
                    onClick={() => setStatus(s.id)}
                  >
                    {s.eticheta} {numere[s.id]}
                  </button>
                ))}
              </div>
            </>
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
            onCatalog={() => document.getElementById("catalog-search")?.focus()}
          />
        </section>
      </div>
    </>
  );
}
