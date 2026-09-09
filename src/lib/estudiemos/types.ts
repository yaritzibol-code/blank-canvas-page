/**
 * Tipos de "Estudiemos Juntos": la sesión adaptativa que Pathy arma con los
 * recursos que ya existen en FlightPath.
 */
import type { FPIconName } from "@/components/ui/fp-icon";

export type StudyTrack = "ciaac" | "la";
export type StudyMood = "cero" | "normal" | "ganas" | "atope";
export type StudyUrgency = "verde" | "amarillo" | "naranja" | "rojo";

export interface StudyIntake {
  track: StudyTrack;
  /** Texto libre; vacío = "Nada en específico". */
  tema: string;
  mood: StudyMood;
  urgency: StudyUrgency;
  /** Minutos totales que la alumna quiere estudiar. */
  minutes: number;
}

export type PlanActivityKind =
  | "learning_path"
  | "cuestionario"
  | "flashcards"
  | "banco"
  | "simulador"
  | "prueba"
  | "break";

export interface PlanActivity {
  id: string;
  kind: PlanActivityKind;
  titulo: string;
  detalle: string;
  icon: FPIconName;
  /** Tiempo aproximado en minutos. */
  minutes: number;
  /** Ruta real del recurso (las actividades internas no la traen). */
  to?: string;
  search?: Record<string, string | number>;
}

/** Recurso real disponible antes de que el planificador lo elija. */
export interface ResourceCandidate extends PlanActivity {
  /** Texto normalizado para emparejar con el tema que escribió la alumna. */
  keywords: string;
  score: number;
}

export interface StudySessionState {
  intake: StudyIntake;
  activities: PlanActivity[];
  /** Mensaje de Pathy al abrir la sesión. */
  intro: string;
  startedAt: number;
  /** Duración total en ms (minutos del intake). */
  totalMs: number;
  currentIndex: number;
  completedIds: string[];
  endedAt?: number;
}
