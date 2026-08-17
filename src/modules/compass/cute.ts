/**
 * Contexto de la batería CUT-E (hoy AON Assessment) para el módulo de
 * aptitudes.
 *
 * Es material de referencia, no contenido de examen: describe cómo está armada
 * una batería de screening en línea, qué familia de aptitud mide cada bloque y
 * con qué ejercicio propio de FlightPath se entrena esa familia.
 *
 * Regla de compliance (ver `COMPLIANCE.md` §5): los nombres de las pruebas se
 * citan con uso informativo — nunca se afirma que FlightPath las replica, las
 * contiene o equivale a ellas, y ningún ejercicio del módulo sale de esa
 * batería. Los ejercicios son originales y generados proceduralmente.
 */
import type { CompassModuleId } from "./types";

/** Hitos de la batería, para la ficha de contexto del hub. */
export const CUTE_HISTORIA: { año: string; texto: string }[] = [
  {
    año: "2002",
    texto:
      "Nacen las primeras pruebas cut-e: evaluación cognitiva pensada desde el inicio para aplicarse en línea, sin presencia física del candidato.",
  },
  {
    año: "Screening",
    texto:
      "Se popularizan como filtro previo, porque abaratan procesos donde se presentan cientos de aspirantes por vacante. Reglas simples y estética de videojuego — la sencillez aparente esconde un corte severo.",
  },
  {
    año: "2017",
    texto:
      "El grupo AON adquiere cut-e y la integra a su suite de evaluación profesional. De ahí que hoy las mismas pruebas aparezcan nombradas como AON Assessment o AON Aviation Suite.",
  },
  {
    año: "Hoy",
    texto:
      "Se usan en todo el mundo para seleccionar pilotos, tanto en aerolíneas como en escuelas de aviación — incluida la evaluación AON del proceso de Primer Oficial que ya conoces.",
  },
];

export interface CuteFamilia {
  /** Familia de aptitud que evalúa el bloque. */
  familia: string;
  /** Qué se pone a prueba, en una línea. */
  queMide: string;
  /** Nombres públicos de las pruebas del bloque (referencia informativa). */
  pruebas: string[];
  /** Módulos propios de FlightPath que entrenan esa familia. */
  modulos: CompassModuleId[];
  /** Texto alterno cuando la familia todavía no tiene módulo propio. */
  pendiente?: string;
}

/**
 * Los seis bloques de la batería y su correspondencia con los ejercicios
 * propios. Las pruebas se listan por su nombre público; el entrenamiento de
 * cada familia se hace con los módulos originales de FlightPath.
 */
export const CUTE_FAMILIAS: CuteFamilia[] = [
  {
    familia: "Atención",
    queMide:
      "Velocidad de reacción y detección de diferencias bajo presión de tiempo, sosteniendo la concentración en series largas.",
    pruebas: ["Reaction rate", "E with three dots", "Spot the differences"],
    modulos: ["multitarea", "control"],
  },
  {
    familia: "Espacial",
    queMide:
      "Construir una imagen mental de dónde estás y hacia dónde vas a partir de instrumentos y estímulos en movimiento.",
    pruebas: ["Navigation — sense of direction", "Moving dots", "Relative bearing indicator"],
    modulos: ["orientacion"],
  },
  {
    familia: "Destreza psicomotriz",
    queMide:
      "Pilotar un objeto con inercia y hacerlo mientras atiendes una segunda tarea: coordinación mano-ojo continua.",
    pruebas: ["Runway multi-tasks", "Tube flight", "Flower pot", "Triangle"],
    modulos: ["control", "slalom"],
  },
  {
    familia: "Numérica",
    queMide: "Aritmética mental rápida, lectura de datos numéricos y estimación sin calculadora.",
    pruebas: ["Numeracy", "Mathematics", "Relative bearing indicator"],
    modulos: ["calculo"],
  },
  {
    familia: "Memoria",
    queMide:
      "Retener bloques de información breve y reproducirlos exactos después de una interferencia.",
    pruebas: ["Memory", "Find the missing shape"],
    modulos: ["memoria"],
  },
  {
    familia: "Razonamiento lógico",
    queMide:
      "Inferir la regla que gobierna una serie de figuras y completarla — el bloque tipo test de inteligencia.",
    pruebas: ["Inductive logical thinking", "Find the missing shape"],
    modulos: [],
    pendiente: "En preparación — llegará como módulo propio de series lógicas.",
  },
];

/**
 * Aerolíneas y escuelas que usan la batería en su selección de pilotos, según
 * información pública de cada proceso. Lista no exhaustiva y sujeta a cambio:
 * cada empresa decide sus pruebas y puede dejar de usarlas sin aviso.
 */
export const CUTE_OPERADORES: string[] = [
  "Aer Lingus",
  "easyJet",
  "Dragonair (cadetes)",
  "Swiss (DEC)",
  "Etihad",
  "Jet2.com",
  "L3/CTC",
  "Norwegian",
  "Scoot",
  "Thai Airways",
  "Finnair",
  "FlyDubai",
];
