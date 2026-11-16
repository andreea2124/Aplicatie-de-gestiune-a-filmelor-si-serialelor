import FilmCard from "./FilmCard.jsx";

// idsOcupate = id-urile elementelor pentru care o cerere e în curs
export default function FilmList({ filme, idsOcupate = [], onComuta, onSterge, onRating }) {
  if (filme.length === 0) {
    return (
      <p className="empty" data-testid="empty">
        No items found.
      </p>
    );
  }

  return (
    <ul className="item-list">
      {filme.map((film) => (
        <FilmCard
          key={film.id}
          film={film}
          ocupat={idsOcupate.includes(film.id)}
          onComuta={onComuta}
          onSterge={onSterge}
          onRating={onRating}
        />
      ))}
    </ul>
  );
}
