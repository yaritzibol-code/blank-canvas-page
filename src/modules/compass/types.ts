/**
 * Tipos compartidos del Pilot Aptitude Trainer.
 *
 * Principios (heredados del PRD y adaptados a la webapp real):
 *  - Entrenar, no certificar: los scores son métricas de entrenamiento propias.
 *  - Determinismo: cada sesión guarda seed + versiones; el motor no usa IA.
 *  - Comparabilidad honesta: una tendencia sólo compara sesiones del mismo
 *    módulo, modo e input (teclado / mouse / touch).
 */

/** Los módulos procedurales del entrenador. */
export type CompassModuleId =
  "control" | "slalom" | "memoria" | "calculo" | "orientacion" | "multitarea" | "logica";

export type CompassMode = "practica" | "examen" | "simulacro";

/** Con qué se controló la sesión (se detecta durante la tarea). */
export type CompassInput = "teclado" | "mouse" | "touch" | "mixto";

/** Sub-métrica mostrada en el debrief, ya formateada y explicada. */
export interface CompassMetric {
  /** Clave estable para históricos ("rms", "gates_pct"…). */
  key: string;
  label: string;
  /** Valor listo para mostrar ("0.14", "82%", "1.9 s"). */
  value: string;
  /** true cuando más alto es mejor (orienta el color del chip). */
  higherIsBetter: boolean;
  /** Lectura pedagógica corta de esta métrica en esta sesión. */
  hint?: string;
}

/** Resultado uniforme que todo ejercicio entrega al terminar. */
export interface CompassResult {
  moduleId: CompassModuleId;
  /** Score 0-100 de la fórmula versionada (no es un % de aprobación). */
  score: number;
  metrics: CompassMetric[];
  /** Datos crudos por si el scoring se recalcula en el futuro. */
  raw: Record<string, number>;
  durationSec: number;
  input: CompassInput;
  /** Salidas de foco / cambios de pestaña durante la tarea. */
  interruptions: number;
  /** Consejo accionable derivado de reglas deterministas (sin IA). */
  advice: string;
}

/** Configuración con la que se lanza un ejercicio. */
export interface CompassRunConfig {
  moduleId: CompassModuleId;
  mode: CompassMode;
  /** Nivel 1-5 (en examen se usa el nivel del formato fijo). */
  level: number;
  seed: number;
  /** Duración objetivo en segundos para tareas continuas. */
  durationSec: number;
  /** Nº de ítems para tareas por reactivo (0 = hasta agotar tiempo). */
  items: number;
}
