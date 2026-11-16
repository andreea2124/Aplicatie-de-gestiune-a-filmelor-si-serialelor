import { createContext } from "react";

// Contextul cu datele aplicației (My List, catalog) și acțiunile asupra lor.
// Valoarea o dă ListaProvider; se citește cu useLista().
export const ListaContext = createContext(null);
