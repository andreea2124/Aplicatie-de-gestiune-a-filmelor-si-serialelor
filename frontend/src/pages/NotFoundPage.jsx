import { Link } from "react-router-dom";
import { useTitlu } from "../useTitlu.js";
import styles from "./NotFoundPage.module.css";

// Prinde orice adresă care nu se potrivește cu o rută: un bilet „anulat”.
export default function NotFoundPage() {
  useTitlu("Page not found");

  return (
    <section className={styles.cancel} data-testid="not-found">
      <span className={styles.stamp}>Sold out</span>
      <h2>Page not found</h2>
      <p className="info">This ticket leads nowhere.</p>
      <Link to="/lista" className="btn btn-primary">
        Back to My List
      </Link>
    </section>
  );
}
