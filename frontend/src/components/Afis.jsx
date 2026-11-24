import { useState } from "react";
import { formateazaDurata } from "../logica.js";
import styles from "./Afis.module.css";

// Afișul desenat din CSS (varianta de rezervă, când un titlu nu are poster real): un gradient
// maro pe categorie, un motiv ales după id și o mică variație de nuanță, ca afișele să nu fie identice.
const PALETA = {
  Action: ["#7d2f1a", "#d47b45"],
  Comedy: ["#8a5a14", "#e4b55a"],
  Drama: ["#3e2219", "#9a6248"],
  Romance: ["#7c3f3d", "#d9a08a"],
  Thriller: ["#17120e", "#5e4c3b"],
  SF: ["#23302e", "#87917f"],
};

function stilAfis({ id = 0, categorie }) {
  const [a, b] = PALETA[categorie] ?? PALETA.Drama;
  const unghi = 150 + ((id * 37) % 60);
  const motive = [
    `radial-gradient(circle at 70% 30%, ${b}cc 0 18%, transparent 18.5%)`,
    `repeating-linear-gradient(${unghi}deg, rgba(255,255,255,.07) 0 10px, transparent 10px 22px)`,
    `repeating-radial-gradient(circle at 50% 110%, rgba(255,255,255,.08) 0 2px, transparent 2px 18px)`,
    `linear-gradient(0deg, transparent 58%, rgba(0,0,0,.25) 58% 60%, transparent 60% 66%, rgba(0,0,0,.25) 66% 68%, transparent 68%)`,
  ];
  const nuanta = ((id * 53) % 30) - 15;
  const lumina = 0.85 + ((id * 29) % 30) / 100;
  return {
    background: `${motive[id % 4]}, linear-gradient(${unghi}deg, ${a}, ${b})`,
    filter: `hue-rotate(${nuanta}deg) brightness(${lumina})`,
  };
}

// Textul mic de jos: sezoanele la seriale, altfel durata.
function detaliuAfis(t) {
  if (t.sezoane) return `${t.sezoane.length} ${t.sezoane.length === 1 ? "season" : "seasons"}`;
  return t.durata ? formateazaDurata(t.durata) : "";
}

// Posterele vin de la TMDB: în catalog se păstrează doar calea imaginii (`poster`, de exemplu
// "/abc.jpg"), iar adresa completă se construiește aici. w342 ajunge pentru grilă, w500 pentru pagina titlului.
const BAZA_POSTER = "https://image.tmdb.org/t/p";

// titlu = un titlu din catalog (sau din listă); mare = varianta din pagina de detaliu.
// Dacă titlul are poster, imaginea apare peste afișul desenat când s-a încărcat; până atunci
// (sau dacă nu se încarcă deloc) se vede afișul desenat, cu titlul scris pe el.
// Afișul e decorativ: titlul e scris și în altă parte, deci cititoarele de ecran îl sar.
export default function Afis({ titlu, mare = false }) {
  // încărcat = imaginea reală e gata; esuat = nu s-a putut încărca
  const [incarcat, setIncarcat] = useState(false);
  const [esuat, setEsuat] = useState(false);
  const [posterAnterior, setPosterAnterior] = useState(titlu.poster);

  // același component poate primi alt titlu (navigare între titluri asemănătoare)
  if (posterAnterior !== titlu.poster) {
    setPosterAnterior(titlu.poster);
    setIncarcat(false);
    setEsuat(false);
  }

  const cuPoster = Boolean(titlu.poster) && !esuat;
  const clase = [styles.afis, mare && styles.mare, cuPoster && incarcat && styles.cuPoster].filter(Boolean).join(" ");

  return (
    <div className={clase} aria-hidden="true">
      <div className={styles.fundal} style={stilAfis(titlu)}></div>
      {cuPoster && (
        <img
          className={styles.poster}
          src={`${BAZA_POSTER}/${mare ? "w500" : "w342"}${titlu.poster}`}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setIncarcat(true)}
          onError={() => setEsuat(true)}
        />
      )}
      <span className={styles.an}>{titlu.an ?? ""}</span>
      <span className={styles.titlu}>{titlu.titlu}</span>
      <span className={styles.meta}>{detaliuAfis(titlu)}</span>
    </div>
  );
}
