// Progresul unui serial: bara pe sezoane, butoane pentru episoade și calculatorul de binge.
// onEpisoade(nou) primește noul număr de episoade văzute (salvarea o face App).
import { useState } from "react";
import {
  dataTerminare,
  episoadeVazute,
  finalSezon,
  formateazaDurata,
  totalEpisoade,
  urmatorulEpisod,
} from "../logica.js";

const RITMURI = [1, 2, 3, 4, 5, 6, 8, 10];
const formatData = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

export default function Progres({ film, ocupat, onEpisoade }) {
  const [peZi, setPeZi] = useState(2);
  const { sezoane, durataEp } = film;
  const total = totalEpisoade(film);
  const vazute = episoadeVazute(film);
  const urmator = urmatorulEpisod(sezoane, vazute);
  const procent = Math.round((vazute / total) * 100);
  const ramase = total - vazute;
  const final = dataTerminare(ramase, peZi);

  // episoadele dinaintea fiecărui sezon, pentru umplerea segmentelor
  const inainte = sezoane.map((_, i) => sezoane.slice(0, i).reduce((a, b) => a + b, 0));

  return (
    <div className="progress">
      <div className="progress-head">
        <span className="progress-now">
          {urmator ? `Next: S${urmator.sezon} · E${urmator.episod}` : "All episodes watched"}
        </span>
        <span className="progress-count">
          {vazute}/{total} ep · {procent}%
        </span>
      </div>

      <div
        className="progress-bar"
        role="progressbar"
        aria-label={`Episodes watched of ${film.titlu}`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={vazute}
        aria-valuetext={`${vazute} of ${total} episodes`}
      >
        {sezoane.map((n, i) => {
          const pline = Math.max(0, Math.min(vazute - inainte[i], n));
          return (
            <span
              key={i}
              className="progress-season"
              style={{ flexGrow: n }}
              title={`Season ${i + 1}: ${pline}/${n} episodes`}
            >
              <span className="progress-fill" style={{ width: `${(pline / n) * 100}%` }} />
            </span>
          );
        })}
      </div>

      <div className="progress-actions">
        <button
          type="button"
          className="ep-btn"
          onClick={() => onEpisoade(vazute - 1)}
          disabled={ocupat || vazute === 0}
          aria-label={`One episode back for ${film.titlu}`}
        >
          &minus;
        </button>
        {/* după ultimul episod rămâne doar butonul de întoarcere */}
        {urmator && (
          <>
            <button
              type="button"
              className="ep-btn ep-btn-main"
              onClick={() => onEpisoade(vazute + 1)}
              disabled={ocupat}
            >
              +1 episode
            </button>
            <button
              type="button"
              className="ep-btn"
              onClick={() => onEpisoade(finalSezon(sezoane, vazute))}
              disabled={ocupat}
            >
              Finish season
            </button>
          </>
        )}
      </div>

      {ramase > 0 && (
        <p className="binge">
          <label>
            Binge at{" "}
            <select value={peZi} onChange={(e) => setPeZi(Number(e.target.value))}>
              {RITMURI.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>{" "}
            ep/day
          </label>
          <span>
            &rarr; done by <b>{formatData.format(final.data)}</b> ({final.zile}{" "}
            {final.zile === 1 ? "day" : "days"}
            {durataEp ? `, ${formateazaDurata(ramase * durataEp)} left` : ""})
          </span>
        </p>
      )}
    </div>
  );
}
