import { Router } from "express";
import { readFileSync } from "node:fs";
import { parseId, valideazaFilm } from "../validation.js";

const router = Router();

// Datele stau în memorie și se pierd la repornire (Etapa 10 le mută în MariaDB).
// Pornim de la elementele din lista-initiala.json (copiate din fostul db.json).
let lista = JSON.parse(readFileSync(new URL("../data/lista-initiala.json", import.meta.url), "utf8"));
let nextId = Math.max(0, ...lista.map((f) => f.id)) + 1;

// Validează :id și găsește elementul, sau răspunde cu 400 / 404
function gasesteIndex(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return -1;
  }
  const index = lista.findIndex((f) => f.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Title not found" });
  }
  return index;
}

// GET /lista
router.get("/", (req, res) => {
  res.json(lista);
});

// GET /lista/:id
router.get("/:id", (req, res) => {
  const index = gasesteIndex(req, res);
  if (index === -1) return;
  res.json(lista[index]);
});

// POST /lista
router.post("/", (req, res) => {
  const { erori, date } = valideazaFilm(req.body ?? {});
  if (erori.length > 0) {
    return res.status(400).json({ error: erori.join("; ") });
  }
  const film = { id: nextId++, ...date };
  lista.push(film);
  res.status(201).json(film);
});

// PATCH /lista/:id (modificare parțială)
router.patch("/:id", (req, res) => {
  const index = gasesteIndex(req, res);
  if (index === -1) return;
  const { erori, date } = valideazaFilm(req.body ?? {}, { partial: true });
  if (erori.length > 0) {
    return res.status(400).json({ error: erori.join("; ") });
  }
  lista[index] = { ...lista[index], ...date };
  res.json(lista[index]);
});

// DELETE /lista/:id
router.delete("/:id", (req, res) => {
  const index = gasesteIndex(req, res);
  if (index === -1) return;
  lista.splice(index, 1);
  res.status(204).end();
});

export default router;
