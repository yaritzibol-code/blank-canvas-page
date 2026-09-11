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

export const FP_RANKINGS: { id: FpRankingId; label: string; ayuda: string }[] = [
  { id: "general", label: "FlightPoints totales", ayuda: "Todos los FP ganados en la plataforma." },
  { id: "ciaac", label: "FlightPoints CIAAC", ayuda: "Sólo actividad del programa CIAAC." },
  { id: "linea_aerea", label: "FlightPoints Línea Aérea", ayuda: "Sólo actividad de Línea Aérea." },
  { id: "racha", label: "Racha más larga", ayuda: "Días seguidos de estudio real." },
  { id: "logros", label: "Logros desbloqueados", ayuda: "Logros conseguidos con actividad real." },
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
  privacidad: "nombre" | "folio";
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
  display: string;
  esYo: boolean;
  valor: number;
  posicion: number;
}

/** Etiquetas legibles de los tipos de actividad que otorgan FP. */
export const FP_ACTIVITY_LABEL: Record<string, string> = {
  material: "Materiales",
  learning_path: "Learning Paths",
  materia: "Materias completas",
  cuestionario: "Cuestionarios",
  flashcards: "Flashcards",
  pathy: "Estudio con Pathy",
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
