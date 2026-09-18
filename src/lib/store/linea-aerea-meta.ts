/**
 * Metadata ligera de los cuestionarios de Línea Aérea (manuales del curso).
 * Vive aparte del banco de preguntas para que el módulo pueda listarlos
 * sin descargar ~340 KB de reactivos al abrir la página.
 */
import type { BankQuestion } from "./types";
import type { BankCount } from "./questions-cloud";

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

/**
 * Código de `fuente` reservado para el examen oficial de Línea Aérea.
 * Vive aquí (y no en seed-linea-aerea-oficial.ts) para que importar el código
 * no arrastre las ~217 KB de reactivos al chunk de entrada: simulador.tsx y
 * cuestionario.tsx solo necesitan el string.
 */
export const LA_OFICIAL_FUENTE = "LAOF";

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
    descripcion:
      "General Airway Manual — los 8 bloques del temario: definiciones, cartas, señales, radioayudas, procedimientos, marco OACI, PBN y emergencias.",
    materia: "navegacion",
    icon: "map",
    total: 1543,
    fileUrl: "https://drive.google.com/file/d/1NdiWKEH7vqMqW5Zst_UDyAHnu5IxJMGx/preview",
  },
  {
    code: "LEG",
    titulo: "Legislación",
    descripcion:
      "Legislación nacional e internacional por ordenamiento: Constitución, convenios, Ley de Aviación Civil y sus reglamentos, aduanas, LFT y circulares obligatorias.",
    materia: "legislacion",
    icon: "scale",
    total: 371,
    fileUrl: "https://drive.google.com/file/d/1Eq5EDfzqnKDrGDjBQtZDK26QFKp6Gfj0/preview",
  },

  {
    code: "ANX10",
    titulo: "OACI Anexo 10",
    descripcion: "Volumen II — procedimientos de comunicaciones aeronáuticas, por capítulos del Anexo.",
    materia: "comunicaciones",
    icon: "radio",
    total: 352,
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
  /**
   * Reactivos del capítulo en el banco. Es el valor de referencia (se muestra
   * cuando la nube no responde); `fetchBankCounts` lo actualiza en vivo. Un 0
   * marca un capítulo del temario que todavía no tiene reactivos.
   */
  total: number;
  /** Texto secundario para la UI cuando dice más que la traducción (ej. artículos de una ley). */
  detalle?: string;
  /** Subdivisiones seleccionables dentro del capítulo (p. ej. Bloque 1 de Jeppesen). */
  subsections?: readonly {
    key: string;
    titulo: string;
    tituloEn: string;
    total: number;
  }[];
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

/* ─── Reactivos de helicóptero (banco ATP) ───────────────────────
 * El ATP de ASA mezcla helicóptero dentro de capítulos de avión: la sección
 * "Helicopter Regulations" del Cap. 1, "Helicopter Aerodynamics" del Cap. 3 y
 * reactivos sueltos de Part 135 para rotorcraft. La convocatoria de Primer
 * Oficial es de ala fija, así que el selector de capítulos ofrece dejarlos
 * fuera. No hay marca en el banco: se detectan por la sección y por el texto.
 */

/** Señales inequívocas: cuentan en cualquier campo, incluida la explicación. */
const HELI_FUERTE = /helic[oó]pter|rotorcraft|autor+otaci[oó]n|autorotation|heliport|helipuerto/i;

/**
 * Señales de contexto (rotor de cola, vuelo estacionario, cíclico…): solo
 * cuentan en la pregunta, sus opciones y la sección. Un "rotor" suelto NO
 * vale: el Cap. 8 habla de nubes rotor (turbulencia de onda de montaña).
 */
const HELI_CONTEXTO = new RegExp(
  [
    "(main|tail|anti-?torque)\\s+rotor",
    "rotor\\s+(principal|de\\s+cola|blades?|disc|disk|rpm|system|wash)",
    "\\bhover(ing|s)?\\b",
    "vuelo\\s+estacionario",
    "translational\\s+lift",
    "dissymmetry\\s+of\\s+lift",
    "retreating\\s+blade",
    "pala\\s+en\\s+retroceso",
    "settling\\s+with\\s+power",
    "vortex\\s+ring",
    "ground\\s+resonance",
    "resonancia\\s+con\\s+el\\s+suelo",
    "dynamic\\s+rollover",
    "\\bcyclic\\b",
    "\\bcollective\\b",
    "\\bc[ií]clic[oa]\\b",
    "\\bcolectivo\\b",
    "gyroplane",
    "autogiro",
  ].join("|"),
  "i",
);

/** true cuando el reactivo trata de helicópteros (se quita con "sin helicópteros"). */
export function esPreguntaHelicoptero(
  q: Pick<BankQuestion, "text" | "options" | "explanation" | "cite" | "seccion" | "capituloTitulo">,
): boolean {
  const cabecera = [q.seccion, q.capituloTitulo, q.text, ...(q.options ?? []), q.cite]
    .filter(Boolean)
    .join("\n");
  if (HELI_FUERTE.test(cabecera) || HELI_CONTEXTO.test(cabecera)) return true;
  return !!q.explanation && HELI_FUERTE.test(q.explanation);
}

/**
 * Bloques del Jeppesen General Airway Manual, según el temario de la
 * convocatoria (8 bloques temáticos; el manual se estudia por bloque, no por
 * capítulo del libro). Los totales parten del banco anterior (7 capítulos de la
 * sección Introduction) reubicado en los bloques 1 a 3; los bloques 4 a 8 son
 * temario nuevo y arrancan sin reactivos.
 */
export const JEPP_CHAPTERS: AtpChapter[] = [
  {
    num: 1,
    titulo: "Lenguaje Jeppesen",
    tituloEn: "Jeppesen Language",
    total: 731,
    subsections: [
      { key: "Definitions", titulo: "Definiciones", tituloEn: "Definitions", total: 306 },
      { key: "Abbreviations", titulo: "Abreviaturas", tituloEn: "Abbreviations", total: 425 },
    ],
  },
  { num: 2, titulo: "Simbología y Lectura de Cartas", tituloEn: "NAVAID symbols, altitudes and speeds in the planview, Enroute / SID-STAR / Airport / Approach chart legends, EASA AIR OPS", total: 93 },
  { num: 3, titulo: "Señales y Marcas de Aeródromo", tituloEn: "Signs and Markings — United States and ICAO", total: 140 },
  { num: 4, titulo: "Radioayudas y Fundamentos de Radiocomunicación", tituloEn: "Frequency bands and allocation, airborne stations, ATC operations, range of radio transmission, Navigation Aids", total: 137 },
  { num: 5, titulo: "Procedimientos de Vuelo", tituloEn: "Departure, en-route, arrival, approach and holding procedures; altimeter setting, SSR, noise abatement, Mach number technique", total: 203 },
  { num: 6, titulo: "Marco Normativo ICAO y Gestión del Tránsito Aéreo", tituloEn: "Annex 2, Annex 11, Annex 10, Air Traffic Management (Doc 4444) and its appendices", total: 101 },
  { num: 7, titulo: "PBN, Vigilancia y Enlace de Datos", tituloEn: "Performance-Based Navigation and RNAV, surveillance systems, PBCS (Doc 9869), CPDLC", total: 73 },
  { num: 8, titulo: "Emergencias y Contingencias", tituloEn: "Distress and urgency, unlawful interference, emergency descent, communication failure, interception, SAR, fuel emergencies", total: 65 },
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

/**
 * Capítulos de Legislación según el temario: un capítulo por ordenamiento, en
 * el orden del documento. `detalle` recoge los artículos que entran. Los
 * totales parten del banco anterior (Art. 32 y convenios internacionales,
 * capítulos 1 a 5) reubicado en los capítulos 1 y 2; el resto arranca sin
 * reactivos en la nube.
 */
export const LEG_CHAPTERS: AtpChapter[] = [
  { num: 1, titulo: "Constitución Política de los Estados Unidos Mexicanos", tituloEn: "Political Constitution of the United Mexican States", detalle: "Artículo 32", total: 5 },
  { num: 2, titulo: "Convenios internacionales", tituloEn: "International Conventions", detalle: "Chicago y Anexos OACI, Varsovia, Montreal, Tokio, La Haya", total: 93 },
  { num: 3, titulo: "Ley de Aviación Civil", tituloEn: "Civil Aviation Law", detalle: "Arts. 3, 7, 17 Bis, 32 a 38, 40 a 41, 70 a 71, 79 a 82, 88 a 90", total: 38 },
  { num: 4, titulo: "Reglamento de la Ley de Aviación Civil", tituloEn: "Civil Aviation Law Regulations", detalle: "Arts. 43 a 47, 77 a 86, 103 a 105, 111 a 120, 131, 158 a 162, 168 a 187, 196 a 197", total: 67 },
  { num: 5, titulo: "Reglamento de la Ley de Aeropuertos", tituloEn: "Airports Law Regulations", detalle: "Arts. 6, 104 a 115, 156, 169", total: 23 },
  { num: 6, titulo: "Reglamento de Medicina de Aviación Civil", tituloEn: "Civil Aviation Medicine Regulations", detalle: "Arts. 13 a 17 — evaluación médica al personal técnico aeronáutico y aspirantes", total: 12 },
  { num: 7, titulo: "Ley Aduanera", tituloEn: "Customs Law", detalle: "Arts. 20, 53, 61", total: 23 },
  { num: 8, titulo: "Reglamento de la Ley Aduanera", tituloEn: "Customs Law Regulations", detalle: "Arts. 31 (tráfico aéreo) y 98 (equipajes y menajes)", total: 5 },
  { num: 9, titulo: "Ley Federal del Trabajo", tituloEn: "Federal Labor Law", detalle: "Arts. 60 a 67 (jornada) y 215 a 245 (tripulaciones aeronáuticas)", total: 48 },
  { num: 10, titulo: "Circulares Obligatorias", tituloEn: "Mandatory Circulars", detalle: "CO AV-12.1/07 R5 (revalidación de licencia) y CO SA-17.2/10 R3 (artículos prohibidos)", total: 57 },
];

export const LEG_TOTAL = LEG_CHAPTERS.reduce((s, c) => s + c.total, 0);

/**
 * Capítulos del Anexo 10 de la OACI, Volumen II (procedimientos de
 * comunicaciones). El temario los lista sin secciones. Los totales reflejan el
 * banco actual reubicado por capítulo; los capítulos sin reactivos quedan en 0.
 */
export const ANX10_CHAPTERS: AtpChapter[] = [
  { num: 1, titulo: "Definiciones", tituloEn: "Definitions", total: 37 },
  { num: 2, titulo: "Disposiciones administrativas del servicio internacional de telecomunicaciones aeronáuticas", tituloEn: "Administrative Provisions Relating to the International Aeronautical Telecommunication Service", total: 12 },
  { num: 3, titulo: "Procedimientos generales del servicio internacional de telecomunicaciones aeronáuticas", tituloEn: "General Procedures for the International Aeronautical Telecommunication Service", total: 30 },
  { num: 4, titulo: "Servicio fijo aeronáutico (AFS)", tituloEn: "Aeronautical Fixed Service (AFS)", total: 79 },
  { num: 5, titulo: "Servicio móvil aeronáutico — comunicaciones orales", tituloEn: "Aeronautical Mobile Service — Voice Communications", total: 104 },
  { num: 6, titulo: "Servicio de radionavegación aeronáutica", tituloEn: "Aeronautical Radio Navigation Service", total: 20 },
  { num: 7, titulo: "Servicio de radiodifusión aeronáutica", tituloEn: "Aeronautical Broadcasting Service", total: 13 },
  { num: 8, titulo: "Servicio móvil aeronáutico — comunicaciones por enlace de datos", tituloEn: "Aeronautical Mobile Service — Data Link Communications", total: 57 },
];

export const ANX10_TOTAL = ANX10_CHAPTERS.reduce((s, c) => s + c.total, 0);

/**
 * Capítulos de cada manual de Línea Aérea que se estudia por capítulos. Es la
 * única tabla: la usan el tablero, el cuestionario, "Estudiemos juntos", Pathy
 * y el panel admin, así que un manual nuevo se da de alta solo aquí.
 */
export const LA_CHAPTERS_BY_FUENTE: Record<string, AtpChapter[]> = {
  ATP: ATP_CHAPTERS,
  PHAK: PHAK_CHAPTERS,
  JEPP: JEPP_CHAPTERS,
  LEG: LEG_CHAPTERS,
  ANX10: ANX10_CHAPTERS,
};

/**
 * Cómo llama el temario a la unidad de cada manual: el Jeppesen se organiza en
 * "bloques"; el resto, en capítulos. Etiqueta corta para listas y badges.
 */
export function capLabel(fuente?: string | null): string {
  return fuente === "JEPP" ? "Bloque" : "Cap.";
}

/** La misma unidad en palabra completa: "3 bloques" / "1 capítulo". */
export function capPalabra(fuente: string | null | undefined, n: number): string {
  const base = fuente === "JEPP" ? "bloque" : "capítulo";
  return n === 1 ? base : `${base}s`;
}

/** Título del capítulo en el catálogo (vacío si el manual no va por capítulos). */
export function capituloNombre(fuente: string | undefined, num: number | undefined): string {
  if (!fuente || num === undefined || num === null) return "";
  return chaptersFor(fuente).find((c) => c.num === num)?.titulo ?? "";
}

/** Catálogo de capítulos de los cinco manuales de Línea Aérea. */
export const CHAPTERS_BY_FUENTE: Record<string, AtpChapter[]> = {
  ...LA_CHAPTERS_BY_FUENTE,
};

/** Capítulos de un manual; lista vacía si no se estudia por capítulos. */
export function chaptersFor(fuente?: string | null): AtpChapter[] {
  return (fuente && CHAPTERS_BY_FUENTE[fuente]) || [];
}

/**
 * Capítulos del catálogo con el total vivo de la nube (`get_bank_counts`)
 * cuando lo hay. `total` es la suma de todo el manual (incluye reactivos con
 * un capítulo fuera de catálogo); null cuando no hay conteo y rige el catálogo.
 */
export function chaptersConConteo(
  code: string,
  chapters: AtpChapter[],
  counts: BankCount[] | undefined,
): { chapters: AtpChapter[]; total: number | null } {
  const vivos = counts?.filter((c) => c.fuente === code) ?? [];
  if (vivos.length === 0) return { chapters, total: null };
  return {
    chapters: chapters.map((c) => ({
      ...c,
      total: vivos.filter((v) => v.capitulo === c.num).reduce((s, v) => s + v.total, 0),
    })),
    total: vivos.reduce((s, v) => s + v.total, 0),
  };
}

/** Nombre legible de un manual de Línea Aérea. */
export function manualTitulo(code: string): string {
  return LINEA_AEREA_QUIZZES.find((q) => q.code === code)?.titulo ?? code;
}
