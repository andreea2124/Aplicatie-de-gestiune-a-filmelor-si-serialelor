import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchElement, fetchTitluCatalog, updateFilm } from "../api.js";
import DetaliiCorp from "../components/DetaliiCorp.jsx";
import Stars from "../components/Stars.jsx";
import { ETICHETE_TIP } from "../constants.js";
import { areDetalii, formateazaData, ratingNou, schimbareVizionat } from "../logica.js";
import { useLista } from "../useLista.js";
import { useTitlu } from "../useTitlu.js";
import styles from "./FilmDetaliuPage.module.css";

// Pagina unui singur element din My List: /lista/:id. Cere de la server exact acel element
// și, dacă vine din catalog, detaliile lui (an, durată, descriere, IMDb).
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
  const stare = complet.vizionat ? "Watched" : "Unwatched";

  return (
    <section className={`panel ${styles.detail}`} data-testid="detail">
      <Link to="/" className={styles.back}>
        &larr; Back to My List
      </Link>
      <h2 className={complet.vizionat ? styles.done : undefined} data-testid="detail-title">
        {complet.titlu}
      </h2>

      <dl className={styles.fields}>
        <dt>Format</dt>
        <dd>
          <span className={`badge badge-${complet.format}`}>{ETICHETE_TIP[complet.format]}</span>
        </dd>
        <dt>Category</dt>
        <dd>{complet.categorie}</dd>
        <dt>Status</dt>
        <dd>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={Boolean(complet.vizionat)}
              disabled={ocupat}
              onChange={() => modifica(schimbareVizionat(complet))}
              data-testid="detail-toggle"
            />
            {stare}
          </label>
        </dd>
        {complet.vizionat && (
          <>
            <dt>Rating</dt>
            <dd>
              <Stars
                valoare={complet.rating ?? 0}
                titlu={complet.titlu}
                onSeteaza={(n) => modifica({ rating: ratingNou(complet.rating ?? 0, n) })}
              />
            </dd>
            {complet.vizionatLa && (
              <>
                <dt>Watched on</dt>
                <dd>{formateazaData(complet.vizionatLa)}</dd>
              </>
            )}
            <dt>Rewatched</dt>
            <dd className={styles.inline}>
              <span>{complet.revizionari ?? 0}&times;</span>
              <button
                type="button"
                className="btn"
                disabled={ocupat}
                onClick={() => modifica({ revizionari: (complet.revizionari ?? 0) + 1 })}
              >
                +1
              </button>
            </dd>
          </>
        )}
        {complet.adaugatLa && (
          <>
            <dt>Added on</dt>
            <dd>{formateazaData(complet.adaugatLa)}</dd>
          </>
        )}
        <dt>
          <label htmlFor="detail-unde">Where to watch</label>
        </dt>
        <dd>
          <input
            id="detail-unde"
            className={styles.input}
            value={unde}
            maxLength={60}
            placeholder="E.g. Netflix, cinema, a friend's DVD"
            onChange={(e) => setUnde(e.target.value)}
            onBlur={(e) => salveazaText("unde", e.target.value)}
          />
        </dd>
        <dt>
          <label htmlFor="detail-notita">Your note</label>
        </dt>
        <dd>
          <input
            id="detail-notita"
            className={styles.input}
            value={notita}
            maxLength={200}
            placeholder="E.g. recommended by Ana"
            onChange={(e) => setNotita(e.target.value)}
            onBlur={(e) => salveazaText("notita", e.target.value)}
          />
        </dd>
      </dl>

      {eroareActiune && (
        <p className="error" role="alert">
          Could not save the change: {eroareActiune}
        </p>
      )}

      {areDetalii(complet) ? (
        <div className={styles.more}>
          <DetaliiCorp titlu={complet} />
        </div>
      ) : (
        <p className="info">No extra details for this title.</p>
      )}

      <div className={styles.danger}>
        <button type="button" className={styles.remove} onClick={sterge} disabled={ocupat}>
          Remove from My List
        </button>
      </div>
    </section>
  );
}
