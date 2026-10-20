import CatalogItem from "./CatalogItem.jsx";

// Catalogul grupat pe categorii; idsInLista = id-urile deja adăugate în My List.
export default function Catalog({ catalog, categorii, idsInLista, onAdauga }) {
  return (
    <div className="catalog">
      {categorii.map((categorie) => {
        const titluri = catalog.filter((t) => t.categorie === categorie);
        if (titluri.length === 0) return null;

        return (
          <section key={categorie} className="catalog-group">
            <h3>{categorie}</h3>
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
  );
}
