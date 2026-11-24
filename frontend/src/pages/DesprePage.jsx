import { useTitlu } from "../useTitlu.js";
import styles from "./DesprePage.module.css";

// Pagina de prezentare, cu textul din README.
export default function DesprePage() {
  useTitlu("About");

  return (
    <section className="panel">
      <h2>About Plot</h2>
      <p>
        Plot is a web application for managing and organizing a personal collection of movies and TV shows.
        It was built step by step during the semester, as the project for the Web Technologies course.
      </p>
      <div className={styles.cards}>
        <div className={styles.mini}>
          <span aria-hidden="true">🎬</span>
          <b>Catalog</b>
          <span>About 1200 movies, series and animations, with posters, to browse and search.</span>
        </div>
        <div className={styles.mini}>
          <span aria-hidden="true">🎟️</span>
          <b>My List</b>
          <span>Track what you watch: rate it, follow series episode by episode, add notes.</span>
        </div>
        <div className={styles.mini}>
          <span aria-hidden="true">🎲</span>
          <b>Random pick</b>
          <span>Can&apos;t decide? Let the reel choose your next watch.</span>
        </div>
      </div>
      <p className={styles.stack}>Stack: React, Vite, React Router, Node.js, Express.</p>
      <p className={styles.stack}>
        Title data: IMDb datasets, TVmaze and Wikipedia. Posters: <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>
        (this product uses the TMDB API but is not endorsed or certified by TMDB).
      </p>
    </section>
  );
}
