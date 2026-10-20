import FilmCard from "./FilmCard.jsx";

export default function FilmList({ filme, onComuta, onSterge }) {
  if (filme.length === 0) {
    return <p className="empty">No items found.</p>;
  }

  return (
    <ul className="item-list">
      {filme.map((film) => (
        <FilmCard
          key={film.id}
          film={film}
          onComuta={onComuta}
          onSterge={onSterge}
        />
      ))}
    </ul>
  );
}
