/**
 * Metadata ligera de los cuestionarios de Línea Aérea (manuales del curso).
 * Vive aparte del banco de preguntas para que el módulo pueda listarlos
 * sin descargar ~340 KB de reactivos al abrir la página.
 */
export interface LineaAereaQuiz {
  code: string;
  /** Nombre de la tarjeta (corto, como los modos del CIAAC). */
  titulo: string;
  /** Qué cubre el manual — subtítulo de la tarjeta. */
  descripcion: string;
  materia: string;
  icon: string;
  total: number;
  /** PDF fuente en Drive (visor embebible). */
  fileUrl: string;
}

/** Total del cuestionario OFICIAL de la convocatoria (fuente LAOF). */
export const LINEA_AEREA_OFICIAL_TOTAL = 377;

export const LINEA_AEREA_QUIZZES: LineaAereaQuiz[] = [
  {
    code: "ATP",
    titulo: "ATP",
    descripcion: "Airline Transport Pilot Test Prep (ASA) — banco completo por capítulos.",
    materia: "operaciones",
    icon: "doc",
    total: 1241,
    fileUrl: "https://drive.google.com/file/d/1x_BE-nE3wNp3DJ2iEqGMjcxcPxLOzuaa/preview",
  },
  {
    code: "PHAK",
    titulo: "Handbook",
    descripcion: "Pilot's Handbook of Aeronautical Knowledge (FAA-H-8083-25C) — banco por capítulos.",
    materia: "aerodinamica",
    icon: "plane",
    total: 1475,
    fileUrl: "https://drive.google.com/file/d/1It2xSBSn-vX4xYDFQHH2DMJd02J_k_zO/preview",
  },
  {
    code: "JEPP",
    titulo: "Jeppesen",
    descripcion: "General Airway Manual — banco completo por capítulos del manual.",
    materia: "navegacion",
    icon: "map",
    total: 644,
    fileUrl: "https://drive.google.com/file/d/1NdiWKEH7vqMqW5Zst_UDyAHnu5IxJMGx/preview",
  },
  {
    code: "CPAM",
    titulo: "Legislación",
    descripcion: "Compendio de legislación nacional para tripulaciones de vuelo.",
    materia: "legislacion",
    icon: "scale",
    total: 50,
    fileUrl: "https://drive.google.com/file/d/1Eq5EDfzqnKDrGDjBQtZDK26QFKp6Gfj0/preview",
  },
  {
    code: "ANX10",
    titulo: "OACI Anexo 10",
    descripcion: "Volumen II — procedimientos de comunicaciones aeronáuticas.",
    materia: "comunicaciones",
    icon: "radio",
    total: 50,
    fileUrl: "https://drive.google.com/file/d/1-m3KPCzA6lX7u4zO6_6TCAsJf_-VHyIB/preview",
  },
];

/** Nombre de la guía oficial del proceso (banco LAOF completo). */
export const LINEA_AEREA_OFICIAL = {
  titulo: "Guía de Estudio Examen de Ingreso Embraer 190 Aeroméxico Connect",
  descripcion: "Las preguntas oficiales del proceso, tal como vienen en la guía de la convocatoria.",
} as const;

/**
 * Capítulos del banco ATP (ASA Airline Transport Pilot Test Prep). El banco
 * principal es "ATP" y cada capítulo es un subconjunto seleccionable.
 */
export interface AtpChapter {
  num: number;
  titulo: string;
  tituloEn: string;
  total: number;
}

export const ATP_CHAPTERS: AtpChapter[] = [
  { num: 1, titulo: "Regulaciones", tituloEn: "Regulations", total: 355 },
  { num: 2, titulo: "Equipo, Navegación e Instalaciones", tituloEn: "Equipment, Navigation and Facilities", total: 205 },
  { num: 3, titulo: "Aerodinámica", tituloEn: "Aerodynamics", total: 106 },
  { num: 6, titulo: "Operaciones de Vuelo", tituloEn: "Flight Operations", total: 213 },
  { num: 7, titulo: "Emergencias, Peligros y Fisiología", tituloEn: "Emergencies, Hazards and Flight Physiology", total: 80 },
  { num: 8, titulo: "Meteorología y Servicios Meteorológicos", tituloEn: "Meteorology and Weather Services", total: 232 },
];

export const ATP_TOTAL = ATP_CHAPTERS.reduce((s, c) => s + c.total, 0) + 50;

/** Capítulos del Jeppesen General Airway Manual (misma lógica que ATP). */
export const JEPP_CHAPTERS: AtpChapter[] = [
  { num: 0, titulo: "Introducción", tituloEn: "Introduction", total: 50 },
  { num: 1, titulo: "Definiciones y abreviaturas", tituloEn: "Definitions and Abbreviations", total: 150 },
  { num: 2, titulo: "Leyenda de cartas", tituloEn: "Chart Legend", total: 150 },
  { num: 3, titulo: "Formato de carta", tituloEn: "Chart Format Description Information", total: 30 },
  { num: 4, titulo: "Letreros y marcas", tituloEn: "Signs and Markings", total: 100 },
  { num: 5, titulo: "Guía visual de atraque (VDGS)", tituloEn: "Visual Docking Guidance Systems", total: 150 },
  { num: 6, titulo: "NOTAM estatales", tituloEn: "Application of State NOTAMs", total: 14 },
];

export const JEPP_TOTAL = JEPP_CHAPTERS.reduce((s, c) => s + c.total, 0);
