import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ETICHETE_TIP } from "../constants.js";
import { alegeRandom, bandaRuleta, candidatiRecomandare } from "../logica.js";
import Ruleta from "./Ruleta.jsx";
import styles from "./RandomPick.module.css";

// Fereastra "Random pick": întâi sursa (catalog sau My List), apoi formatul, apoi categoria,
// apoi recomandarea.
// idsInLista = id-urile din catalog ale titlurilor deja adăugate (sau în curs de adăugare).
export default function RandomPick({
  catalog,
  lista,
  idsInLista,
  categorii,
  formate,
  onAdauga,
  onInchide,
}) {
  const dialog = useRef(null);
  const navigate = useNavigate();
  const [sursa, setSursa] = useState(null); // "catalog" sau "lista"
  const [format, setFormat] = useState(null);
  const [categorie, setCategorie] = useState(null); // "" = orice categorie
  const [titlu, setTitlu] = useState(null);
  // ruleta: banda de titluri, numărul rundei (o ruletă nouă la fiecare învârtire) și dacă s-a oprit
  const [banda, setBanda] = useState([]);
  const [runda, setRunda] = useState(0);
  const [gata, setGata] = useState(false);

  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, []);

  const candidati = (f, c) => candidatiRecomandare(catalog, lista, f, c, sursa);
  const nevazuteInLista = lista.filter((f) => !f.vizionat).length;

  // Alege titlul și pregătește banda care se oprește pe el.
  function invarte(lista, exclus) {
    const ales = alegeRandom(lista, exclus);
    setTitlu(ales);
    setBanda(ales ? bandaRuleta(lista, ales) : []);
    setRunda((r) => r + 1);
    setGata(false);
  }

  function alegeCategoria(c) {
    setCategorie(c);
    invarte(candidati(format, c), null);
  }

  // titlurile din listă (manuale sau alese din My List) sunt deja în listă;
  // cele din catalog se caută după catalogId
  const inLista = titlu && (titlu.manual || titlu.deLista || idsInLista.includes(titlu.id));

  function deschideDetalii() {
    onInchide();
    navigate(`/lista/${titlu.id}`);
  }

  return (
    <dialog ref={dialog} className={styles.randomDialog} onClose={onInchide}>
      <button type="button" className="dialog-close" onClick={onInchide} aria-label="Close">
        &times;
      </button>
      <h2>Random pick</h2>

      {sursa === null && (
        <>
          <p className={styles.dialogStep}>Step 1 of 3 &mdash; where from?</p>
          <div className={styles.optionGrid}>
            <button type="button" className={styles.option} onClick={() => setSursa("catalog")}>
              Catalog
              <small>{catalog.length} titles</small>
            </button>
            <button
              type="button"
              className={styles.option}
              disabled={nevazuteInLista === 0}
              onClick={() => setSursa("lista")}
            >
              My List
              <small>
                {nevazuteInLista} unwatched {nevazuteInLista === 1 ? "title" : "titles"}
              </small>
            </button>
          </div>
        </>
      )}

      {sursa !== null && format === null && (
        <>
          <p className={styles.dialogStep}>Step 2 of 3 &mdash; what are you in the mood for?</p>
          <div className={styles.optionGrid}>
            {formate.map((f) => (
              <button
                key={f.id}
                type="button"
                className={styles.option}
                disabled={candidatiRecomandare(catalog, lista, f.id, "", sursa).length === 0}
                onClick={() => setFormat(f.id)}
              >
                {f.eticheta}
              </button>
            ))}
          </div>
          <button type="button" className={styles.linkBtn} onClick={() => setSursa(null)}>
            &larr; Back
          </button>
        </>
      )}

      {format !== null && categorie === null && (
        <>
          <p className={styles.dialogStep}>Step 3 of 3 &mdash; pick a category</p>
          <div className={styles.optionGrid}>
            {categorii.map((c) => (
              <button
                key={c}
                type="button"
                className={styles.option}
                disabled={candidati(format, c).length === 0}
                onClick={() => alegeCategoria(c)}
              >
                {c}
              </button>
            ))}
            <button
              type="button"
              className={`${styles.option} ${styles.optionAny}`}
              onClick={() => alegeCategoria("")}
            >
              Surprise me
            </button>
          </div>
          <button type="button" className={styles.linkBtn} onClick={() => setFormat(null)}>
            &larr; Back
          </button>
        </>
      )}

      {categorie !== null && titlu && (
        <div>
          <p className={styles.dialogStep}>Tonight you could watch</p>
          <Ruleta key={runda} banda={banda} onGata={setGata} />
          <p className={gata ? `${styles.pickMeta} ${styles.shown}` : styles.pickMeta} aria-live="polite">
            {gata && (
              <>
                <span className="sr-only">{titlu.titlu}</span>
                <span className={`badge badge-${titlu.format}`}>{ETICHETE_TIP[titlu.format]}</span>
                <span>{titlu.categorie}</span>
              </>
            )}
          </p>
          <div className={styles.actions}>
            {titlu.deLista ? (
              <button type="button" className="btn btn-primary" disabled={!gata} onClick={deschideDetalii}>
                Open details
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={inLista || !gata}
                onClick={() => onAdauga(titlu)}
              >
                {inLista ? "✓ In My List" : "+ Add to My List"}
              </button>
            )}
            <button
              type="button"
              className="btn"
              disabled={!gata}
              onClick={() => invarte(candidati(format, categorie), titlu)}
            >
              {gata ? "Spin again" : "Spinning..."}
            </button>
          </div>
        </div>
      )}

      {categorie !== null && !titlu && (
        <p className="empty empty-small">
          Nothing left to suggest here &mdash; you have watched everything in this selection.
        </p>
      )}

      {categorie !== null && (
        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => {
            setCategorie(null);
            setTitlu(null);
          }}
        >
          &larr; Change selection
        </button>
      )}
    </dialog>
  );
}
