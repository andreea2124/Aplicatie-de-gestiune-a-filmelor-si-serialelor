import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchElement, fetchTitluCatalog, updateFilm } from "../api.js";
import Afis from "../components/Afis.jsx";
import Progres from "../components/Progres.jsx";
import Stars from "../components/Stars.jsx";
import { ETICHETE_TIP } from "../constants.js";
import {
  formateazaData,
  formateazaDurata,
  ratingNou,
  schimbareEpisoade,
  schimbareVizionat,
  totalEpisoade,
} from "../logica.js";
import { useLista } from "../useLista.js";
import { useTitlu } from "../useTitlu.js";
import styles from "./FilmDetaliuPage.module.css";

// Pagina unui singur element din My List: /lista/:id. Cere de la server exact acel element
// și, dacă vine din catalog, detaliile lui (an, durată, descriere, IMDb).
// Sus: afișul și informațiile; dedesubt: acțiunile (văzut, rating), episoadele și notițele.
export default function FilmDetaliuPage() {
  const { id } = useParams(); // text din URL, de exemplu "3"
  const navigate = useNavigate();
  const { sincronizeaza, stergeElement } = useLista();
  const [film, setFilm] = useState(null);
  const [detalii, setDetalii] = useState(null); // datele din catalog, dacă există
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ocupat, setOcupat] = useState(false);
  const [eroareActiune, setEroareActiune] = useState(null);
  // câmpurile de text se salvează când se iese din ele
  const [notita, setNotita] = useState("");
  const [unde, setUnde] = useState("");

  useTitlu(film?.titlu);

  // Se reîncarcă dacă se schimbă id-ul din adresă
  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const element = await fetchElement(id);
        // detaliile din catalog nu sunt esențiale: dacă lipsesc, pagina arată câmpurile de bază
        const dinCatalog =
          element.catalogId != null ? await fetchTitluCatalog(element.catalogId).catch(() => null) : null;
        if (!ignore) {
          setFilm(element);
          setDetalii(dinCatalog);
          setNotita(element.notita ?? "");
          setUnde(element.unde ?? "");
          setError(null); // o eroare de la un id anterior nu mai este valabilă
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

  // Aceeași regulă ca în listă: întâi serverul, apoi state-ul, cu obiectul întors de server.
  async function modifica(schimbari) {
    if (ocupat) return;
    setOcupat(true);
    try {
      const actualizat = await updateFilm(film.id, schimbari);
      setFilm(actualizat);
      sincronizeaza(actualizat); // și lista din restul aplicației rămâne la zi
      setEroareActiune(null);
    } catch (err) {
      setEroareActiune(err.message);
    } finally {
      setOcupat(false);
    }
  }

  // Salvează notița / locul doar dacă s-au schimbat
  function salveazaText(camp, valoare) {
    const curat = valoare.trim();
    if (curat !== (film[camp] ?? "")) modifica({ [camp]: curat });
  }

  async function sterge() {
    if (ocupat) return;
    setOcupat(true);
    try {
      await stergeElement(film);
      navigate("/");
    } catch (err) {
      setEroareActiune(err.message);
      setOcupat(false);
    }
  }

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
        <Link to="/">Back to My List</Link>
      </section>
    );
  }

  const complet = { ...detalii, ...film }; // câmpurile din listă au prioritate
  const { sezoane, durata, durataEp, an, descriere, imdb } = complet;

  return (
    <section className={`panel ${styles.detail}`} data-testid="detail">
      <Link to="/" className={styles.back}>
        &larr; Back to My List
      </Link>

      <div className={styles.hero}>
        <div className={styles.poster}>
          <Afis titlu={complet} mare />
        </div>

        <div className={styles.info}>
          <p className={styles.kicker}>
            <span className={`badge badge-${complet.format}`}>{ETICHETE_TIP[complet.format]}</span>
            {complet.categorie}
            {an && ` · ${an}`}
          </p>
          <h2 className={complet.vizionat ? `${styles.title} ${styles.done}` : styles.title} data-testid="detail-title">
            {complet.titlu}
          </h2>

          {(sezoane || durata || imdb) && (
            <ul className={styles.facts}>
              {sezoane && (
                <>
                  <li>
                    <b>{sezoane.length}</b>
                    <span>{sezoane.length === 1 ? "Season" : "Seasons"}</span>
                  </li>
                  <li>
                    <b>{totalEpisoade(complet)}</b>
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

          {descriere ? (
            <p className={styles.desc}>{descriere}</p>
          ) : (
            complet.manual && <p className="info">Your own title: there are no extra details for it.</p>
          )}

          <div className={styles.actions}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={Boolean(complet.vizionat)}
                disabled={ocupat}
                onChange={() => modifica(schimbareVizionat(complet))}
                data-testid="detail-toggle"
              />
              {complet.vizionat ? "Watched" : "Mark as watched"}
            </label>
            {complet.vizionat ? (
              <>
                <span className={styles.actionGroup}>
                  <span className={styles.actionLabel}>Your rating</span>
                  <Stars
                    valoare={complet.rating ?? 0}
                    titlu={complet.titlu}
                    onSeteaza={(n) => modifica({ rating: ratingNou(complet.rating ?? 0, n) })}
                  />
                </span>
                <span className={styles.actionGroup}>
                  <span className={styles.actionLabel}>Rewatched</span>
                  <b>{complet.revizionari ?? 0}&times;</b>
                  <button
                    type="button"
                    className="btn"
                    disabled={ocupat}
                    onClick={() => modifica({ revizionari: (complet.revizionari ?? 0) + 1 })}
                  >
                    +1
                  </button>
                </span>
              </>
            ) : (
              <span className={styles.actionLabel}>Rate it once you have watched it</span>
            )}
          </div>

          {eroareActiune && (
            <p className="error" role="alert">
              Could not save the change: {eroareActiune}
            </p>
          )}

          {sezoane && (
            <>
              <h3 className={styles.sectionTitle}>Episodes</h3>
              <Progres film={complet} ocupat={ocupat} onEpisoade={(n) => modifica(schimbareEpisoade(complet, n))} />
            </>
          )}

          <h3 className={styles.sectionTitle}>Your notes</h3>
          <div className={styles.personal}>
            <label>
              <span>Where to watch</span>
              <input
                className={styles.input}
                value={unde}
                maxLength={60}
                placeholder="E.g. Netflix, cinema, a friend's DVD"
                onChange={(e) => setUnde(e.target.value)}
                onBlur={(e) => salveazaText("unde", e.target.value)}
              />
            </label>
            <label>
              <span>Your note</span>
              <input
                className={styles.input}
                value={notita}
                maxLength={200}
                placeholder="E.g. recommended by Ana"
                onChange={(e) => setNotita(e.target.value)}
                onBlur={(e) => salveazaText("notita", e.target.value)}
              />
            </label>
          </div>

          <div className={styles.footer}>
            <span className={styles.dates}>
              {complet.adaugatLa && `Added on ${formateazaData(complet.adaugatLa)}`}
              {complet.adaugatLa && complet.vizionat && complet.vizionatLa && " · "}
              {complet.vizionat && complet.vizionatLa && `Watched on ${formateazaData(complet.vizionatLa)}`}
            </span>
            <button type="button" className={styles.remove} onClick={sterge} disabled={ocupat}>
              Remove from My List
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
