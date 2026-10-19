const filme = [
  { id: 1, titlu: "Inception", vizionat: false, format: "movie" },
  { id: 2, titlu: "Breaking Bad", vizionat: true, format: "series" },
  { id: 3, titlu: "Spirited Away", vizionat: false, format: "animation" },
];

export default function App() {
  const deVazut = filme.filter((f) => !f.vizionat).length;

  return (
    <>
      <header className="app-header">
        <div className="beam" aria-hidden="true"></div>
        <div className="marquee">
          <h1>Plot</h1>
        </div>
        <p>Manage and organize your personal collection of movies and TV shows.</p>
        <p className="app-count">
          {filme.length} items, of which {deVazut} active
        </p>
      </header>
      <div className="filmstrip" aria-hidden="true"></div>

      <main className="container">
        <section className="panel">
          <h2>My List</h2>
          {/* Temporar: date brute; componentele apar în Etapa 4 */}
          <pre>{JSON.stringify(filme, null, 2)}</pre>
        </section>
      </main>

      <footer className="app-footer">Web Technologies Project</footer>
    </>
  );
}
