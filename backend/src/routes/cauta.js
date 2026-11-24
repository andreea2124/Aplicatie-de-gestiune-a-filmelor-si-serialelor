import { Router } from "express";
import { cautaTitluri, detaliiTitlu } from "../tmdb.js";
import { parseId } from "../validation.js";

const router = Router();

// GET /cauta?q=stranger -> sugestii de titluri (formularul „Custom title”)
router.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q.length < 2 || q.length > 100) {
    return res.status(400).json({ error: "q must have between 2 and 100 characters" });
  }
  res.json(await cautaTitluri(q));
});

// GET /cauta/tv/66732 -> detaliile titlului ales (tip = movie sau tv)
router.get("/:tip/:id", async (req, res) => {
  const { tip } = req.params;
  const id = parseId(req.params.id);
  if (tip !== "movie" && tip !== "tv") return res.status(400).json({ error: "tip must be movie or tv" });
  if (!id) return res.status(400).json({ error: "Invalid id" });
  res.json(await detaliiTitlu(tip, id));
});

export default router;
