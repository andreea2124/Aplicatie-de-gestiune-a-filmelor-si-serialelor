import DetaliiCorp from "./DetaliiCorp.jsx";
import styles from "./Detalii.module.css";

// Panoul de detalii al unui titlu din catalog: rămâne în pagină și se deschide cu animație;
// închis, e scos din ordinea de tab (inert).
export default function Detalii({ id, titlu, deschis }) {
  return (
    <div id={id} className={deschis ? `${styles.details} ${styles.open}` : styles.details} inert={!deschis}>
      <div>
        <DetaliiCorp titlu={titlu} />
      </div>
    </div>
  );
}
