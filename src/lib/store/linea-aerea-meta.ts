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
    total: 1191,
    fileUrl: "https://drive.google.com/file/d/1x_BE-nE3wNp3DJ2iEqGMjcxcPxLOzuaa/preview",
  },
  {
    code: "PHAK",
    titulo: "Handbook",
    descripcion: "Pilot's Handbook of Aeronautical Knowledge (FAA-H-8083-25C) — banco por capítulos.",
    materia: "aerodinamica",
    icon: "plane",
    total: 2400,
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
    code: "LEG",
    titulo: "Legislación",
    descripcion: "Legislación aeronáutica mexicana — banco por capítulos (LAC, reglamentos, LFT, circulares).",
    materia: "legislacion",
    icon: "scale",
    total: 240,
    fileUrl: "https://drive.google.com/file/d/1Eq5EDfzqnKDrGDjBQtZDK26QFKp6Gfj0/preview",
  },
  {
    code: "CPAM",
    titulo: "Compendio CPAM",
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

export const ATP_TOTAL = ATP_CHAPTERS.reduce((s, c) => s + c.total, 0);

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

/** Capítulos del Pilot's Handbook of Aeronautical Knowledge (FAA-H-8083-25C). */
export const PHAK_CHAPTERS: AtpChapter[] = [
  { num: 2, titulo: "Toma de Decisiones Aeronáuticas", tituloEn: "Aeronautical Decision-Making", total: 185 },
  { num: 3, titulo: "Construcción de la Aeronave", tituloEn: "Aircraft Construction", total: 85 },
  { num: 4, titulo: "Principios de Vuelo", tituloEn: "Principles of Flight", total: 85 },
  { num: 5, titulo: "Aerodinámica del Vuelo", tituloEn: "Aerodynamics of Flight", total: 240 },
  { num: 6, titulo: "Controles de Vuelo", tituloEn: "Flight Controls", total: 85 },
  { num: 7, titulo: "Sistemas de la Aeronave", tituloEn: "Aircraft Systems", total: 230 },
  { num: 8, titulo: "Instrumentos de Vuelo", tituloEn: "Flight Instruments", total: 165 },
  { num: 9, titulo: "Manuales de Vuelo y Otros Documentos", tituloEn: "Flight Manuals and Other Documents", total: 85 },
  { num: 10, titulo: "Peso y Balance", tituloEn: "Weight and Balance", total: 100 },
  { num: 11, titulo: "Desempeño de la Aeronave", tituloEn: "Aircraft Performance", total: 165 },
  { num: 12, titulo: "Teoría Meteorológica", tituloEn: "Weather Theory", total: 150 },
  { num: 13, titulo: "Servicios Meteorológicos Aeronáuticos", tituloEn: "Aviation Weather Services", total: 140 },
  { num: 14, titulo: "Operaciones en Aeródromo", tituloEn: "Airport Operations", total: 225 },
  { num: 15, titulo: "Espacio Aéreo", tituloEn: "Airspace", total: 100 },
  { num: 16, titulo: "Navegación", tituloEn: "Navigation", total: 195 },
  { num: 17, titulo: "Factores Aeromédicos", tituloEn: "Aeromedical Factors", total: 165 },
];

export const PHAK_TOTAL = PHAK_CHAPTERS.reduce((s, c) => s + c.total, 0);

/** Capítulos del banco de Legislación aeronáutica mexicana (fuente LEG). */
/** Fuentes oficiales del banco de Legislación (texto vigente publicado). */
export const LEG_PDFS: readonly { label: string; url: string }[] = [
  { label: "Ley de Aviación Civil", url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LAC.pdf" },
  { label: "Reglamento de la Ley de Aviación Civil", url: "https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LAC.pdf" },
  { label: "Reglamento de la Ley de Aeropuertos", url: "https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LAero.pdf" },
  { label: "Reglamento de Medicina de Aviación Civil", url: "https://www.gob.mx/cms/uploads/attachment/file/849276/decreto-expide-reglamento-medicina-aviacion-02082023.pdf" },
  { label: "Ley Aduanera", url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LAdua.pdf" },
  { label: "Reglamento de la Ley Aduanera", url: "https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LAdua.pdf" },
  { label: "Ley Federal del Trabajo", url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf" },
  { label: "Circular Obligatoria CO AV-12.1/07 R5", url: "https://www.gob.mx/cms/uploads/attachment/file/778808/co-av-12-1-07-r5.pdf" },
  { label: "Circular Obligatoria CO SA-17.2/10 R3", url: "https://www.aicm.com.mx/informacionalpasajero/archivos/cosa-17_2-10r3.pdf" },
];

export const LEG_CHAPTERS: AtpChapter[] = [
  { num: 1, titulo: "Ley de Aviación Civil", tituloEn: "Ley de Aviación Civil", total: 35 },
  { num: 2, titulo: "Reglamento de la Ley de Aviación Civil", tituloEn: "Reglamento de la Ley de Aviación Civil", total: 80 },
  { num: 3, titulo: "Reglamento de la Ley de Aeropuertos", tituloEn: "Reglamento de la Ley de Aeropuertos", total: 25 },
  { num: 4, titulo: "Reglamento de Medicina de Aviación Civil", tituloEn: "Reglamento de Medicina de Aviación Civil", total: 12 },
  { num: 5, titulo: "Ley Aduanera", tituloEn: "Ley Aduanera", total: 10 },
  { num: 6, titulo: "Reglamento de la Ley Aduanera", tituloEn: "Reglamento de la Ley Aduanera", total: 8 },
  { num: 7, titulo: "Ley Federal del Trabajo", tituloEn: "Ley Federal del Trabajo", total: 50 },
  { num: 8, titulo: "Circulares obligatorias", tituloEn: "Circulares obligatorias", total: 20 },
];

export const LEG_TOTAL = LEG_CHAPTERS.reduce((s, c) => s + c.total, 0);

/* ─── Módulo "Manuales de Aeronave" ──────────────────────────────
 * Bancos por tipo de avión. Viven en su propio módulo del sidebar, pero
 * comparten toda la maquinaria de Línea Aérea (cuestionario por capítulos,
 * auditoría, analítica y panel admin).
 */

/** Capítulos del Boeing 737 MAX FCOM (Flight Crew Operations Manual). */
export const B737MAX_CHAPTERS: AtpChapter[] = [
  { num: 1, titulo: "Limitaciones y procedimientos normales", tituloEn: "Limitations and Normal Procedures", total: 250 },
  { num: 2, titulo: "Procedimientos suplementarios", tituloEn: "Supplementary Procedures", total: 250 },
  { num: 3, titulo: "Rendimiento para despacho", tituloEn: "Performance Dispatch", total: 250 },
  { num: 4, titulo: "Rendimiento en vuelo", tituloEn: "Performance Inflight", total: 250 },
  { num: 5, titulo: "Célula, sistemas de aire, antihielo y protección contra incendio", tituloEn: "Airframe, Air Systems, Anti-Ice and Fire Protection", total: 300 },
  { num: 6, titulo: "Vuelo automático, controles de vuelo, comunicaciones y sistema eléctrico", tituloEn: "Automatic Flight, Flight Controls, Communications and Electrical", total: 400 },
  { num: 7, titulo: "Motores, APU, combustible, hidráulicos y tren de aterrizaje", tituloEn: "Engines, APU, Fuel, Hydraulics and Landing Gear", total: 250 },
  { num: 8, titulo: "Instrumentos de vuelo y pantallas", tituloEn: "Flight Instruments and Displays", total: 250 },
  { num: 9, titulo: "Gestión de vuelo, navegación y sistemas de advertencia", tituloEn: "Flight Management, Navigation and Warning Systems", total: 300 },
];

export const B737MAX_TOTAL = B737MAX_CHAPTERS.reduce((s, c) => s + c.total, 0);

/** Manuales de aeronave disponibles (una tarjeta por tipo de avión). */
export const AERONAVE_QUIZZES: LineaAereaQuiz[] = [
  {
    code: "B737MAX",
    titulo: "Boeing 737 MAX",
    descripcion: "FCOM del 737 MAX — limitaciones, procedimientos, rendimiento y sistemas, por capítulos.",
    materia: "aeronaves-motores",
    icon: "plane",
    total: B737MAX_TOTAL,
    fileUrl: "",
  },
];

/** Todos los manuales del sistema (Línea Aérea + Aeronave). */
export const ALL_MANUAL_QUIZZES: LineaAereaQuiz[] = [
  ...LINEA_AEREA_QUIZZES,
  ...AERONAVE_QUIZZES,
];

const AERONAVE_CODES = new Set(AERONAVE_QUIZZES.map((q) => q.code));

/** ¿La fuente pertenece al módulo de Manuales de Aeronave? */
export function isAeronaveFuente(code?: string | null): boolean {
  return !!code && AERONAVE_CODES.has(code);
}

/** Nombre legible de cualquier manual (Línea Aérea o Aeronave). */
export function manualTitulo(code: string): string {
  return ALL_MANUAL_QUIZZES.find((q) => q.code === code)?.titulo ?? code;
}
