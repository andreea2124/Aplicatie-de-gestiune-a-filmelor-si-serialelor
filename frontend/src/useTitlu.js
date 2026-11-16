import { useEffect } from "react";

// Pune titlul paginii în fila browserului: „My List · Plot”.
export function useTitlu(titlu) {
  useEffect(() => {
    document.title = titlu ? `${titlu} · Plot` : "Plot";
  }, [titlu]);
}
