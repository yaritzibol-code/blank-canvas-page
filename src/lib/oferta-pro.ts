/**
 * Escalera de conversión para alumnos en plan gratis que nunca han pagado.
 *
 * - 2.º día con actividad → popup grande con 20% de descuento en la
 *   inscripción de Pro. Si lo rechaza, se abre la oferta relámpago de siempre
 *   (inscripción a mitad de precio), pero sólo por 10 minutos.
 * - 3.er día con actividad (otro día distinto al del primer popup) → vuelve
 *   el popup del 20%. Si lo rechaza, una mini encuesta pregunta por qué.
 *
 * Lógica pura (sin red ni React): el servidor decide con estas mismas reglas
 * y las pruebas las ejercitan sin levantar la app.
 */

/** Descuento sobre la inscripción que ofrece el popup. */
export const OFERTA_PRO_PCT = 20;
/** El 20% se puede cobrar durante 24 horas desde que se mostró el popup. */
export const OFERTA_PRO_VIGENCIA_MS = 24 * 60 * 60_000;
/** Duración de la oferta relámpago (50%) cuando se rechaza el primer popup. */
export const FLASH_RECHAZO_MIN = 10;
/** Los "días" se cuentan en la hora de México, no en UTC. */
export const ZONA_HORARIA = "America/Mexico_City";

export type IntentoOferta = 1 | 2;

export const MOTIVOS_RECHAZO = [
  { id: "caro", label: "Está muy caro para mí" },
  { id: "no_lo_necesito", label: "No lo necesito, con lo gratis me alcanza" },
  { id: "examen_lejos", label: "Mi examen todavía está lejos" },
  { id: "sigo_probando", label: "Todavía estoy probando la plataforma" },
  { id: "no_convence", label: "No me convence el contenido" },
  { id: "otro", label: "Otro motivo" },
] as const;

export type MotivoRechazo = (typeof MOTIVOS_RECHAZO)[number]["id"];

export interface OfertaProIntento {
  /** Día local (YYYY-MM-DD) en que se mostró. */
  dia: string;
  /** Momento exacto en que se mostró (ms). */
  en: number;
  respuesta?: "acepto" | "rechazo";
}

/** Lo que se guarda en `profiles.data.ofertaPro`. */
export interface OfertaProEstado {
  intentos?: OfertaProIntento[];
  motivo?: { valor: MotivoRechazo; detalle?: string; en: number };
}

const formatoDia = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_HORARIA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Día local de México como `YYYY-MM-DD`. */
export function diaLocal(ms: number): string {
  return formatoDia.format(new Date(ms));
}

/**
 * Días distintos con actividad. Hoy siempre cuenta: quien pregunta está
 * usando la app ahora, aunque su sesión aún no se haya guardado.
 */
export function contarDiasActivos(inicios: Array<string | number>, ahora: number): number {
  const dias = new Set<string>([diaLocal(ahora)]);
  for (const v of inicios) {
    const ms = typeof v === "number" ? v : Date.parse(v);
    if (Number.isFinite(ms)) dias.add(diaLocal(ms));
  }
  return dias.size;
}

/** Qué popup del 20% toca mostrar hoy, o `null` si ninguno. */
export function siguienteIntento(
  estado: OfertaProEstado | undefined,
  diasActivos: number,
  ahora: number,
): IntentoOferta | null {
  const intentos = estado?.intentos ?? [];
  if (intentos.length === 0) return diasActivos >= 2 ? 1 : null;
  if (intentos.length === 1 && intentos[0].dia !== diaLocal(ahora) && diasActivos >= 3) return 2;
  return null;
}

/** ¿El 20% del último popup todavía se puede cobrar? */
export function oferta20Vigente(estado: OfertaProEstado | undefined, ahora: number): boolean {
  const ultimo = estado?.intentos?.at(-1);
  return !!ultimo && ahora - ultimo.en < OFERTA_PRO_VIGENCIA_MS;
}

/** Inscripción con el 20% aplicado, redondeada a pesos. */
export function precioConOferta(inscripcion: number): number {
  return Math.round(inscripcion * (1 - OFERTA_PRO_PCT / 100));
}

export function esMotivoRechazo(v: unknown): v is MotivoRechazo {
  return MOTIVOS_RECHAZO.some((m) => m.id === v);
}
