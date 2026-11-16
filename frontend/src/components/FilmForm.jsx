import { useState } from "react";

const TITLU_MAX = 100;

// Formular controlat pentru un titlu care nu e în catalog: state-ul React este
// sursa de adevăr pentru câmpuri. Formularul doar validează, transmite datele prin
// onAdd (care trimite cererea la server) și afișează eroarea, dacă apare.
export default function FilmForm({ categorii, formate, onAdd }) {
  const [titlu, setTitlu] = useState("");
  const [format, setFormat] = useState(formate[0].id);
  const [categorie, setCategorie] = useState(categorii[0]);
  const [eroare, setEroare] = useState("");
  const [trimite, setTrimite] = useState(false);

  function valideaza() {
    const t = titlu.trim();
    if (t === "") return "Please enter a title.";
    if (t.length > TITLU_MAX) return `The title can have at most ${TITLU_MAX} characters.`;
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault(); // oprește reîncărcarea paginii
    const mesaj = valideaza();
    if (mesaj) {
      setEroare(mesaj);
      return;
    }
    setEroare("");
    setTrimite(true);
    try {
      await onAdd({ titlu: titlu.trim(), format, categorie });
      // golirea se face doar dacă salvarea a reușit
      setTitlu("");
      setFormat(formate[0].id);
      setCategorie(categorii[0]);
    } catch (err) {
      setEroare(err.message);
    } finally {
      setTrimite(false);
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit} noValidate data-testid="form">
      {/* banda de claptă de deasupra formularului */}
      <div className="clapper" aria-hidden="true"></div>
      <div className="add-form-head">
        <h3 className="add-form-title">Add a custom title</h3>
        <p className="add-form-kicker">Not in the catalog? Write it in yourself.</p>
      </div>
      <label>
        Title
        <input
          type="text"
          value={titlu}
          maxLength={TITLU_MAX}
          placeholder="E.g. a film that is not in the catalog"
          onChange={(e) => {
            setTitlu(e.target.value);
            setEroare("");
          }}
          aria-invalid={Boolean(eroare)}
          data-testid="form-title"
        />
      </label>
      <div className="add-form-row">
        <label>
          Format
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            data-testid="form-format"
          >
            {formate.map((f) => (
              <option key={f.id} value={f.id}>
                {f.eticheta}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            data-testid="form-categorie"
          >
            {categorii.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      {eroare && (
        <p className="form-error" role="alert" data-testid="form-error">
          {eroare}
        </p>
      )}
      <div className="add-form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={trimite}
          data-testid="form-submit"
        >
          {trimite ? "Saving..." : "+ Add to My List"}
        </button>
      </div>
    </form>
  );
}
