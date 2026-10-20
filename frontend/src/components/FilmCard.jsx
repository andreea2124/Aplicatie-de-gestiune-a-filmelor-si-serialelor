// Un singur film din listă, primit prin props.
const ETICHETE_TIP = { movie: "Movie", series: "Series", animation: "Animation" };

export default function FilmCard({ film }) {
  return (
    <li className={film.vizionat ? "item-card done" : "item-card"}>
      <div>
        <h3>{film.titlu}</h3>
        <span className={`badge badge-${film.format}`}>
          {ETICHETE_TIP[film.format]}
        </span>
      </div>
      <span className="status">{film.vizionat ? "Done" : "Active"}</span>
    </li>
  );
}
