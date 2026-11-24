// Un titlu din catalog, cu buton de adăugare în My List și detalii care se deschid.
import { useState } from "react";
import { Link } from "react-router-dom";
import { ETICHETE_TIP } from "../constants.js";
import { areDetalii } from "../logica.js";
import { zboara } from "../zbor.js";
import Detalii from "./Detalii.jsx";
import styles from "./CatalogItem.module.css";

export default function CatalogItem({ titlu, inLista, onAdauga }) {
  const [deschis, setDeschis] = useState(false);
  const idDetalii = `detalii-catalog-${titlu.id}`;

  return (
    <li className={styles.catalogItem}>
      <Link to={`/catalog/${titlu.id}`} className={styles.catalogTitle}>
        {titlu.titlu}
      </Link>
      <span className={`badge badge-${titlu.format}`}>
        {ETICHETE_TIP[titlu.format]}
      </span>
      <button
        type="button"
        className={styles.addBtn}
        onClick={(e) => {
          zboara(e.currentTarget, titlu.titlu);
          onAdauga(titlu);
        }}
        disabled={inLista}
        aria-label={inLista ? `${titlu.titlu} is in My List` : `Add ${titlu.titlu} to My List`}
      >
        {inLista ? "✓ Added" : "+ Add"}
      </button>
      {areDetalii(titlu) && (
        <button
          type="button"
          className={styles.expandBtn}
          onClick={() => setDeschis((d) => !d)}
          aria-expanded={deschis}
          aria-controls={idDetalii}
          aria-label={`${deschis ? "Hide" : "Show"} details for ${titlu.titlu}`}
        >
          ▼
        </button>
      )}
      {areDetalii(titlu) && <Detalii id={idDetalii} titlu={titlu} deschis={deschis} />}
    </li>
  );
}
