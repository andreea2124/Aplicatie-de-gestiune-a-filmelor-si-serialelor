import { useEffect, useRef, useState } from "react";
import { alegeRandom, bandaRuleta, candidatiRecomandare } from "../logica.js";
import Ruleta from "./Ruleta.jsx";

const ETICHETE_TIP = { movie: "Movie", series: "Series", animation: "Animation" };

// Fereastra "Random pick": întâi formatul, apoi categoria, apoi recomandarea.
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

  const candidati = (f, c) => candidatiRecomandare(catalog, lista, f, c);

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

  // titlurile manuale vin chiar din listă; cele din catalog se caută după catalogId
  const inLista = titlu && (titlu.manual || idsInLista.includes(titlu.id));

  return (
    <dialog ref={dialog} className="random-dialog" onClose={onInchide}>
      <button type="button" className="dialog-close" onClick={onInchide} aria-label="Close">
        &times;
      </button>
      <h2>Random pick</h2>

      {format === null && (
        <>
          <p className="dialog-step">Step 1 of 2 &mdash; what are you in the mood for?</p>
          <div className="option-grid">
            {formate.map((f) => (
              <button key={f.id} type="button" className="option" onClick={() => setFormat(f.id)}>
                {f.eticheta}
              </button>
            ))}
          </div>
        </>
      )}

      {format !== null && categorie === null && (
        <>
          <p className="dialog-step">Step 2 of 2 &mdash; pick a category</p>
          <div className="option-grid">
            {categorii.map((c) => (
              <button
                key={c}
                type="button"
                className="option"
                disabled={candidati(format, c).length === 0}
                onClick={() => alegeCategoria(c)}
              >
                {c}
              </button>
            ))}
            <button type="button" className="option option-any" onClick={() => alegeCategoria("")}>
              Surprise me
            </button>
          </div>
          <button type="button" className="link-btn" onClick={() => setFormat(null)}>
            &larr; Back
          </button>
        </>
      )}

      {categorie !== null && titlu && (
        <div className="pick-result">
          <p className="dialog-step">Tonight you could watch</p>
          <Ruleta key={runda} banda={banda} onGata={setGata} />
          <p className={gata ? "pick-meta shown" : "pick-meta"} aria-live="polite">
            {gata && (
              <>
                <span className="sr-only">{titlu.titlu}</span>
                <span className={`badge badge-${titlu.format}`}>{ETICHETE_TIP[titlu.format]}</span>
                <span>{titlu.categorie}</span>
              </>
            )}
          </p>
          <div className="add-form-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={inLista || !gata}
              onClick={() => onAdauga(titlu)}
            >
              {inLista ? "✓ In My List" : "+ Add to My List"}
            </button>
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
          className="link-btn"
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
