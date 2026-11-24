// Un titlu din catalog, în vizualizarea cu afișe: la hover (sau focus) apar descrierea
// și butonul de adăugare; titlurile deja adăugate au o panglică „In list”.
// Afișul și titlul sunt linkuri spre pagina titlului (/catalog/:id).
import { Link } from "react-router-dom";
import { zboara } from "../zbor.js";
import Afis from "./Afis.jsx";
import styles from "./AfisCatalog.module.css";

export default function AfisCatalog({ titlu, inLista, onAdauga }) {
  function adauga(e) {
    zboara(e.currentTarget, titlu.titlu);
    onAdauga(titlu);
  }

  return (
    <li className={styles.card}>
      {/* pe ecrane tactile stratul de hover nu acoperă afișul, deci afișul e linkul */}
      <Link to={`/catalog/${titlu.id}`} className={styles.posterLink} tabIndex={-1} aria-hidden="true">
        <Afis titlu={titlu} />
      </Link>
      {inLista && <span className={styles.ribbon}>In list</span>}
      <div className={styles.hover}>
        <Link to={`/catalog/${titlu.id}`} className={styles.info}>
          <strong>{titlu.titlu}</strong>
          {titlu.descriere && <p>{titlu.descriere}</p>}
          <span className={styles.more}>View details &rarr;</span>
        </Link>
        <button
          type="button"
          className={styles.add}
          onClick={adauga}
          disabled={inLista}
          aria-label={inLista ? `${titlu.titlu} is in My List` : `Add ${titlu.titlu} to My List`}
        >
          {inLista ? "✓ In My List" : "+ Add to My List"}
        </button>
      </div>
    </li>
  );
}
