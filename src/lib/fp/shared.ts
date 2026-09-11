/**
 * FlightPoints — piezas compartidas entre navegador y servidor.
 *
 * Aquí NO se calculan puntos: sólo tipos, clasificación de programa y utilidades
 * de fecha. El monto de cada recompensa vive siempre en la tabla `fp_rules` y se
 * resuelve en el servidor (`fp.server.ts`); el navegador nunca propone montos.
 */

/** Programas que participan en los rankings. B737 queda fuera del sistema. */
export type FpProgram = "CIAAC" | "LINEA_AEREA" | "GENERAL";

export const FP_PROGRAM_LABEL: Record<FpProgram, string> = {
  CIAAC: "CIAAC",
  LINEA_AEREA: "Línea Aérea",
  GENERAL: "General",
};

export type FpPeriodo = "semana" | "mes" | "historico";

export const FP_PERIODOS: { id: FpPeriodo; label: string }[] = [
  { id: "semana", label: "Esta semana" },
  { id: "mes", label: "Este mes" },
  { id: "historico", label: "Histórico" },
];

/** Los cinco rankings de Comunidad (ni uno más). */
export type FpRankingId = "general" | "ciaac" | "linea_aerea" | "racha" | "logros";

export const FP_RANKINGS: {
  id: FpRankingId;
  label: string;
  corto: string;
  ayuda: string;
  unidad: string;
  icono: string;
  acento: string;
  usaFp: boolean;
}[] = [
  {
    id: "general",
    label: "Top General",
    corto: "General",
    ayuda: "Todo lo que sumas en FlightPath: CIAAC, Línea Aérea y actividades generales.",
    unidad: "FP",
    icono: "plane",
    acento: "#3D5D91",
    usaFp: true,
  },
  {
    id: "ciaac",
    label: "Top CIAAC",
    corto: "CIAAC",
    ayuda: "Sólo la preparación para el examen CIAAC.",
    unidad: "FP",
    icono: "target",
    acento: "#1F7A6B",
    usaFp: true,
  },
  {
    id: "linea_aerea",
    label: "Top Línea Aérea",
    corto: "Línea Aérea",
    ayuda: "Sólo la preparación para ingresar a aerolínea.",
    unidad: "FP",
    icono: "bolt",
    acento: "#6C0820",
    usaFp: true,
  },
  {
    id: "racha",
    label: "Racha más larga",
    corto: "Racha",
    ayuda: "Constancia: la mayor cantidad de días seguidos con estudio real.",
    unidad: "días",
    icono: "flame",
    acento: "#C2410C",
    usaFp: false,
  },
  {
    id: "logros",
    label: "Más logros",
    corto: "Logros",
    ayuda: "Logros desbloqueados dentro de la plataforma.",
    unidad: "logros",
    icono: "trophy",
    acento: "#6C4FA3",
    usaFp: false,
  },
];

export interface FpTx {
  id: string;
  event_key: string;
  rule_key: string;
  kind: string;
  amount: number;
  program: string | null;
  activity_type: string;
  activity_label: string;
  detail: string | null;
  status: string;
  occurred_at: string;
}

export interface FpResumen {
  total: number;
  semana: number;
  mes: number;
  porActividad: { tipo: string; fp: number; n: number }[];
  porPrograma: { programa: string; fp: number; n: number }[];
  recientes: FpTx[];
  folio: string;
  /** Indicativo tipo gamertag con el que aparece quien no publica su nombre. */
  callsign: string;
  privacidad: "nombre" | "folio";
  /** true cuando el alumno ya respondió cómo quiere aparecer. */
  privacidadElegida: boolean;
  tutorialVisto: boolean;
  tutorialOculto: boolean;
  rachaActual: number;
  rachaMax: number;
  logros: number;
}

export interface FpNuevo {
  amount: number;
  activity_label: string;
  detail: string | null;
  activity_type: string;
}

export interface FpRankingRow {
  userId: string;
  /** Nombre público o indicativo, según la privacidad elegida por esa persona. */
  display: string;
  /** Indicativo de la persona (siempre viaja: es lo que el admin puede ligar). */
  callsign: string;
  /** true si la persona eligió aparecer sólo con su indicativo. */
  anonimo: boolean;
  /** URL firmada de la foto; sólo cuando la persona muestra su nombre. */
  avatarUrl: string | null;
  esYo: boolean;
  valor: number;
  posicion: number;
}

/** Regla pública de FlightPoints (sin ids internos), para explicar cómo se ganan. */
export interface FpReglaPublica {
  key: string;
  label: string;
  categoria: string;
  fp: number;
}

/** Cuántas posiciones se publican en cada ranking. */
export const FP_TOP_N = 10;

/** Etiquetas legibles de los tipos de actividad que otorgan FP. */
export const FP_ACTIVITY_LABEL: Record<string, string> = {
  material: "Material",
  learning_path: "Learning Paths",
  materia: "Materias completas",
  cuestionario: "Cuestionarios",
  flashcards: "Flashcards",
  pathy: "Estudia con Pathy",
  racha: "Rachas",
  logro: "Logros",
  ajuste: "Ajustes manuales",
  reversa: "Reversiones",
};

/** Día "YYYY-MM-DD" en horario de México (única zona del sistema). */
export function diaMx(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Suma días a una fecha "YYYY-MM-DD". */
export function sumaDias(dia: string, n: number): string {
  const [y, m, d] = dia.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  date.setUTCDate(date.getUTCDate() + n);
  return date.toISOString().slice(0, 10);
}

export function fpFormat(n: number): string {
  return n.toLocaleString("es-MX");
}
