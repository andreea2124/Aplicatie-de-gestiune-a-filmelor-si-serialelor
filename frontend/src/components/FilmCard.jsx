// Un singur film din listă, primit prin props.
// onComuta / onSterge sunt opționale: fără ele, cardul doar afișează.
const ETICHETE_TIP = { movie: "Movie", series: "Series", animation: "Animation" };

export default function FilmCard({ film, onComuta, onSterge }) {
  const stare = film.vizionat ? "Done" : "Active";

  return (
    <li className={film.vizionat ? "item-card done" : "item-card"}>
      <div>
        <h3>{film.titlu}</h3>
        <span className={`badge badge-${film.format}`}>
          {ETICHETE_TIP[film.format]}
        </span>
      </div>
      {onComuta ? (
        <button
          type="button"
          className="status"
          onClick={() => onComuta(film.id)}
          title={film.vizionat ? "Mark as active" : "Mark as done"}
        >
          {stare}
        </button>
      ) : (
        <span className="status">{stare}</span>
      )}
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
