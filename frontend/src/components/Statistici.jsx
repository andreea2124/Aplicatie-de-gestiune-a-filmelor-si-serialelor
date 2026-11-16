// "Plot Wrapped": statisticile listei, într-o fereastră cu numere care cresc animat.
import { useEffect, useRef, useState } from "react";
import { episoadeVazute, formateazaDurata, statistici } from "../logica.js";

const ETICHETE_TIP = { movie: "Movies", series: "Series", animation: "Animation" };

// Numărul crește de la 0 la valoare; cu "reduced motion" apare direct.
function Numar({ valoare, zecimale = 0 }) {
  const [afisat, setAfisat] = useState(0);

  useEffect(() => {
    const fara = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const durata = fara ? 0 : 1400;
    let start = null;
    let cadru;
    function pas(timp) {
      if (start === null) start = timp;
      const t = durata ? Math.min((timp - start) / durata, 1) : 1;
      setAfisat(valoare * (1 - (1 - t) ** 3)); // încetinește spre final
      if (t < 1) cadru = requestAnimationFrame(pas);
    }
    cadru = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(cadru);
  }, [valoare]);

  return afisat.toFixed(zecimale);
}

export default function Statistici({ lista, categorii, onInchide }) {
  const dialog = useRef(null);
  const s = statistici(lista, categorii);
  const ore = Math.floor(s.minute / 60);
  const zile = s.minute / 1440;
  const maxCategorie = s.peCategorie[0]?.n ?? 0;
  const gol = s.vazute === 0 && s.episoade === 0;

  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, []);

  return (
    <dialog ref={dialog} className="stats-dialog" onClose={onInchide} aria-labelledby="stats-title">
      <button type="button" className="dialog-close" onClick={onInchide} aria-label="Close">
        &times;
      </button>
      <p className="stats-kicker">Plot Wrapped</p>
      <h2 id="stats-title">Your list, in numbers</h2>

      {gol ? (
        <p className="stats-empty">
          Nothing watched yet. Mark titles as watched, or track episodes of a series, and your
          stats will show up here.
        </p>
      ) : (
        <>
          <section className="stats-hero" style={{ "--i": 0 }}>
            <p className="stats-label">Time in front of the screen</p>
            <p className="stats-big">
              <Numar valoare={ore} />
              <small>h</small> <Numar valoare={s.minute % 60} />
              <small>m</small>
            </p>
            <p className="stats-note">
              {zile >= 1
                ? `That is ${zile.toFixed(1)} days nonstop.`
                : `That is about ${Math.max(1, Math.round(s.minute / 110))} average movie nights.`}
            </p>
          </section>

          <div className="stats-tiles">
            <div className="stats-tile" style={{ "--i": 1 }}>
              <p className="stats-label">Titles watched</p>
              <p className="stats-value">
                <Numar valoare={s.vazute} />
                <small> / {s.total}</small>
              </p>
            </div>
            <div className="stats-tile" style={{ "--i": 2 }}>
              <p className="stats-label">Episodes</p>
              <p className="stats-value">
                <Numar valoare={s.episoade} />
              </p>
            </div>
            <div className="stats-tile" style={{ "--i": 3 }}>
              <p className="stats-label">Average rating</p>
              <p className="stats-value">
                {s.notate ? (
                  <>
                    <Numar valoare={s.medie} zecimale={1} />
                    <small> &#9733;</small>
                  </>
                ) : (
                  <small>no ratings</small>
                )}
              </p>
            </div>
            <div className="stats-tile" style={{ "--i": 4 }}>
              <p className="stats-label">Favourite category</p>
              <p className="stats-value stats-value-text">
                {s.peCategorie[0]?.categorie ?? <small>&mdash;</small>}
              </p>
            </div>
          </div>

          {s.peCategorie.length > 0 && (
            <section className="stats-section" style={{ "--i": 5 }}>
              <h3>Watched per category</h3>
              <ul className="stats-bars">
                {s.peCategorie.map((c) => (
                  <li key={c.categorie} title={`${c.categorie}: ${c.n} watched`}>
                    <span className="bar-label">{c.categorie}</span>
                    <span className="bar-track">
                      <span className="bar-fill" style={{ width: `${(c.n / maxCategorie) * 100}%` }} />
                    </span>
                    <span className="bar-value">{c.n}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="stats-section" style={{ "--i": 6 }}>
            <h3>By format</h3>
            <ul className="stats-formats">
              {s.peFormat.map((f) => (
                <li key={f.format}>
                  <span className={`format-dot dot-${f.format}`} aria-hidden="true" />
                  {ETICHETE_TIP[f.format]}
                  <b>{f.n}</b>
                </li>
              ))}
            </ul>
          </section>

          <div className="stats-highlights">
            {s.topNotat && (
              <div className="stats-tile" style={{ "--i": 7 }}>
                <p className="stats-label">Top rated</p>
                <p className="stats-pick">{s.topNotat.titlu}</p>
                <p className="stats-sub" aria-label={`${s.topNotat.rating} stars`}>
                  {"★".repeat(s.topNotat.rating)}
                </p>
              </div>
            )}
            {s.serialTop && (
              <div className="stats-tile" style={{ "--i": 8 }}>
                <p className="stats-label">Biggest binge</p>
                <p className="stats-pick">{s.serialTop.titlu}</p>
                <p className="stats-sub">{episoadeVazute(s.serialTop)} episodes</p>
              </div>
            )}
            {s.celMaiLungFilm && (
              <div className="stats-tile" style={{ "--i": 9 }}>
                <p className="stats-label">Longest watch</p>
                <p className="stats-pick">{s.celMaiLungFilm.titlu}</p>
                <p className="stats-sub">{formateazaDurata(s.celMaiLungFilm.durata)}</p>
              </div>
            )}
          </div>

          {s.faraDurata > 0 && (
            <p className="stats-footnote">
              {s.faraDurata} {s.faraDurata === 1 ? "title has" : "titles have"} no runtime data, so{" "}
              {s.faraDurata === 1 ? "it is" : "they are"} not counted in the time.
            </p>
          )}
        </>
      )}
    </dialog>
  );
}
