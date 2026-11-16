import { useLista } from "../useLista.js";
import styles from "./Toast.module.css";

// Mesajul scurt de jos („Gladiator added to My List”, „Removed Die Hard · Undo”).
// Se închide singur după câteva secunde; actiunea (Undo) e opțională.
export default function Toast() {
  const { toast, inchideToast } = useLista();
  if (!toast) return null;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span>
        {toast.prefix} <b>{toast.titlu}</b> {toast.text}
      </span>
      {toast.actiune && (
        <button
          type="button"
          className={styles.undo}
          onClick={() => {
            inchideToast();
            toast.actiune.onClick();
          }}
        >
          {toast.actiune.eticheta}
        </button>
      )}
    </div>
  );
}
