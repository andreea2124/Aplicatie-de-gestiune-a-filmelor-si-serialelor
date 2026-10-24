// Un singur film din listă, primit prin props, afișat ca un bilet de cinema.
// onComuta / onSterge / onRating sunt opționale: fără ele, cardul doar afișează.
import Stars from "./Stars.jsx";

const ETICHETE_TIP = { movie: "Movie", series: "Series", animation: "Animation" };

export default function FilmCard({ film, onComuta, onSterge, onRating }) {
  const stare = film.vizionat ? "Watched" : "Unwatched";

  return (
    <li className={film.vizionat ? "item-card watched" : "item-card"}>
      <div className="ticket-main">
        <span className="ticket-no">
          No. {String(film.id).padStart(3, "0")}
          {film.categorie && ` · ${film.categorie}`}
        </span>
        <h3>{film.titlu}</h3>
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
      </div>
      <div className="ticket-stub">
        {onComuta ? (
          <button
            type="button"
            className="status"
            onClick={() => onComuta(film.id)}
            title={film.vizionat ? "Mark as unwatched" : "Mark as watched"}
          >
            {stare}
          </button>
        ) : (
          <span className="status">{stare}</span>
        )}
      </div>
      {onSterge && (
        <button
          type="button"
          className="remove-btn"
          onClick={() => onSterge(film.id)}
          aria-label={`Remove ${film.titlu} from My List`}
          title="Remove from My List"
        >
          &times;
        </button>
      )}
    </li>
  );
}
