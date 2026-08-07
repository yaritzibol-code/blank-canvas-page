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

/** Preguntas por entrevista. */
export const RTARI_MIN_PREGUNTAS = 4;
export const RTARI_MAX_PREGUNTAS = 15;
/** Opciones que ofrece la pantalla de arranque. */
export const RTARI_PRESETS_PREGUNTAS = [5, 8, 12] as const;

/** Corte automático de la sesión de voz (minutos), por costo y por foco. */
export const RTARI_MAX_MINUTOS = 20;

/** Tope de entrevistas por usuario en 24 h. */
export const RTARI_SESIONES_POR_DIA = 6;

/** Turnos de transcripción que se mandan a evaluar como máximo. */
export const RTARI_MAX_TURNOS = 120;
