import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cautaTitluri, detaliiTitlu } from "../api.js";
import { ETICHETE_TIP } from "../constants.js";
import { formateazaDurata } from "../logica.js";
import styles from "./FilmForm.module.css";

const TITLU_MAX = 100;
const POSTER = "https://image.tmdb.org/t/p";

// Formular controlat pentru un titlu care nu e în catalog: state-ul React este
// sursa de adevăr pentru câmpuri. Formularul doar validează, transmite datele prin
// onAdd (care trimite cererea la server) și afișează eroarea, dacă apare.
//
// Pe măsură ce se scrie titlul, backend-ul (care vorbește cu TMDB) propune titluri. Dacă se alege unul,
// formularul completează formatul și categoria, iar titlul se salvează cu detaliile lui (poster, durată
// sau sezoane, descriere), ca să arate ca unul din catalog. Fără sugestie aleasă, merge ca înainte.
// catalog = titlurile din catalog, ca să se vadă dacă titlul ales există deja acolo.
export default function FilmForm({ categorii, formate, catalog = [], onAdd }) {
  const [titlu, setTitlu] = useState("");
  const [format, setFormat] = useState(formate[0].id);
  const [categorie, setCategorie] = useState(categorii[0]);
  const [eroare, setEroare] = useState("");
  const [trimite, setTrimite] = useState(false);
  // pe ecrane mici formularul stă pliat și se deschide la apăsare
  const [deschis, setDeschis] = useState(false);

  // sugestiile de la TMDB
  const [sugestii, setSugestii] = useState([]);
  const [listaDeschisa, setListaDeschisa] = useState(false);
  const [activ, setActiv] = useState(-1); // sugestia evidențiată cu tastele ↑ ↓
  const [indisponibil, setIndisponibil] = useState(false); // serverul n-are cheie TMDB: nu mai încercăm
  // titlul ales dintre sugestii: detaliile lui, sau null
  const [selectie, setSelectie] = useState(null);
  const [seIncarca, setSeIncarca] = useState(false);
  // titlul ales există deja în catalog (obiectul din catalog)
  const [dinCatalog, setDinCatalog] = useState(null);

  // La fiecare schimbare a titlului, după o scurtă pauză, se cer sugestii (dacă nu s-a ales deja una).
  useEffect(() => {
    const q = titlu.trim();
    if (indisponibil || selectie || q.length < 3) return;
    let ignore = false;
    const timer = setTimeout(async () => {
      try {
        const rezultate = await cautaTitluri(q);
        if (!ignore) {
          setSugestii(rezultate);
          setActiv(-1);
        }
      } catch (err) {
        if (ignore) return;
        if (err.message.includes("not configured")) setIndisponibil(true);
        setSugestii([]);
      }
    }, 350);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [titlu, selectie, indisponibil]);

  const q = titlu.trim();
  const vizibile = listaDeschisa && !selectie && !indisponibil && q.length >= 3 ? sugestii : [];

  function valideaza() {
    const t = titlu.trim();
    if (t === "") return "Please enter a title.";
    if (t.length > TITLU_MAX) return `The title can have at most ${TITLU_MAX} characters.`;
    return "";
  }

  // Un titlu ales dintre sugestii: se cer detaliile lui și se completează formularul.
  async function alege(sugestie) {
    setListaDeschisa(false);
    setSeIncarca(true);
    setEroare("");
    setDinCatalog(null);
    try {
      const { titlu: t, format: f, categorie: c, ...detalii } = await detaliiTitlu(sugestie.tip, sugestie.tmdbId);
      const existent = detalii.imdb && catalog.find((x) => x.imdb === detalii.imdb);
      if (existent) {
        setDinCatalog(existent);
        return;
      }
      setSelectie(detalii);
      setTitlu(t.slice(0, TITLU_MAX));
      setFormat(f);
      setCategorie(c);
    } catch (err) {
      setEroare(err.message);
    } finally {
      setSeIncarca(false);
    }
  }

  function laTasta(e) {
    if (vizibile.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiv((a) => (a + 1) % vizibile.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiv((a) => (a <= 0 ? vizibile.length - 1 : a - 1));
    } else if (e.key === "Enter" && activ >= 0) {
      e.preventDefault(); // alege sugestia, nu trimite formularul
      alege(vizibile[activ]);
    } else if (e.key === "Escape") {
      setListaDeschisa(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault(); // oprește reîncărcarea paginii
    const mesaj = valideaza();
    if (mesaj) {
      setEroare(mesaj);
      return;
    }
    setEroare("");
    setTrimite(true);
    try {
      await onAdd({ titlu: titlu.trim(), format, categorie, detalii: selectie ?? undefined });
      // golirea se face doar dacă salvarea a reușit
      setTitlu("");
      setFormat(formate[0].id);
      setCategorie(categorii[0]);
      setSelectie(null);
      setDinCatalog(null);
      setSugestii([]);
    } catch (err) {
      setEroare(err.message);
    } finally {
      setTrimite(false);
    }
  }

  // „2016 · 5 seasons, 42 episodes · ~51 min/ep” sau „2021 · 2h 35m”
  function rezumat(d) {
    const parti = [d.an];
    if (d.sezoane) {
      const total = d.sezoane.reduce((a, b) => a + b, 0);
      parti.push(`${d.sezoane.length} ${d.sezoane.length === 1 ? "season" : "seasons"}, ${total} episodes`);
      if (d.durataEp) parti.push(`~${d.durataEp} min/ep`);
    } else if (d.durata) {
      parti.push(formateazaDurata(d.durata));
    }
    return parti.filter(Boolean).join(" · ");
  }

  return (
    <form
      className={deschis ? `${styles.addForm} ${styles.open}` : styles.addForm}
      onSubmit={handleSubmit}
      noValidate
      data-testid="form"
      aria-labelledby="titlu-formular"
    >
      {/* talonul biletului; pe ecrane mici e antetul care deschide formularul */}
      <div className={styles.stub}>
        <span className={styles.admit}>Admit one</span>
        <h3 id="titlu-formular" className={styles.addFormTitle}>
          Custom title
        </h3>
        <button
          type="button"
          className={styles.fold}
          onClick={() => setDeschis((d) => !d)}
          aria-expanded={deschis}
          aria-label={deschis ? "Hide the form" : "Show the form"}
        >
          ▼
        </button>
      </div>
      <div className={styles.fields}>
        <label className={styles.titleField}>
          <span className="sr-only">Title</span>
          <input
            type="text"
            value={titlu}
            maxLength={TITLU_MAX}
            placeholder="Not in the catalog? Type a title..."
            autoComplete="off"
            onChange={(e) => {
              setTitlu(e.target.value);
              setEroare("");
              setDinCatalog(null);
              setSelectie(null); // text schimbat: detaliile găsite nu mai corespund
              setListaDeschisa(true);
            }}
            onFocus={() => setListaDeschisa(true)}
            onBlur={() => setListaDeschisa(false)}
            onKeyDown={laTasta}
            role="combobox"
            aria-expanded={vizibile.length > 0}
            aria-controls="sugestii-titlu"
            aria-autocomplete="list"
            aria-activedescendant={activ >= 0 && vizibile.length > 0 ? `sugestie-${activ}` : undefined}
            aria-invalid={Boolean(eroare)}
            aria-describedby={eroare ? "eroare-formular" : undefined}
            data-testid="form-title"
          />
          <span className={styles.counter} aria-hidden="true">
            {seIncarca ? "..." : `${titlu.length}/${TITLU_MAX}`}
          </span>
          {vizibile.length > 0 && (
            <ul id="sugestii-titlu" role="listbox" aria-label="Title suggestions" className={styles.suggest}>
              {vizibile.map((s, i) => (
                <li
                  key={`${s.tip}-${s.tmdbId}`}
                  id={`sugestie-${i}`}
                  role="option"
                  aria-selected={i === activ}
                  className={i === activ ? `${styles.option} ${styles.activ}` : styles.option}
                  // mousedown, nu click: la click câmpul și-ar pierde deja focusul și lista s-ar închide
                  onMouseDown={(e) => {
                    e.preventDefault();
                    alege(s);
                  }}
                  onMouseEnter={() => setActiv(i)}
                >
                  {s.poster ? (
                    <img src={`${POSTER}/w92${s.poster}`} alt="" width="34" height="50" loading="lazy" />
                  ) : (
                    <span className={styles.noPoster} aria-hidden="true" />
                  )}
                  <span className={styles.optionText}>
                    <b>{s.titlu}</b>
                    <small>
                      {[s.an, ETICHETE_TIP[s.format], s.categorie].filter(Boolean).join(" · ")}
                    </small>
                  </span>
                </li>
              ))}
              <li className={styles.credit} role="presentation">
                Suggestions from TMDB
              </li>
            </ul>
          )}
        </label>
        <label>
          <span className="sr-only">Format</span>
          <select value={format} onChange={(e) => setFormat(e.target.value)} data-testid="form-format">
            {formate.map((f) => (
              <option key={f.id} value={f.id}>
                {f.eticheta}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Category</span>
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)} data-testid="form-categorie">
            {categorii.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary" disabled={trimite || seIncarca} data-testid="form-submit">
          {trimite ? "Saving..." : "+ Add"}
        </button>

        {selectie && (
          <div className={styles.found} role="status">
            {selectie.poster && (
              <img src={`${POSTER}/w92${selectie.poster}`} alt="" width="34" height="50" />
            )}
            <span>
              <b>Details found</b>
              <small>{rezumat(selectie)}</small>
            </span>
            <button
              type="button"
              className={styles.removeDetails}
              onClick={() => setSelectie(null)}
              aria-label="Do not save the details found"
            >
              Remove details
            </button>
          </div>
        )}
        {dinCatalog && (
          <p className={styles.found} role="status">
            <span>
              <b>&ldquo;{dinCatalog.titlu}&rdquo; is already in the catalog.</b>
              <small>
                <Link to={`/catalog/${dinCatalog.id}`}>Open it</Link> and add it from there, with its poster and details.
              </small>
            </span>
          </p>
        )}
        {eroare && (
          <p id="eroare-formular" className={styles.formError} role="alert" data-testid="form-error">
            {eroare}
          </p>
        )}
      </div>
    </form>
  );
}
