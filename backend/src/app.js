import express from "express";
import cors from "cors";
import cautaRouter from "./routes/cauta.js";
import filmeRouter from "./routes/filme.js";
import listaRouter from "./routes/lista.js";

const app = express();

// CORS: browserul blochează cererile de pe :5173 către :3001
// dacă serverul nu spune explicit că le permite
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));

// Transformă corpul JSON al cererii în req.body
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/filme", filmeRouter); // catalogul, doar citire
app.use("/lista", listaRouter); // My List, CRUD
app.use("/cauta", cautaRouter); // sugestii și detalii de la TMDB, pentru formularul „Custom title”

// Rută necunoscută
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Tratare centralizată a erorilor (Express 5 trimite aici și erorile async,
// iar un JSON invalid în corp ajunge aici cu status 400)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? "Internal server error" : err.message });
});

export default app;
