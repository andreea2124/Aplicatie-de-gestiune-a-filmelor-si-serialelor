import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { filtreazaCatalog } from "../logica.js";
import AfisCatalog from "./AfisCatalog.jsx";
import CatalogItem from "./CatalogItem.jsx";
import styles from "./Catalog.module.css";

// Catalogul: căutare, filtru pe categorie, câte un buton pentru fiecare format,
// iar titlurile din formatul ales sunt grupate pe categorii, ca afișe sau ca listă.
// idsInLista = id-urile deja adăugate în My List.
export default function Catalog({ catalog, categorii, formate, idsInLista, onAdauga }) {
  const [text, setText] = useState("");
  const [categorie, setCategorie] = useState("");
  const [format, setFormat] = useState(formate[0].id);
  const [vizualizare, setVizualizare] = useState("afise"); // "afise" sau "lista"
  const cautare = useRef(null);
  const { state } = useLocation();

  // venit din My List goală („Browse the catalog”): cursorul e direct în căutare
  useEffect(() => {
    if (state?.cauta) cautare.current?.focus();
  }, [state]);

  // Tasta „/” duce direct în căutare (dacă nu se scrie deja într-un câmp)
  useEffect(() => {
    function laTasta(e) {
      const tag = document.activeElement?.tagName;
      if (e.key !== "/" || e.ctrlKey || e.metaKey || ["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;
      e.preventDefault();
      cautare.current?.focus();
    }
    document.addEventListener("keydown", laTasta);
    return () => document.removeEventListener("keydown", laTasta);
  }, []);

  const gasite = filtreazaCatalog(catalog, text, categorie);
  const dinFormat = gasite.filter((t) => t.format === format);

  return (
    <div>
      <div className="panel-head">
        <h2>Catalog</h2>
        <span className="panel-sub">
          {dinFormat.length} {dinFormat.length === 1 ? "title" : "titles"}
        </span>
        <div className="panel-tools">
          <div className="segmented" role="group" aria-label="View">
            <button
              type="button"
              aria-pressed={vizualizare === "afise"}
              onClick={() => setVizualizare("afise")}
              title="Poster view"
              aria-label="Poster view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="9" rx="1" />
                <rect x="3" y="15" width="7" height="6" rx="1" />
                <rect x="14" y="15" width="7" height="6" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              aria-pressed={vizualizare === "lista"}
              onClick={() => setVizualizare("lista")}
              title="List view"
              aria-label="List view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* căutarea și filtrele rămân lipite sus cât se derulează afișele */}
      <div className={styles.filters}>
        <div className={styles.toolbar}>
          <label className="search-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref={cautare}
              id="catalog-search"
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Search ${catalog.length} titles...`}
              aria-label="Search the catalog"
              aria-keyshortcuts="/"
            />
            <kbd aria-hidden="true">/</kbd>
          </label>
          <div className="segmented" role="group" aria-label="Format">
            {formate.map((f) => (
              <button key={f.id} type="button" aria-pressed={format === f.id} onClick={() => setFormat(f.id)}>
                {f.eticheta}
                <span className="count">{gasite.filter((t) => t.format === f.id).length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.chips} role="group" aria-label="Filter by category">
          {["", ...categorii].map((c) => (
            <button
              key={c || "all"}
              type="button"
              className={styles.chip}
              aria-pressed={categorie === c}
              onClick={() => setCategorie(c)}
            >
              {c || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.catalog}>
        {dinFormat.length === 0 && (
          <div className="empty empty-small">
            <p className={styles.emptyText}>
              No titles match your search. Not in the catalog? <Link to="/lista">Add it as your own title</Link>.
            </p>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setText("");
                setCategorie("");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
        {categorii.map((cat) => {
          const titluri = dinFormat.filter((t) => t.categorie === cat);
          if (titluri.length === 0) return null;
          return (
            <section key={cat} className={styles.catalogGroup}>
              <h3>
                {cat} <small>{titluri.length}</small>
              </h3>
              {vizualizare === "afise" ? (
                <ul className={styles.posters}>
                  {titluri.map((titlu) => (
                    <AfisCatalog
                      key={titlu.id}
                      titlu={titlu}
                      inLista={idsInLista.includes(titlu.id)}
                      onAdauga={onAdauga}
                    />
                  ))}
                </ul>
              ) : (
                <ul className={styles.catalogList}>
                  {titluri.map((titlu) => (
                    <CatalogItem
                      key={titlu.id}
                      titlu={titlu}
                      inLista={idsInLista.includes(titlu.id)}
                      onAdauga={onAdauga}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
