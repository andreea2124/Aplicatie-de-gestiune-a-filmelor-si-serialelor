import { useEffect, useRef, useState } from "react";
import { alegeRandom, candidatiRecomandare } from "../logica.js";

const ETICHETE_TIP = { movie: "Movie", series: "Series", animation: "Animation" };

// Fereastra "Random pick": întâi formatul, apoi categoria, apoi recomandarea.
export default function RandomPick({ catalog, lista, categorii, formate, onAdauga, onInchide }) {
  const dialog = useRef(null);
  const [format, setFormat] = useState(null);
  const [categorie, setCategorie] = useState(null); // "" = orice categorie
  const [titlu, setTitlu] = useState(null);

  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, []);

  const candidati = (f, c) => candidatiRecomandare(catalog, lista, f, c);

  function alegeCategoria(c) {
    setCategorie(c);
    setTitlu(alegeRandom(candidati(format, c)));
  }

  const inLista = titlu && lista.some((f) => f.id === titlu.id);

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
          <p className="pick-title">{titlu.titlu}</p>
          <p className="pick-meta">
            <span className={`badge badge-${titlu.format}`}>{ETICHETE_TIP[titlu.format]}</span>
            <span>{titlu.categorie}</span>
          </p>
          <div className="add-form-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={inLista}
              onClick={() => onAdauga(titlu)}
            >
              {inLista ? "✓ In My List" : "+ Add to My List"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setTitlu(alegeRandom(candidati(format, categorie), titlu.id))}
            >
              Pick another
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
