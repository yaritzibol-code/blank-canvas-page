/**
 * Reglas de acceso por suscripción (PRD §5.3) y desbloqueo progresivo (§7).
 */
import type { User } from "./types";
import { getClases, getClaseProgress, getTemaProgress, simAttemptsThisMonth, logActivity } from "./domain";

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
  | "yaris_biblioteca";

export function isPaid(user: User | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  const activo = ["activo", "extendido", "prueba"].includes(user.accessStatus);
  return user.plan === "paga" && activo;
}

export interface GateResult {
  allowed: boolean;
  reason?: string;
}

/** Límite mensual del simulador para suscripción básica: 1 por mes. */
export function canStartSimulator(user: User | null): GateResult {
  if (!user) return { allowed: false, reason: "Inicia sesión para usar el simulador." };
  if (isPaid(user)) return { allowed: true };
  const used = simAttemptsThisMonth(user.id);
  if (used >= 1)
    return {
      allowed: false,
      reason:
        "Tu suscripción básica incluye 1 simulador por mes y ya lo usaste. Desbloquea FlightPath completo para practicar sin límites.",
    };
  return { allowed: true };
}

/**
 * Desbloqueo de Learning Paths:
 *  - básica: solo el primer tema de cada materia (el resto, candado de plan);
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

/**
 * Desbloqueo de clases grabadas (por materia, en orden):
 *  - básica: solo la primera clase publicada de cada materia;
 *  - todos: secuencial — completar la anterior desbloquea la siguiente.
 */
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

/** Registra el intento de abrir una función bloqueada (métricas de conversión). */
export function logUpgradePrompt(userId: string, feature: GatedFeature | string) {
  logActivity({ userId, kind: "upgrade_prompt", label: feature, durationMin: 0 });
}

export function logUpgradeClick(userId: string, cta: string) {
  logActivity({ userId, kind: "upgrade_click", label: cta, durationMin: 0 });
}
