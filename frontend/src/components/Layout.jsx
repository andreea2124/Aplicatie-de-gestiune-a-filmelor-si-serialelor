import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { CATEGORII, FORMATE } from "../constants.js";
import { useLista } from "../useLista.js";
import RandomPick from "./RandomPick.jsx";
import Statistici from "./Statistici.jsx";
import Toast from "./Toast.jsx";
import styles from "./Layout.module.css";

// Tema de pornire: cea a sistemului de operare
function temaInitiala() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// NavLink marchează singur pagina curentă
function navClass({ isActive }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

// Bara de navigație, antetul și subsolul, scrise o singură dată; pagina curentă apare în <Outlet />.
// Ferestrele Random pick și Your stats se deschid din antet și merg pe orice pagină.
export default function Layout() {
  const [tema, setTema] = useState(temaInitiala);
  const [random, setRandom] = useState(false);
  const [statsDeschise, setStatsDeschise] = useState(false);
  const { pathname } = useLocation();
  const { filme, catalog, listaCompleta, idsInLista, loading, error, handleAdaugaDinCatalog } = useLista();

  // la schimbarea paginii, începem de sus
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Comutarea temei: state-ul pentru buton, atributul data-theme pentru CSS
  function comutaTema() {
    const noua = tema === "dark" ? "light" : "dark";
    setTema(noua);
    document.documentElement.dataset.theme = noua;
  }

  const gata = !loading && !error;

  return (
    <>
      <a href="#continut" className={styles.skip}>
        Skip to content
      </a>
      <div className={styles.topbar}>
        <Link to="/" className={styles.brand} aria-label="Plot, home">
          Plot
        </Link>
        <nav className={styles.nav} data-testid="nav" aria-label="Main">
          <NavLink to="/" end className={navClass}>
            My List
          </NavLink>
          <NavLink to="/despre" className={navClass}>
            About
          </NavLink>
        </nav>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={comutaTema}
          aria-pressed={tema === "dark"}
          aria-label={tema === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={tema === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span aria-hidden="true">{tema === "dark" ? "🌙" : "☀️"}</span>
        </button>
      </div>

      <header className={styles.appHeader}>
        <div className={styles.valance} aria-hidden="true"></div>
        <div className={styles.beam} aria-hidden="true"></div>
        <div className={styles.marquee}>
          <span className={`${styles.bulbsSide} ${styles.bulbsLeft}`} aria-hidden="true"></span>
          <span className={`${styles.bulbsSide} ${styles.bulbsRight}`} aria-hidden="true"></span>
          <h1>Plot</h1>
        </div>
        <p>Manage and organize your personal collection of movies and TV shows.</p>
        <div className={styles.actions}>
          <button type="button" className={styles.randomBtn} onClick={() => setRandom(true)} disabled={!gata}>
            Random pick
          </button>
          <button type="button" className={styles.randomBtn} onClick={() => setStatsDeschise(true)} disabled={!gata}>
            Your stats
          </button>
        </div>
      </header>
      <div className={styles.filmstrip} aria-hidden="true"></div>

      <main id="continut" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.appFooter}>Web Technologies Project</footer>

      <Toast />

      {statsDeschise && (
        <Statistici lista={listaCompleta} categorii={CATEGORII} onInchide={() => setStatsDeschise(false)} />
      )}

      {random && (
        <RandomPick
          catalog={catalog}
          lista={filme}
          idsInLista={idsInLista}
          categorii={CATEGORII}
          formate={FORMATE}
          onAdauga={handleAdaugaDinCatalog}
          onInchide={() => setRandom(false)}
        />
      )}
    </>
  );
}
