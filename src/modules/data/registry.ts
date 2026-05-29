import type { TemaJSON } from "../engine/types";

import aero11 from "./aerodinamica/tema-1-1.json";
import aero12 from "./aerodinamica/tema-1-2.json";
import aero13 from "./aerodinamica/tema-1-3.json";
import aero14 from "./aerodinamica/tema-1-4.json";
import aero15 from "./aerodinamica/tema-1-5.json";
import aero21 from "./aerodinamica/tema-2-1.json";
import aero22 from "./aerodinamica/tema-2-2.json";
import meteo11 from "./meteorologia/tema-1-1.json";

export interface TemaEntry {
  id: string;
  bloque: number;
  bloque_titulo: string;
  tema: number;
  title: string;
  duracion_min: number;
}

// Map of tema ID → full TemaJSON object
export const TEMA_REGISTRY: Record<string, TemaJSON> = {
  "aerodinamica-1-1": aero11 as TemaJSON,
  "aerodinamica-1-2": aero12 as TemaJSON,
  "aerodinamica-1-3": aero13 as TemaJSON,
  "aerodinamica-1-4": aero14 as TemaJSON,
  "aerodinamica-1-5": aero15 as TemaJSON,
  "aerodinamica-2-1": aero21 as TemaJSON,
  "aerodinamica-2-2": aero22 as TemaJSON,
  "meteorologia-1-1": meteo11 as TemaJSON,
};

// Map of subject slug → ordered list of tema metadata
export const SUBJECT_TEMAS: Record<string, TemaEntry[]> = {
  aerodinamica: [
    { id: "aerodinamica-1-1", bloque: 1, bloque_titulo: "Fundamentos del Aire", tema: 1, title: "Los fluidos y sus propiedades", duracion_min: 12 },
    { id: "aerodinamica-1-2", bloque: 1, bloque_titulo: "Fundamentos del Aire", tema: 2, title: "Flujo laminar, turbulento y capa límite", duracion_min: 14 },
    { id: "aerodinamica-1-3", bloque: 1, bloque_titulo: "Fundamentos del Aire", tema: 3, title: "Densidad del aire y altitud densimétrica", duracion_min: 14 },
    { id: "aerodinamica-1-4", bloque: 1, bloque_titulo: "Fundamentos del Aire", tema: 4, title: "Leyes de Newton y factor de carga", duracion_min: 13 },
    { id: "aerodinamica-1-5", bloque: 1, bloque_titulo: "Fundamentos del Aire", tema: 5, title: "Bernoulli, continuidad y Pitot", duracion_min: 14 },
    { id: "aerodinamica-2-1", bloque: 2, bloque_titulo: "Las 4 fuerzas del vuelo", tema: 1, title: "Las 4 fuerzas del vuelo", duracion_min: 15 },
    { id: "aerodinamica-2-2", bloque: 2, bloque_titulo: "Las 4 fuerzas del vuelo", tema: 2, title: "Sustentación — fórmula, CL y ángulo de ataque", duracion_min: 16 },
  ],
  meteorologia: [
    { id: "meteorologia-1-1", bloque: 1, bloque_titulo: "La Atmósfera", tema: 1, title: "Atmósfera, capas y atmósfera estándar ISA", duracion_min: 14 },
  ],
};
