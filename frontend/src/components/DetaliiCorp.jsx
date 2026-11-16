import { formateazaDurata } from "../logica.js";
import styles from "./DetaliiCorp.module.css";

// Conținutul detaliilor unui titlu: an, categorie, durată sau sezoane/episoade, descriere, IMDb.
// Folosit în catalog (în panoul care se deschide) și în pagina de detaliu.
export default function DetaliiCorp({ titlu }) {
  const { an, categorie, durata, durataEp, sezoane, descriere, imdb } = titlu;
  const episoade = sezoane ? sezoane.reduce((a, b) => a + b, 0) : 0;

  return (
    <div className={styles.detailsBody}>
      <div className={styles.facts}>
        {an && <span className={styles.fact}>{an}</span>}
        {categorie && <span className={styles.fact}>{categorie}</span>}
        {durata && <span className={styles.fact}>{formateazaDurata(durata)}</span>}
        {sezoane && (
          <span className={styles.fact}>
            {sezoane.length} {sezoane.length === 1 ? "season" : "seasons"}
          </span>
        )}
        {sezoane && <span className={styles.fact}>{episoade} episodes</span>}
        {sezoane && durataEp && <span className={styles.fact}>~{durataEp} min/ep</span>}
      </div>
      {descriere && <p className={styles.overview}>{descriere}</p>}
      {sezoane && (
        <ul className={styles.seasonList} aria-label="Episodes per season">
          {sezoane.map((n, i) => (
            <li key={i}>
              <span>Season {i + 1}</span>
              <b>{n} ep</b>
            </li>
          ))}
        </ul>
      )}
      {imdb && (
        <p className={styles.source}>
          <a href={`https://www.imdb.com/title/${imdb}/`} target="_blank" rel="noopener noreferrer">
            View on IMDb
          </a>
        </p>
      )}
    </div>
  );
}
