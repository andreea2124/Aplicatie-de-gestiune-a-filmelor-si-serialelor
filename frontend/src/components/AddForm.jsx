import { useState } from "react";

// Formular pentru un titlu care nu e în catalog.
// onAdauga primește datele și întoarce un mesaj de eroare sau null dacă a mers.
export default function AddForm({ categorii, formate, onAdauga, onInchide }) {
  const [titlu, setTitlu] = useState("");
  const [format, setFormat] = useState(formate[0].id);
  const [categorie, setCategorie] = useState(categorii[0]);
  const [eroare, setEroare] = useState("");

  function trimite(e) {
    e.preventDefault();
    if (!titlu.trim()) {
      setEroare("Please enter a title.");
      return;
    }
    const rezultat = onAdauga({ titlu: titlu.trim(), format, categorie });
    if (rezultat) setEroare(rezultat);
    else onInchide();
  }

  return (
    <form className="add-form" onSubmit={trimite} noValidate>
      <label>
        Title
        <input
          type="text"
          value={titlu}
          maxLength={100}
          autoFocus
          onChange={(e) => {
            setTitlu(e.target.value);
            setEroare("");
          }}
          aria-invalid={eroare ? "true" : "false"}
        />
      </label>
      <div className="add-form-row">
        <label>
          Format
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            {formate.map((f) => (
              <option key={f.id} value={f.id}>
                {f.eticheta}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
            {categorii.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      {eroare && (
        <p className="form-error" role="alert">
          {eroare}
        </p>
      )}
      <div className="add-form-actions">
        <button type="submit" className="btn btn-primary">
          Add to My List
        </button>
        <button type="button" className="btn" onClick={onInchide}>
          Cancel
        </button>
      </div>
    </form>
  );
}
