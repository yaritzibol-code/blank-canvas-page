/**
 * Datos compartidos de las transmisiones: tipos, duraciones, veredictos de
 * respuesta a reportes y el tono con que se pinta cada una. Los usan el pop-up
 * de la alumna, el módulo Notificaciones y la respuesta desde Soporte.
 */
import { cloudEnabled } from "@/lib/store";
import type { Notificacion, NotiKind, NotiVeredicto, Report, ReportStatus } from "@/lib/store";

export const TIPOS: {
  id: Exclude<NotiKind, "reporte">;
  label: string;
  color: string;
  ayuda: string;
}[] = [
  {
    id: "aviso",
    label: "Aviso",
    color: "#E3C98A",
    ayuda: "Novedades, recordatorios y cambios en la plataforma.",
  },
  {
    id: "importante",
    label: "Importante",
    color: "#F0A08C",
    ayuda: "Algo que no deben pasar por alto: llega marcado como prioridad.",
  },
  {
    id: "logro",
    label: "Felicitación",
    color: "#7FD6A4",
    ayuda: "Reconoce un logro, una racha o un buen avance.",
  },
];

export const KIND_LABEL: Record<NotiKind, string> = {
  aviso: "Aviso",
  importante: "Importante",
  logro: "Felicitación",
  reporte: "Respuesta a reporte",
};

export const KIND_COLOR: Record<NotiKind, string> = {
  aviso: "#E3C98A",
  importante: "#F0A08C",
  logro: "#7FD6A4",
  reporte: "#9FC3F5",
};

export const DURACIONES = [
  { id: "1d", label: "1 día", dias: 1 },
  { id: "3d", label: "3 días", dias: 3 },
  { id: "1s", label: "1 semana", dias: 7 },
  { id: "2s", label: "2 semanas", dias: 14 },
  { id: "1m", label: "1 mes", dias: 30 },
  { id: "fecha", label: "Hasta una fecha", dias: 0 },
] as const;
export type DuracionId = (typeof DURACIONES)[number]["id"];

/** Fin de la vigencia en ISO (null si la fecha elegida no es válida o ya pasó). */
export function finDeVigencia(id: DuracionId, fecha: string, desde = Date.now()): string | null {
  if (id === "fecha") {
    const t = fecha ? new Date(fecha).getTime() : Number.NaN;
    return Number.isNaN(t) || t <= desde ? null : new Date(t).toISOString();
  }
  const d = DURACIONES.find((x) => x.id === id);
  return new Date(desde + (d?.dias ?? 7) * 86_400_000).toISOString();
}

/** "jue 2 oct, 14:30" */
export function fechaCorta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dia = d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
  const hora = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${dia.replace(/\./g, "")}, ${hora}`;
}

/** Valor mínimo para <input type="datetime-local"> (ahora, en hora local). */
export function ahoraLocalInput(): string {
  const d = new Date(Date.now() + 5 * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const VEREDICTOS: {
  id: NotiVeredicto;
  label: string;
  color: string;
  /** Estado en que queda el ticket al responder. */
  estado: ReportStatus;
  plantilla: (nombre: string) => string;
}[] = [
  {
    id: "correcto",
    label: "Tenía razón",
    color: "#7FD6A4",
    estado: "resuelto",
    plantilla: (n) =>
      `¡Gracias por tu reporte, ${n}! Tenías razón: ya corregimos la pregunta. Tu ojo crítico ayuda a todas las que estudian contigo.`,
  },
  {
    id: "incorrecto",
    label: "La pregunta es correcta",
    color: "#E3C98A",
    estado: "resuelto",
    plantilla: (n) => `Gracias por tu reporte, ${n}. Lo revisamos y la pregunta es correcta: `,
  },
  {
    id: "info",
    label: "Necesito más información",
    color: "#9FC3F5",
    estado: "en_proceso",
    plantilla: (n) =>
      `Gracias por tu reporte, ${n}. Para revisarlo necesitamos un poco más de detalle: ¿qué parte te parece incorrecta y en qué fuente lo viste? Puedes volver a reportarla desde la pregunta.`,
  },
];

export type TonoRadio = "oro" | "coral" | "verde" | "azul";

const TONO_VEREDICTO: Record<NotiVeredicto, { tono: TonoRadio; etiqueta: string }> = {
  correcto: { tono: "verde", etiqueta: "Tu reporte · Tenías razón" },
  incorrecto: { tono: "oro", etiqueta: "Tu reporte · Revisado" },
  info: { tono: "azul", etiqueta: "Tu reporte · Falta información" },
};

const TONO_TIPO: Record<Exclude<NotiKind, "reporte">, { tono: TonoRadio; etiqueta: string }> = {
  aviso: { tono: "oro", etiqueta: "Aviso" },
  importante: { tono: "coral", etiqueta: "Prioridad" },
  logro: { tono: "verde", etiqueta: "Felicitación" },
};

/** Color y etiqueta de la transmisión en el pop-up. */
export function tonoDeNotificacion(n: Pick<Notificacion, "kind" | "data">): {
  tono: TonoRadio;
  etiqueta: string;
} {
  if (n.kind === "reporte") return TONO_VEREDICTO[n.data.veredicto ?? "incorrecto"];
  return TONO_TIPO[n.kind];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** El reporte tiene una alumna con cuenta a quien avisarle. */
export function sePuedeResponder(r: Pick<Report, "userId">): boolean {
  if (!r.userId || r.userId === "anon") return false;
  return cloudEnabled() ? UUID.test(r.userId) : true;
}
