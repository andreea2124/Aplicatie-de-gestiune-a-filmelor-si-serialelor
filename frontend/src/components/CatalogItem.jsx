// Un titlu din catalog, cu buton de adăugare în My List.
const ETICHETE_TIP = { movie: "Movie", series: "Series", animation: "Animation" };

export default function CatalogItem({ titlu, inLista, onAdauga }) {
  return (
    <li className="catalog-item">
      <span className="catalog-title">{titlu.titlu}</span>
      <span className={`badge badge-${titlu.format}`}>
        {ETICHETE_TIP[titlu.format]}
      </span>
      <button
        type="button"
        className="add-btn"
        onClick={() => onAdauga(titlu)}
        disabled={inLista}
        aria-label={inLista ? `${titlu.titlu} is in My List` : `Add ${titlu.titlu} to My List`}
      >
        {inLista ? "✓ Added" : "+ Add"}
      </button>
    </li>
  );
}
