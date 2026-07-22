/**
 * Reglas de acceso por suscripción y desbloqueo progresivo.
 *
 * Reglas vigentes (2026-07):
 *  - Plan **básica**: acceso a Cuestionario y Simulador con 10 preguntas por
 *    materia (fijas por semilla) y máximo 2 intentos totales (de por vida)
 *    entre cuestionarios y simuladores. Sin IA (Yaris).
 *  - Plan **paga (Pro)**: acceso completo a cuestionario/simulador ilimitados
 *    y Yaris con IA.
 *  - Los módulos Learning Paths / Estudiemos Juntos / Flashcards / Clases
 *    Grabadas están gateados aparte (sólo admin) mediante `<UnderConstruction />`.
 */
import type { User } from "./types";
import {
  getClases,
  getClaseProgress,
  getTemaProgress,
  getSimAttempts,
  getQuizAttempts,
  logActivity,
} from "./domain";

export type GatedFeature =
  | "learning_path_tema"
  | "cuestionario_completo"
  | "simulador"
  | "estudiemos"
  | "biblioteca_completa"
  | "flashcards_tema"
  | "clase"
  | "recordatorios"
  | "analisis_completo"
  | "yaris_biblioteca"
  | "yaris_ia";

/** Máximo de intentos totales (quiz + simulador combinados) para plan básica. */
export const BASICA_MAX_ATTEMPTS = 2;
/** Preguntas por materia visibles en modo básica. */
export const BASICA_QUESTIONS_PER_MATERIA = 10;

export function isPaid(user: User | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  const activo = ["activo", "extendido", "prueba"].includes(user.accessStatus);
  return user.plan === "paga" && activo;
}

/** Yaris con IA sólo para plan Pro (o admin). */
export function canUseAI(user: User | null): boolean {
  return isPaid(user);
}

export interface GateResult {
  allowed: boolean;
  reason?: string;
  used?: number;
  limit?: number;
}

/** Cuenta intentos totales de por vida (quizzes + simuladores) del usuario. */
export function totalAttempts(userId: string): number {
  return getQuizAttempts(userId).length + getSimAttempts(userId).length;
}

const LIMIT_MSG =
  `Tu plan Básica incluye ${BASICA_MAX_ATTEMPTS} intentos totales entre cuestionarios y simuladores. ` +
  "Actualiza a FlightPath Pro para practicar sin límites.";

export function canStartSimulator(user: User | null): GateResult {
  if (!user) return { allowed: false, reason: "Inicia sesión para usar el simulador." };
  if (isPaid(user)) return { allowed: true };
  const used = totalAttempts(user.id);
  if (used >= BASICA_MAX_ATTEMPTS)
    return { allowed: false, reason: LIMIT_MSG, used, limit: BASICA_MAX_ATTEMPTS };
  return { allowed: true, used, limit: BASICA_MAX_ATTEMPTS };
}

export function canStartQuiz(user: User | null): GateResult {
  if (!user) return { allowed: false, reason: "Inicia sesión para practicar." };
  if (isPaid(user)) return { allowed: true };
  const used = totalAttempts(user.id);
  if (used >= BASICA_MAX_ATTEMPTS)
    return { allowed: false, reason: LIMIT_MSG, used, limit: BASICA_MAX_ATTEMPTS };
  return { allowed: true, used, limit: BASICA_MAX_ATTEMPTS };
}

/**
 * Desbloqueo de Learning Paths:
 *  - básica: solo el primer tema (el resto, candado de plan);
 *  - todos: secuencial — no puedes abrir un tema sin completar el anterior.
 */
export function temaLockState(
  user: User | null,
  temaIds: string[],
  temaId: string,
): "open" | "locked_previo" | "locked_plan" {
  const idx = temaIds.indexOf(temaId);
  if (idx <= 0) return idx === 0 ? "open" : "locked_previo";
  if (!isPaid(user)) return "locked_plan";
  if (!user) return "locked_plan";
  const done = new Set(
    getTemaProgress(user.id)
      .filter((t) => t.completado)
      .map((t) => t.temaId),
  );
  return done.has(temaIds[idx - 1]) ? "open" : "locked_previo";
}

export function claseLockState(
  user: User | null,
  materiaSlug: string,
  claseId: string,
): "open" | "locked_previo" | "locked_plan" {
  const clases = getClases()
    .filter((c) => c.materia === materiaSlug && c.status === "publicada")
    .sort((a, b) => a.orden - b.orden);
  const idx = clases.findIndex((c) => c.id === claseId);
  if (idx <= 0) return idx === 0 ? "open" : "locked_previo";
  if (!isPaid(user)) return "locked_plan";
  if (!user) return "locked_plan";
  const done = new Set(
    getClaseProgress(user.id)
      .filter((p) => p.completada)
      .map((p) => p.claseId),
  );
  return done.has(clases[idx - 1].id) ? "open" : "locked_previo";
}

export function logUpgradePrompt(userId: string, feature: GatedFeature | string) {
  logActivity({ userId, kind: "upgrade_prompt", label: feature, durationMin: 0 });
}

export function logUpgradeClick(userId: string, cta: string) {
  logActivity({ userId, kind: "upgrade_click", label: cta, durationMin: 0 });
}
