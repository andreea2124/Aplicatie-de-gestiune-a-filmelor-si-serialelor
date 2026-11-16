import { Route, Routes } from "react-router-dom";
import ListaProvider from "./ListaProvider.jsx";
import Layout from "./components/Layout.jsx";
import FilmePage from "./pages/FilmePage.jsx";
import FilmDetaliuPage from "./pages/FilmDetaliuPage.jsx";
import DesprePage from "./pages/DesprePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Harta rutelor. Layout înconjoară fiecare pagină, iar ListaProvider dă tuturor datele listei.
// Ruta de detaliu folosește numele resursei din tw.json: /lista/:id
export default function App() {
  return (
    <ListaProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<FilmePage />} />
          <Route path="/lista/:id" element={<FilmDetaliuPage />} />
          <Route path="/despre" element={<DesprePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ListaProvider>
  );
}
