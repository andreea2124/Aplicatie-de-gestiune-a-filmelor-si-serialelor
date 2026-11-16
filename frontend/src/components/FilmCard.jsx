// Un singur film din listă, primit prin props, afișat ca un bilet de cinema.
// onComuta / onSterge / onRating sunt opționale: fără ele, cardul doar afișează.
// ocupat = o cerere pentru acest element e în curs (bifa și ștergerea sunt blocate).
// Atributele data-testid sunt reperele pentru verificarea automată (Etapa 7).
import { useState } from "react";
import { areDetalii } from "../logica.js";
import Detalii from "./Detalii.jsx";
import Stars from "./Stars.jsx";

const ETICHETE_TIP = { movie: "Movie", series: "Series", animation: "Animation" };

export default function FilmCard({ film, ocupat = false, onComuta, onSterge, onRating }) {
  const stare = film.vizionat ? "Watched" : "Unwatched";
  const [deschis, setDeschis] = useState(false);
  const idDetalii = `detalii-lista-${film.id}`;

  return (
    <li
      className={film.vizionat ? "item-card watched" : "item-card"}
      data-testid="item"
      data-id={film.id}
    >
      <div className="ticket-main">
        <span className="ticket-no">
          No. {String(film.id).padStart(3, "0")}
          {film.categorie && ` · ${film.categorie}`}
        </span>
        <h3 data-testid="item-title">{film.titlu}</h3>
        <span className={`badge badge-${film.format}`}>
          {ETICHETE_TIP[film.format]}
        </span>
        {film.vizionat && onRating && (
          <Stars
            valoare={film.rating ?? 0}
            titlu={film.titlu}
            onSeteaza={(n) => onRating(film.id, n)}
          />
        )}
        {areDetalii(film) && (
          <>
            <button
              type="button"
              className="expand-link"
              onClick={() => setDeschis((d) => !d)}
              aria-expanded={deschis}
              aria-controls={idDetalii}
            >
              Details <i aria-hidden="true">▼</i>
            </button>
            <Detalii id={idDetalii} titlu={film} deschis={deschis} />
          </>
        )}
      </div>
      <div className="ticket-stub">
        {onComuta ? (
          // checkbox real (cerut de verificare), stilizat ca indicatorul din talon
          <label className="status" title={film.vizionat ? "Mark as unwatched" : "Mark as watched"}>
            <input
              type="checkbox"
              className="status-check"
              checked={Boolean(film.vizionat)}
              disabled={ocupat}
              onChange={() => onComuta(film.id)}
              aria-label={`Watched: ${film.titlu}`}
              data-testid="item-toggle"
            />
            {stare}
          </label>
        ) : (
          <span className="status">{stare}</span>
        )}
      </div>
      {onSterge && (
        <button
          type="button"
          className="remove-btn"
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
