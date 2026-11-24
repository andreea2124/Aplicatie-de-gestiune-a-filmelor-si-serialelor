import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchTitluCatalog } from "../api.js";
import Afis from "../components/Afis.jsx";
import { ETICHETE_TIP, FORMATE } from "../constants.js";
import { formateazaDurata, totalEpisoade } from "../logica.js";
import { useLista } from "../useLista.js";
import { useTitlu } from "../useTitlu.js";
// aceeași așezare ca pagina de detaliu din My List (afiș, fișă tehnică), plus câteva stiluri proprii
import detaliu from "./FilmDetaliuPage.module.css";
import styles from "./CatalogDetaliuPage.module.css";

// Pagina unui titlu din catalog: /catalog/:id. Cere titlul de la server (GET /filme/:id),
// ca pagina să meargă și la reîncărcare; din context află doar dacă e deja în My List.
export default function CatalogDetaliuPage() {
  const { id } = useParams();
  const { filme, catalog, idsInLista, handleAdaugaDinCatalog } = useLista();
  const [titlu, setTitlu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useTitlu(titlu?.titlu);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const t = await fetchTitluCatalog(id);
        if (!ignore) {
          setTitlu(t);
          setError(null);
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
  }, [id]);

  if (loading) {
    return (
      <p className="info" data-testid="loading">
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <p className="error" data-testid="error">
          This title could not be loaded: {error}
        </p>
        <Link to="/catalog">Back to the catalog</Link>
      </section>
    );
  }

  const { sezoane, durata, durataEp, an, descriere, imdb } = titlu;
  const inLista = idsInLista.includes(titlu.id);
  // elementul din My List (dacă există), pentru linkul spre pagina lui
  const dinLista = filme.find((f) => f.catalogId === titlu.id);
  // alte titluri cu același format și aceeași categorie
  const asemanatoare = catalog
    .filter((t) => t.id !== titlu.id && t.format === titlu.format && t.categorie === titlu.categorie)
    .slice(0, 6);

  return (
    <section className={`panel ${detaliu.detail}`} data-testid="detail">
      <Link to="/catalog" className={detaliu.back}>
        &larr; Back to the catalog
      </Link>

      <div className={detaliu.hero}>
        <div className={detaliu.poster}>
          <Afis titlu={titlu} mare />
        </div>

        <div>
          <p className={detaliu.kicker}>
            <span className={`badge badge-${titlu.format}`}>{ETICHETE_TIP[titlu.format]}</span>
            {titlu.categorie}
            {an && ` · ${an}`}
          </p>
          <h2 className={detaliu.title} data-testid="detail-title">
            {titlu.titlu}
          </h2>

          {(sezoane || durata || imdb) && (
            <ul className={detaliu.facts}>
              {sezoane && (
                <>
                  <li>
                    <b>{sezoane.length}</b>
                    <span>{sezoane.length === 1 ? "Season" : "Seasons"}</span>
                  </li>
                  <li>
                    <b>{totalEpisoade(titlu)}</b>
                    <span>Episodes</span>
                  </li>
                  {durataEp && (
                    <li>
                      <b>{durataEp} min</b>
                      <span>Per episode</span>
                    </li>
                  )}
                </>
              )}
              {durata && (
                <li>
                  <b>{formateazaDurata(durata)}</b>
                  <span>Runtime</span>
                </li>
              )}
              {imdb && (
                <li>
                  <b>
                    <a href={`https://www.imdb.com/title/${imdb}/`} target="_blank" rel="noopener noreferrer">
                      IMDb &#8599;
                    </a>
                  </b>
                  <span>More info</span>
                </li>
              )}
            </ul>
          )}

          {descriere && <p className={detaliu.desc}>{descriere}</p>}

          <div className={detaliu.actions}>
            {inLista ? (
              <>
                <span className={styles.inList}>✓ In My List</span>
                {dinLista && (
                  <Link to={`/lista/${dinLista.id}`} className="btn">
                    Open in My List &rarr;
                  </Link>
                )}
              </>
            ) : (
              <>
                <button type="button" className={styles.addBtn} onClick={() => handleAdaugaDinCatalog(titlu)}>
                  + Add to My List
                </button>
                <span className={detaliu.actionLabel}>Then mark it as watched and rate it</span>
              </>
            )}
          </div>

          {sezoane && (
            <>
              <h3 className={detaliu.sectionTitle}>Seasons</h3>
              <ul className={styles.seasons}>
                {sezoane.map((n, i) => (
                  <li key={i}>
                    <span>Season {i + 1}</span>
                    <b>{n} ep</b>
                  </li>
                ))}
              </ul>
            </>
          )}

          {asemanatoare.length > 0 && (
            <>
              <h3 className={detaliu.sectionTitle}>
                More {titlu.categorie} {FORMATE.find((f) => f.id === titlu.format)?.eticheta.toLowerCase()}
              </h3>
              <ul className={styles.similar}>
                {asemanatoare.map((t) => (
                  <li key={t.id}>
                    <Link to={`/catalog/${t.id}`} aria-label={t.titlu}>
                      <Afis titlu={t} />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
