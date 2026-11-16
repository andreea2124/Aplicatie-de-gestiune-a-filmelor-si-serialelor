import { useContext } from "react";
import { ListaContext } from "./ListaContext.js";

// Datele și acțiunile listei, pentru orice componentă aflată sub ListaProvider.
export function useLista() {
  const context = useContext(ListaContext);
  if (!context) throw new Error("useLista trebuie folosit sub ListaProvider");
  return context;
}
