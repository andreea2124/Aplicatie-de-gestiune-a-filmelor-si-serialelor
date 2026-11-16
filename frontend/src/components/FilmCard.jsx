// Un singur film din listă, primit prin props, afișat ca un bilet de cinema.
// Titlul e link spre pagina de detaliu (/lista/:id).
// onComuta / onSterge / onRating / onEpisoade sunt opționale: fără ele, cardul doar afișează.
// ocupat = o cerere pentru acest element e în curs (bifa și ștergerea sunt blocate).
// Atributele data-testid sunt reperele pentru verificarea automată (Etapele 7 și 8).
import { useState } from "react";
import { Link } from "react-router-dom";
import { ETICHETE_TIP } from "../constants.js";
import { episoadeVazute, formateazaData, totalEpisoade } from "../logica.js";
import Progres from "./Progres.jsx";
import Stars from "./Stars.jsx";
import styles from "./FilmCard.module.css";

export default function FilmCard({ film, ocupat = false, onComuta, onSterge, onRating, onEpisoade }) {
  const stare = film.vizionat ? "Watched" : "Unwatched";
  // progresul pe episoade stă închis și se deschide cu săgeata, ca detaliile din catalog
  const [deschis, setDeschis] = useState(false);
  const idProgres = `progres-lista-${film.id}`;
  // "Watched on 12 Nov 2026" sau "Added 16 Nov 2026", plus unde se vede
  const data =
    film.vizionat && film.vizionatLa
      ? `Watched on ${formateazaData(film.vizionatLa)}`
      : film.adaugatLa
        ? `Added ${formateazaData(film.adaugatLa)}`
        : "";

  return (
    <li
      className={film.vizionat ? `${styles.itemCard} ${styles.watched}` : styles.itemCard}
      data-testid="item"
      data-id={film.id}
    >
      <div className={styles.ticketMain}>
        <span className="ticket-no">
          No. {String(film.id).padStart(3, "0")}
          {film.categorie && ` · ${film.categorie}`}
        </span>
        <h3>
          <Link to={`/lista/${film.id}`} data-testid="item-link">
            {film.titlu}
          </Link>
        </h3>
        <span className={`badge badge-${film.format}`}>{ETICHETE_TIP[film.format]}</span>
        {film.vizionat && onRating && (
          <Stars
            valoare={film.rating ?? 0}
            titlu={film.titlu}
            onSeteaza={(n) => onRating(film.id, n)}
          />
        )}
        {(data || film.unde) && (
          <span className={styles.when}>
            {data}
            {film.unde && `${data ? " · " : ""}on ${film.unde}`}
            {film.vizionat && film.revizionari > 0 && (
              <span className={styles.rewatch} title="Times rewatched">
                ↻ ×{film.revizionari}
              </span>
            )}
          </span>
        )}
        {film.notita && <span className={styles.note}>“{film.notita}”</span>}
        {film.sezoane && onEpisoade && (
          <>
            <button
              type="button"
              className={styles.expandLink}
              onClick={() => setDeschis((d) => !d)}
              aria-expanded={deschis}
              aria-controls={idProgres}
            >
              Episodes · {episoadeVazute(film)}/{totalEpisoade(film)} <i aria-hidden="true">▼</i>
            </button>
            <div
              id={idProgres}
              className={deschis ? `${styles.collapse} ${styles.open}` : styles.collapse}
              inert={!deschis}
            >
              <div>
                <Progres film={film} ocupat={ocupat} onEpisoade={(n) => onEpisoade(film.id, n)} />
              </div>
            </div>
          </>
        )}
      </div>
      <div className={styles.ticketStub}>
        {onComuta ? (
          // checkbox real (cerut de verificare), stilizat ca indicatorul din talon
          <label className={styles.status} title={film.vizionat ? "Mark as unwatched" : "Mark as watched"}>
            <input
              type="checkbox"
              className={styles.statusCheck}
              checked={Boolean(film.vizionat)}
              disabled={ocupat}
              onChange={() => onComuta(film.id)}
              aria-label={`Watched: ${film.titlu}`}
              data-testid="item-toggle"
            />
            {stare}
          </label>
        ) : (
          <span className={styles.status}>{stare}</span>
        )}
      </div>
      {onSterge && (
        <button
          type="button"
          className={styles.removeBtn}
          onClick={() => onSterge(film.id)}
          disabled={ocupat}
          aria-label={`Remove ${film.titlu} from My List`}
          title="Remove from My List"
          data-testid="item-delete"
        >
          &times;
        </button>
      )}
    </li>
  );
}
