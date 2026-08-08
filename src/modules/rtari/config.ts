/**
 * Ajustes de la entrevista RTARI compartidos por el navegador y el servidor.
 *
 * Vive fuera de `rtari.server.ts` a propósito: la UI necesita la lista de
 * voces y los topes para pintarlos, y el servidor necesita exactamente los
 * mismos valores para validar lo que llega. Una sola definición evita que la
 * pantalla ofrezca algo que el servidor va a rechazar.
 */

export const RTARI_VOICES = ["marin", "cedar", "alloy"] as const;
export type RtariVoice = (typeof RTARI_VOICES)[number];

export interface RtariVoiceDef {
  id: RtariVoice;
  /** Cómo se presenta el sinodal en la UI. */
  nombre: string;
  descripcion: string;
}

export const RTARI_VOICE_DEFS: RtariVoiceDef[] = [
  { id: "marin", nombre: "Sinodal A", descripcion: "Voz femenina, clara y pausada." },
  { id: "cedar", nombre: "Sinodal B", descripcion: "Voz masculina, tono grave y seco." },
  { id: "alloy", nombre: "Sinodal C", descripcion: "Voz neutra, ritmo rápido." },
];

export const RTARI_NIVELES = ["estandar", "exigente"] as const;
export type RtariNivel = (typeof RTARI_NIVELES)[number];

export interface RtariNivelDef {
  id: RtariNivel;
  nombre: string;
  descripcion: string;
}

export const RTARI_NIVEL_DEFS: RtariNivelDef[] = [
  {
    id: "estandar",
    nombre: "Estándar",
    descripcion: "Ritmo moderado, te repite la pregunta si se la pides y te da tiempo de pensar.",
  },
  {
    id: "exigente",
    nombre: "Exigente",
    descripcion:
      "Ritmo real de examen: casi no repite y te lanza repreguntas sobre lo que dijiste.",
  },
];

/**
 * Modelo de voz por nivel de exigencia.
 *
 * El `mini` cuesta alrededor de un tercio y para el modo estándar —leer un
 * guion y escuchar— alcanza de sobra. El modo exigente improvisa repreguntas
 * sobre lo que acaba de decir el alumno y aguanta un prompt más estricto, así
 * que se queda en el modelo grande hasta que una prueba real diga otra cosa.
 */
export const RTARI_MODELO_POR_NIVEL: Record<RtariNivel, string> = {
  estandar: "gpt-realtime-mini",
  exigente: "gpt-realtime",
};

/** Preguntas por entrevista. */
export const RTARI_MIN_PREGUNTAS = 4;
export const RTARI_MAX_PREGUNTAS = 15;
/** Opciones que ofrece la pantalla de arranque. */
export const RTARI_PRESETS_PREGUNTAS = [4, 6, 8, 10, 12, 15] as const;

/** Corte automático de la sesión de voz (minutos), por costo y por foco. */
export const RTARI_MAX_MINUTOS = 20;

/** Turnos de transcripción que se mandan a evaluar como máximo. */
export const RTARI_MAX_TURNOS = 120;

/* ───────────────────────── Minutos y créditos ───────────────────────── */

/**
 * Minutos de voz incluidos cada mes en la suscripción Pro.
 *
 * Son ~6 entrevistas de 10 minutos, de sobra para preparar el examen. No se
 * acumulan de un mes a otro: al cambiar de ciclo el contador vuelve a empezar
 * (lo comprado sí se queda).
 */
export const RTARI_MINUTOS_INCLUIDOS_PRO = 60;

/** Menos de esto no da para una entrevista: mejor avisar antes de arrancar. */
export const RTARI_MINUTOS_MINIMOS = 3;

export interface RtariPaqueteDef {
  /** `lookup_key` del precio de pago único en Stripe. */
  lookupKey: string;
  minutos: number;
  /** Precio de lista para la UI; el cobro real sale del `lookup_key`. */
  precioMXN: number;
  nombre: string;
  destacado?: boolean;
}

/**
 * Paquetes de minutos extra.
 *
 * El precio NO está atado a un múltiplo del costo de la API a propósito: se
 * vende en minutos redondos a un precio redondo, para que una subida de tarifa
 * de OpenAI no obligue a recotizar y para que el alumno entienda qué compra.
 * Con el modelo mini el costo ronda $0.90 MXN por minuto en el peor caso, así
 * que estos precios dejan un margen de ~4-5x (74-80%), que es lo que necesita
 * una función de consumo para sobrevivir a la comisión de Stripe, las sesiones
 * fallidas y los cambios de tarifa del proveedor.
 *
 * Los precios deben existir en Stripe con estos mismos `lookup_key`.
 */
export const RTARI_PAQUETES: RtariPaqueteDef[] = [
  { lookupKey: "flightpath_rtari_30min", minutos: 30, precioMXN: 99, nombre: "30 minutos" },
  {
    lookupKey: "flightpath_rtari_60min",
    minutos: 60,
    precioMXN: 179,
    nombre: "60 minutos",
    destacado: true,
  },
  { lookupKey: "flightpath_rtari_120min", minutos: 120, precioMXN: 329, nombre: "120 minutos" },
];

export function paquetePorLookupKey(lookupKey: string): RtariPaqueteDef | undefined {
  return RTARI_PAQUETES.find((p) => p.lookupKey === lookupKey);
}
