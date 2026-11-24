// Încarcă variabilele din backend/.env (dacă fișierul există): PORT, CORS_ORIGIN, TMDB_API_KEY.
// Trebuie importat primul în server.js, pentru că app.js citește CORS_ORIGIN în momentul încărcării.
// Variabilele deja setate în mediu au prioritate față de fișier.
try {
  process.loadEnvFile(new URL("../.env", import.meta.url));
} catch (err) {
  if (err.code !== "ENOENT") throw err; // fără .env se folosesc valorile implicite
}
