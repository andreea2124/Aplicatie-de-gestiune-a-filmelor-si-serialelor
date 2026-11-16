// Ruleta din Random pick: banda de titluri se derulează și se oprește pe cel ales
// (ultimul din bandă). onGata(true) se apelează când s-a oprit.
import { useEffect, useState } from "react";

export default function Ruleta({ banda, onGata }) {
  const [pornit, setPornit] = useState(false);

  useEffect(() => {
    // două cadre: întâi se desenează banda în poziția de start, apoi pornește tranziția
    let cadru = requestAnimationFrame(() => {
      cadru = requestAnimationFrame(() => setPornit(true));
    });
    // rezervă, dacă tranziția nu trimite transitionend
    const rezerva = setTimeout(() => onGata(true), 3400);
    return () => {
      cancelAnimationFrame(cadru);
      clearTimeout(rezerva);
    };
  }, [onGata]);

  // încă un titlu după cel ales, ca rândul de sub el să nu fie gol
  const randuri = [...banda, banda[0]];

  return (
    <div className="reel" aria-hidden="true">
      <div className="reel-window">
        <ul
          className="reel-strip"
          style={{
            transform: pornit ? `translateY(calc(-${banda.length - 1} * var(--reel-h)))` : "none",
          }}
          onTransitionEnd={(e) => e.target === e.currentTarget && onGata(true)}
        >
          {randuri.map((t, i) => (
            <li key={i}>{t.titlu}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
