import Catalog from "../components/Catalog.jsx";
import { CATEGORII, FORMATE } from "../constants.js";
import { useLista } from "../useLista.js";
import { useTitlu } from "../useTitlu.js";
import styles from "./CatalogPage.module.css";

// Pagina catalogului (/catalog): titlurile de la server, cu căutare, filtre și adăugare în My List.
// Datele vin din ListaProvider, deci nu se cer din nou la fiecare intrare pe pagină.
export default function CatalogPage() {
  useTitlu("Catalog");
  const { catalog, idsInLista, loading, error, handleAdaugaDinCatalog } = useLista();

  if (loading) {
    return (
      <section className="panel" role="status">
        <span className="sr-only">Loading the catalog...</span>
        <div className={styles.skeleton}></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <p className="error">
          Could not load the catalog: {error}. Is the backend running (<code>npm run dev</code> in <code>backend/</code>)?
        </p>
      </section>
    );
  }

  return (
    <section className="panel" aria-label="Catalog">
      <Catalog
        catalog={catalog}
        categorii={CATEGORII}
        formate={FORMATE}
        idsInLista={idsInLista}
        onAdauga={handleAdaugaDinCatalog}
      />
    </section>
  );
}
