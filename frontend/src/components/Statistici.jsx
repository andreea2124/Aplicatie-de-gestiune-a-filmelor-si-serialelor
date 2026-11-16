// "Plot Wrapped": statisticile listei, într-o fereastră cu numere care cresc animat.
import { useEffect, useRef, useState } from "react";
import { episoadeVazute, formateazaDurata, statistici } from "../logica.js";
import styles from "./Statistici.module.css";

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
  const maxLuna = Math.max(1, ...s.luni.map((l) => l.n));
  const gol = s.vazute === 0 && s.episoade === 0;

  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, []);

  return (
    <dialog ref={dialog} className={styles.statsDialog} onClose={onInchide} aria-labelledby="stats-title">
      <button type="button" className={`dialog-close ${styles.close}`} onClick={onInchide} aria-label="Close">
        &times;
      </button>
      <p className={styles.statsKicker}>Plot Wrapped</p>
      <h2 id="stats-title">Your list, in numbers</h2>

      {gol ? (
        <p className={styles.statsEmpty}>
          Nothing watched yet. Mark titles as watched, or track episodes of a series, and your
          stats will show up here.
        </p>
      ) : (
        <>
          <section className={styles.statsHero} style={{ "--i": 0 }}>
            <p className={styles.statsLabel}>Time in front of the screen</p>
            <p className={styles.statsBig}>
              <Numar valoare={ore} />
              <small>h</small> <Numar valoare={s.minute % 60} />
              <small>m</small>
            </p>
            <p className={styles.statsNote}>
              {zile >= 1
                ? `That is ${zile.toFixed(1)} days nonstop.`
                : `That is about ${Math.max(1, Math.round(s.minute / 110))} average movie nights.`}
            </p>
          </section>

          <div className={styles.statsTiles}>
            <div className={styles.statsTile} style={{ "--i": 1 }}>
              <p className={styles.statsLabel}>Titles watched</p>
              <p className={styles.statsValue}>
                <Numar valoare={s.vazute} />
                <small> / {s.total}</small>
              </p>
            </div>
            <div className={styles.statsTile} style={{ "--i": 2 }}>
              <p className={styles.statsLabel}>Episodes</p>
              <p className={styles.statsValue}>
                <Numar valoare={s.episoade} />
              </p>
            </div>
            <div className={styles.statsTile} style={{ "--i": 3 }}>
              <p className={styles.statsLabel}>Average rating</p>
              <p className={styles.statsValue}>
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
            <div className={styles.statsTile} style={{ "--i": 4 }}>
              <p className={styles.statsLabel}>Favourite category</p>
              <p className={`${styles.statsValue} ${styles.statsValueText}`}>
                {s.peCategorie[0]?.categorie ?? <small>&mdash;</small>}
              </p>
            </div>
            <div className={`${styles.statsTile} ${styles.tileNew}`} style={{ "--i": 5 }}>
              <p className={styles.statsLabel}>This month</p>
              <p className={styles.statsValue}>
                <Numar valoare={s.lunaAceasta} />
                <small> {s.lunaAceasta === 1 ? "title" : "titles"}</small>
              </p>
            </div>
            <div className={`${styles.statsTile} ${styles.tileNew}`} style={{ "--i": 6 }}>
              <p className={styles.statsLabel}>Streak</p>
              <p className={styles.statsValue}>
                <Numar valoare={s.serie} />
                <small> {s.serie === 1 ? "day" : "days"}</small>
              </p>
            </div>
          </div>

          {s.peCategorie.length > 0 && (
            <section className={styles.statsSection} style={{ "--i": 5 }}>
              <h3>Watched per category</h3>
              <ul className={styles.statsBars}>
                {s.peCategorie.map((c) => (
                  <li key={c.categorie} title={`${c.categorie}: ${c.n} watched`}>
                    <span className={styles.barLabel}>{c.categorie}</span>
                    <span className={styles.barTrack}>
                      <span className={styles.barFill} style={{ width: `${(c.n / maxCategorie) * 100}%` }} />
                    </span>
                    <span className={styles.barValue}>{c.n}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={styles.statsSection} style={{ "--i": 6 }}>
            <h3>By format</h3>
            <ul className={styles.statsFormats}>
              {s.peFormat.map((f) => (
                <li key={f.format}>
                  <span className={`${styles.formatDot} ${styles[`dot-${f.format}`]}`} aria-hidden="true" />
                  {ETICHETE_TIP[f.format]}
                  <b>{f.n}</b>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.statsSection} style={{ "--i": 7 }}>
            <h3>Finished per month</h3>
            {s.cuDate ? (
              <div className={styles.months}>
                {s.luni.map((l) => (
                  <span
                    key={l.eticheta}
                    className={styles.monthBar}
                    style={{ height: `${(l.n / maxLuna) * 100}%` }}
                    data-m={l.eticheta}
                    title={`${l.eticheta}: ${l.n} ${l.n === 1 ? "title" : "titles"}`}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.statsFootnote}>
                Finish dates are recorded from now on, so this chart fills up as you mark titles as watched.
              </p>
            )}
          </section>

          <div className={styles.statsHighlights}>
            {s.topNotat && (
              <div className={styles.statsTile} style={{ "--i": 7 }}>
                <p className={styles.statsLabel}>Top rated</p>
                <p className={styles.statsPick}>{s.topNotat.titlu}</p>
                <p className={styles.statsSub} aria-label={`${s.topNotat.rating} stars`}>
                  {"★".repeat(s.topNotat.rating)}
                </p>
              </div>
            )}
            {s.serialTop && (
              <div className={styles.statsTile} style={{ "--i": 8 }}>
                <p className={styles.statsLabel}>Biggest binge</p>
                <p className={styles.statsPick}>{s.serialTop.titlu}</p>
                <p className={styles.statsSub}>{episoadeVazute(s.serialTop)} episodes</p>
              </div>
            )}
            {s.celMaiLungFilm && (
              <div className={styles.statsTile} style={{ "--i": 9 }}>
                <p className={styles.statsLabel}>Longest watch</p>
                <p className={styles.statsPick}>{s.celMaiLungFilm.titlu}</p>
                <p className={styles.statsSub}>{formateazaDurata(s.celMaiLungFilm.durata)}</p>
              </div>
            )}
          </div>

          {s.faraDurata > 0 && (
            <p className={styles.statsFootnote}>
              {s.faraDurata} {s.faraDurata === 1 ? "title has" : "titles have"} no runtime data, so{" "}
              {s.faraDurata === 1 ? "it is" : "they are"} not counted in the time.
            </p>
          )}
        </>
      )}
    </dialog>
  );
}
