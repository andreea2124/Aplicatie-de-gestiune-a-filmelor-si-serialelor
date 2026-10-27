import { formateazaDurata } from "../logica.js";

// Panoul de detalii al unui titlu: an, categorie, durată sau sezoane/episoade, descriere.
// Rămâne în pagină și se deschide cu animație; închis, e scos din ordinea de tab (inert).
export default function Detalii({ id, titlu, deschis }) {
  const { an, categorie, durata, durataEp, sezoane, descriere, imdb } = titlu;
  const episoade = sezoane ? sezoane.reduce((a, b) => a + b, 0) : 0;

  return (
    <div id={id} className={deschis ? "details open" : "details"} inert={!deschis}>
      <div>
        <div className="details-body">
          <div className="facts">
            {an && <span className="fact">{an}</span>}
            {categorie && <span className="fact">{categorie}</span>}
            {durata && <span className="fact">{formateazaDurata(durata)}</span>}
            {sezoane && (
              <span className="fact">
                {sezoane.length} {sezoane.length === 1 ? "season" : "seasons"}
              </span>
            )}
            {sezoane && <span className="fact">{episoade} episodes</span>}
            {sezoane && durataEp && <span className="fact">~{durataEp} min/ep</span>}
          </div>
          {descriere && <p className="overview">{descriere}</p>}
          {sezoane && (
            <ul className="season-list" aria-label="Episodes per season">
              {sezoane.map((n, i) => (
                <li key={i}>
                  <span>Season {i + 1}</span>
                  <b>{n} ep</b>
                </li>
              ))}
            </ul>
          )}
          {imdb && (
            <p className="source">
              <a href={`https://www.imdb.com/title/${imdb}/`} target="_blank" rel="noopener noreferrer">
                View on IMDb
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
