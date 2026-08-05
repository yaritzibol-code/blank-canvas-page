/**
 * Contexto y utilidades de Yaris (tutora académica) y Pathy.
 *
 * Las respuestas ya no se generan aquí: el guion determinista que vivía en
 * este módulo se retiró y toda pantalla pide a `useYarisAsk()`
 * (`@/lib/yaris-ask`), que llama al modelo real y, si no puede, devuelve la
 * explicación oficial del banco diciendo que lo es.
 */
import { getPublishedQuestions, logActivity } from "./domain";
import { materiaBySlug } from "./materias";
import type { BankQuestion } from "./types";

export interface YarisContext {
  /** Pregunta activa (cuestionario/simulador en revisión). */
  question?: {
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    cite?: string;
  };
  /** Opción elegida por el estudiante (-1 si aún no responde). */
  userSelectedIndex?: number;
  /**
   * El estudiante pide ayuda ANTES de responder: Yaris guía el razonamiento
   * sin revelar la respuesta correcta.
   */
  preAnswer?: boolean;
  /** Recurso de biblioteca o tema activo. */
  resourceTitle?: string;
  materiaName?: string;
}

/** Registra el uso de Yaris para métricas (PRD §13.5). */
export function logYarisUse(userId: string, seccion: string) {
  logActivity({ userId, kind: "yaris", label: `Yaris — ${seccion}`, durationMin: 0 });
}

/** Pregunta de repaso aleatoria de una materia (para "Ponme a prueba"). */
export function pickPracticeQuestion(materiaSlug?: string): BankQuestion | null {
  const pool = getPublishedQuestions(materiaSlug || undefined);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function materiaDisplayName(slug: string): string {
  return materiaBySlug(slug)?.name ?? slug;
}
