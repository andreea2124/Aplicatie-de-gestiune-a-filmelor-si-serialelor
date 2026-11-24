import "./env.js"; // întâi: încarcă .env, înainte ca app.js să citească CORS_ORIGIN
import app from "./app.js";

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
