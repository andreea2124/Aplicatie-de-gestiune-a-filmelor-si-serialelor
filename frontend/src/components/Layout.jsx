import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CATEGORII, FORMATE } from "../constants.js";
import { minuteVazute } from "../logica.js";
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
  const navigate = useNavigate();
  const {
    filme,
    catalog,
    listaCompleta,
    idsInLista,
    deVazut,
    loading,
    error,
    handleAdaugaDinCatalog,
    setStatusLista,
  } = useLista();

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
  const ore = Math.round(listaCompleta.reduce((s, f) => s + minuteVazute(f), 0) / 60);
  // cifrele din antet: fiecare duce la My List, cu filtrul de status potrivit
  const cifre = [
    { valoare: filme.length, eticheta: "In My List", status: "toate" },
    { valoare: deVazut, eticheta: "To watch", status: "nevazute" },
    { valoare: filme.length - deVazut, eticheta: "Watched", status: "vazute" },
    { valoare: ore, eticheta: ore === 1 ? "Hour watched" : "Hours watched", status: "vazute" },
  ];

  function arataLista(status) {
    setStatusLista(status);
    if (pathname !== "/") navigate("/");
    // după ce pagina e desenată, se derulează la My List
    setTimeout(() => document.getElementById("my-list")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

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
            {gata && (
              // aici „aterizează” biletul care zboară la adăugarea din catalog
              <span className={styles.navCount} id="nav-lista" aria-label={`${filme.length} items`}>
                {filme.length}
              </span>
            )}
          </NavLink>
          <NavLink to="/catalog" className={navClass}>
            Catalog
          </NavLink>
          <NavLink to="/despre" className={navClass}>
            About
          </NavLink>
        </nav>
        <div className={styles.topActions}>
          <button type="button" className={styles.topBtn} onClick={() => setRandom(true)} disabled={!gata} title="Random pick">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" />
              <circle cx="12" cy="12" r="1.3" fill="currentColor" />
              <circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" />
            </svg>
            <span className={styles.topLabel}>Random pick</span>
          </button>
          <button
            type="button"
            className={styles.topBtn}
            onClick={() => setStatsDeschise(true)}
            disabled={!gata}
            title="Your stats"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
            </svg>
            <span className={styles.topLabel}>Your stats</span>
          </button>
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
      </div>
      <header className={styles.appHeader}>
        <div className={styles.valance} aria-hidden="true"></div>
        <div className={styles.beam} aria-hidden="true"></div>
        <div className={styles.heroInner}>
          <div className={styles.marquee}>
            <span className={`${styles.bulbsSide} ${styles.bulbsLeft}`} aria-hidden="true"></span>
            <span className={`${styles.bulbsSide} ${styles.bulbsRight}`} aria-hidden="true"></span>
            <h1>Plot</h1>
          </div>
          <div className={styles.heroText}>
            <p>Your personal collection of movies and TV shows. Pick from the catalog, track what you watch, rate it.</p>
            {gata && (
              <ul className={styles.stats} aria-label="Your list at a glance">
                {cifre.map((c) => (
                  <li key={c.eticheta}>
                    <button type="button" className={styles.stat} onClick={() => arataLista(c.status)}>
                      {/* cheia nouă repornește pulsul când se schimbă cifra */}
                      <b key={c.valoare}>{c.valoare}</b>
                      <span>{c.eticheta}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </header>
      <div className={styles.filmstrip} aria-hidden="true"></div>
      <main id="continut" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.appFooter}>
        Web Technologies Project
        <small className={styles.credits}>
          Posters and images: <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>.
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </small>
      </footer>

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
