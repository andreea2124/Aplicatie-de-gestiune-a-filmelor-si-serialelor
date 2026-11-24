import { Router } from "express";
import { readFileSync } from "node:fs";
import { parseId, valideazaTitluCatalog } from "../validation.js";

const router = Router();

// Catalogul: pornește de la catalog.json și crește când se adaugă titluri scrise de mână.
// Titlurile noi stau în memorie și se pierd la repornire, odată cu My List, deci nu rămân referințe
// rupte (Etapa 10 le mută în MariaDB: POST /filme devine un INSERT).
const catalog = JSON.parse(readFileSync(new URL("../data/catalog.json", import.meta.url), "utf8"));
let nextId = Math.max(0, ...catalog.map((t) => t.id)) + 1;
const norm = (text) => text.trim().toLowerCase();

// GET /filme
router.get("/", (req, res) => {
  res.json(catalog);
});

// GET /filme/:id
router.get("/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });
  const titlu = catalog.find((t) => t.id === id);
  if (!titlu) return res.status(404).json({ error: "Title not found" });
  res.json(titlu);
});

// POST /filme: adaugă un titlu în catalog. Un titlu scris de mână în formular intră aici, cu detaliile
// de la TMDB dacă s-a ales unul dintre sugestii. Dacă există deja (același id IMDb, sau același titlu și
// format), se întoarce cel existent, cu 200, ca să nu se dubleze.
router.post("/", (req, res) => {
  const { erori, date } = valideazaTitluCatalog(req.body ?? {});
  if (erori.length > 0) {
    return res.status(400).json({ error: erori.join("; ") });
  }
  const existent = catalog.find(
    (t) => (date.imdb && t.imdb === date.imdb) || (norm(t.titlu) === norm(date.titlu) && t.format === date.format),
  );
  if (existent) return res.json(existent);
  const titlu = { id: nextId++, ...date };
  catalog.push(titlu);
  res.status(201).json(titlu);
});

export default router;
