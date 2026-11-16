import FilmCard from "./FilmCard.jsx";
import styles from "./FilmList.module.css";

// idsOcupate = id-urile elementelor pentru care o cerere e în curs
// intro = rulează intrarea animată (cardurile au întârzieri pe poziție)
// listaGoala = lista nu are niciun element (altfel, filtrele nu găsesc nimic)
export default function FilmList({
  filme,
  listaGoala = false,
  idsOcupate = [],
  intro = false,
  onComuta,
  onSterge,
  onRating,
  onEpisoade,
  onCatalog,
}) {
  if (filme.length === 0) {
    return (
      <div className={styles.emptyTicket} data-testid="empty">
        <div className={styles.emptyIcon} aria-hidden="true">
          🎟️
        </div>
        {listaGoala ? (
          <>
            <h3>Your list is empty</h3>
            <p>Pick something from the catalog, or add your own title.</p>
            {onCatalog && (
              <button type="button" className="btn btn-primary" onClick={onCatalog}>
                Browse the catalog
              </button>
            )}
          </>
        ) : (
          <>
            <h3>No items found</h3>
            <p>Try a different search or filter.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <ul className={intro ? `${styles.itemList} ${styles.intro}` : styles.itemList}>
      {filme.map((film) => (
        <FilmCard
          key={film.id}
          film={film}
          ocupat={idsOcupate.includes(film.id)}
          onComuta={onComuta}
          onSterge={onSterge}
          onRating={onRating}
          onEpisoade={onEpisoade}
        />
      ))}
    </ul>
  );
}
