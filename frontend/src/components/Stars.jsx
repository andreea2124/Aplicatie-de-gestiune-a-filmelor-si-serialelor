// Rating cu 5 steluțe. Apăsarea stelei curente scoate ratingul.
export default function Stars({ valoare, onSeteaza, titlu }) {
  return (
    <div className="stars" role="group" aria-label={`Rating for ${titlu}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= valoare ? "star on" : "star"}
          onClick={() => onSeteaza(n)}
          aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          aria-pressed={n === valoare}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
}
