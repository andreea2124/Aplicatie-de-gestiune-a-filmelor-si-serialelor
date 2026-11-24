import { useCallback, useEffect, useRef, useState } from "react";
import { ListaContext } from "./ListaContext.js";
import { createFilm, createTitluCatalog, deleteFilm, fetchFilme, fetchLista, updateFilm } from "./api.js";
import {
  completeazaDinCatalog,
  dinCatalog,
  existaTitlu,
  idsDinCatalog,
  inlocuieste,
  ratingNou,
  schimbareEpisoade,
  schimbareVizionat,
  stergeFilm,
  titluDinFormular,
} from "./logica.js";

// Ține într-un singur loc My List și catalogul (de la server) și toate acțiunile asupra lor,
// ca să nu se reîncarce la fiecare schimbare de pagină și ca ferestrele din antet să meargă pe orice pagină.
// Orice modificare merge întâi la server, apoi în state, cu obiectul întors de server.
export default function ListaProvider({ children }) {
  const [filme, setFilme] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  // eroarea de la încărcare (nu e ce arăta) și eroarea unei acțiuni (lista rămâne pe ecran)
  const [error, setError] = useState(null);
  const [eroareActiune, setEroareActiune] = useState(null);
  // cereri în curs: id-uri din listă (bifare, rating, ștergere) și id-uri din catalog (adăugare)
  const [idsOcupate, setIdsOcupate] = useState([]);
  const [seAdauga, setSeAdauga] = useState([]);
  // mesajul scurt de jos: { prefix, titlu, text, actiune? }
  const [toast, setToast] = useState(null);
  const timerToast = useRef(null);
  // filtrul de status din My List; stă aici ca să-l poată schimba și cifrele din antet (Layout)
  const [statusLista, setStatusLista] = useState("toate");

  // Rulează o singură dată: catalogul și lista, în paralel
  useEffect(() => {
    let ignore = false; // nu se setează state dacă aplicația s-a închis între timp

    async function load() {
      try {
        const [dateCatalog, dateLista] = await Promise.all([fetchFilme(), fetchLista()]);
        if (!ignore) {
          setCatalog(dateCatalog);
          setFilme(dateLista);
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => () => clearTimeout(timerToast.current), []);

  const arataToast = useCallback((mesaj) => {
    clearTimeout(timerToast.current);
    setToast(mesaj);
    timerToast.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const inchideToast = useCallback(() => {
    clearTimeout(timerToast.current);
    setToast(null);
  }, []);

  const deVazut = filme.filter((f) => !f.vizionat).length;
  // lista cu detaliile din catalog (durată, sezoane), pentru afișare, episoade și statistici
  const listaCompleta = completeazaDinCatalog(filme, catalog);
  const idsInLista = [...idsDinCatalog(filme), ...seAdauga];

  // Serverul ține datele în memorie: după o repornire, ce arată pagina nu mai există acolo.
  // Atunci se aduc din nou lista și catalogul, ca pagina să arate ce are serverul.
  async function sincronizeazaCuServerul() {
    try {
      const [dateCatalog, dateLista] = await Promise.all([fetchFilme(), fetchLista()]);
      setCatalog(dateCatalog);
      setFilme(dateLista);
    } catch {
      // serverul nu răspunde deloc: rămâne mesajul de eroare de mai jos
    }
  }

  // Rulează o cerere marcând cheia ca ocupată; eroarea apare deasupra listei.
  async function cuCerere(setOcupate, cheie, actiune) {
    setOcupate((prev) => [...prev, cheie]);
    try {
      await actiune();
      setEroareActiune(null);
    } catch (err) {
      if (err.status === 404) {
        // elementul nu mai există pe server (de exemplu a fost repornit): lista se reîncarcă
        await sincronizeazaCuServerul();
        setEroareActiune("the item no longer exists on the server (it may have been restarted), so the list was refreshed.");
      } else {
        setEroareActiune(err.message);
      }
    } finally {
      setOcupate((prev) => prev.filter((k) => k !== cheie));
    }
  }

  // Titlu scris în formular. Nu prinde erorile: ajung înapoi în formular, care le afișează.
  async function handleAdd(date) {
    if (existaTitlu(filme, date.titlu, date.format)) {
      throw new Error("This title is already in your list.");
    }
    if (existaTitlu(catalog, date.titlu, date.format)) {
      throw new Error("This title is already in the catalog - add it from there.");
    }
    // Titlul intră întâi în catalog (cu detaliile găsite la TMDB, dacă s-a ales o sugestie), apoi în
    // My List, ca orice titlu din catalog; elementul din listă primește doar catalogId + câmpurile de bază.
    const intrare = await createTitluCatalog(titluDinFormular(date));
    setCatalog((prev) => (prev.some((t) => t.id === intrare.id) ? prev : [...prev, intrare]));
    if (idsInLista.includes(intrare.id)) {
      throw new Error("This title is already in your list.");
    }
    const creat = await createFilm({ ...dinCatalog(intrare), manual: true }); // serverul întoarce elementul cu id
    setFilme((prev) => [...prev, creat]);
    arataToast({ prefix: "✓", titlu: creat.titlu, text: "added to My List" });
  }

  // Titlu din catalog (sau din Random pick); butonul e blocat cât timp se trimite.
  function handleAdaugaDinCatalog(titlu) {
    if (idsInLista.includes(titlu.id)) return;
    cuCerere(setSeAdauga, titlu.id, async () => {
      const creat = await createFilm(dinCatalog(titlu));
      setFilme((prev) => [...prev, creat]);
      arataToast({ prefix: "✓", titlu: creat.titlu, text: "added to My List" });
    });
  }

  function handleToggle(id) {
    if (idsOcupate.includes(id)) return; // o cerere pentru element e deja în curs
    const film = listaCompleta.find((f) => f.id === id);
    cuCerere(setIdsOcupate, id, async () => {
      const actualizat = await updateFilm(id, schimbareVizionat(film));
      setFilme((prev) => inlocuieste(prev, actualizat));
    });
  }

  function handleRating(id, n) {
    if (idsOcupate.includes(id)) return;
    const film = filme.find((f) => f.id === id);
    cuCerere(setIdsOcupate, id, async () => {
      const actualizat = await updateFilm(id, { rating: ratingNou(film.rating ?? 0, n) });
      setFilme((prev) => inlocuieste(prev, actualizat));
    });
  }

  // Progresul pe episoade al unui serial; la ultimul episod titlul devine văzut.
  function handleEpisoade(id, nou) {
    if (idsOcupate.includes(id)) return;
    const film = listaCompleta.find((f) => f.id === id);
    cuCerere(setIdsOcupate, id, async () => {
      const actualizat = await updateFilm(id, schimbareEpisoade(film, nou));
      setFilme((prev) => inlocuieste(prev, actualizat));
    });
  }

  // Readuce în listă un titlu șters (primește alt id de la server, deci ajunge la sfârșit).
  async function anuleazaStergerea(film) {
    const faraId = Object.fromEntries(Object.entries(film).filter(([camp]) => camp !== "id"));
    try {
      const creat = await createFilm(faraId);
      setFilme((prev) => [...prev, creat]);
      arataToast({ prefix: "✓", titlu: creat.titlu, text: "is back in My List" });
    } catch (err) {
      setEroareActiune(err.message);
    }
  }

  // Șterge un element: întâi serverul, apoi state-ul, apoi mesajul cu „Undo”.
  // Arată eroarea mai departe (pagina de detaliu o afișează la ea).
  async function stergeElement(film) {
    await deleteFilm(film.id);
    setFilme((prev) => stergeFilm(prev, film.id));
    arataToast({
      prefix: "Removed",
      titlu: film.titlu,
      text: "",
      actiune: { eticheta: "Undo", onClick: () => anuleazaStergerea(film) },
    });
  }

  function handleDelete(id) {
    if (idsOcupate.includes(id)) return;
    const film = filme.find((f) => f.id === id);
    cuCerere(setIdsOcupate, id, () => stergeElement(film));
  }

  // Pagina de detaliu a modificat un element: îl pune și aici, ca lista să rămână la zi.
  function sincronizeaza(element) {
    setFilme((prev) => inlocuieste(prev, element));
  }

  const value = {
    filme,
    catalog,
    listaCompleta,
    idsInLista,
    deVazut,
    loading,
    error,
    eroareActiune,
    setEroareActiune,
    idsOcupate,
    toast,
    arataToast,
    inchideToast,
    handleAdd,
    handleAdaugaDinCatalog,
    handleToggle,
    handleRating,
    handleEpisoade,
    handleDelete,
    stergeElement,
    sincronizeaza,
    statusLista,
    setStatusLista,
  };

  return <ListaContext.Provider value={value}>{children}</ListaContext.Provider>;
}
