import { useState } from "react";
import { filtreazaCatalog } from "../logica.js";
import CatalogItem from "./CatalogItem.jsx";

// Catalogul: căutare, filtru pe categorie, un tab pentru fiecare format,
// iar titlurile din tabul ales sunt grupate pe categorii.
// idsInLista = id-urile deja adăugate în My List.
export default function Catalog({ catalog, categorii, formate, idsInLista, onAdauga }) {
  const [text, setText] = useState("");
  const [categorie, setCategorie] = useState("");
  const [format, setFormat] = useState(formate[0].id);

  const gasite = filtreazaCatalog(catalog, text, categorie);
  const dinFormat = gasite.filter((t) => t.format === format);

  return (
    <div className="catalog-wrap">
      <input
        type="search"
        className="search-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search titles..."
        aria-label="Search the catalog"
      />

      <div className="chips" role="group" aria-label="Filter by category">
        {["", ...categorii].map((c) => (
          <button
            key={c || "all"}
            type="button"
            className="chip"
            aria-pressed={categorie === c}
            onClick={() => setCategorie(c)}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      <div className="tabs" role="group" aria-label="Format">
        {formate.map((f) => (
          <button
            key={f.id}
            type="button"
            className="tab"
            aria-pressed={format === f.id}
            onClick={() => setFormat(f.id)}
          >
            {f.eticheta}
            <span className="tab-count">{gasite.filter((t) => t.format === f.id).length}</span>
          </button>
        ))}
      </div>

      <div className="catalog">
        {dinFormat.length === 0 && (
          <p className="empty empty-small">No titles match your search.</p>
        )}
        {categorii.map((cat) => {
          const titluri = dinFormat.filter((t) => t.categorie === cat);
          if (titluri.length === 0) return null;

          return (
            <section key={cat} className="catalog-group">
              <h3>{cat}</h3>
              <ul className="catalog-list">
                {titluri.map((titlu) => (
                  <CatalogItem
                    key={titlu.id}
                    titlu={titlu}
                    inLista={idsInLista.includes(titlu.id)}
                    onAdauga={onAdauga}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
