/**
 * Progresión secuencial de los Learning Paths.
 *
 * Reglas (temario oficial):
 *  - El orden lo define la estructura académica; no se reordena.
 *  - Un Learning Path sólo se abre si todos los anteriores de su materia/módulo
 *    están completados. Los ya completados quedan libres para repaso.
 *  - Estados: no_iniciado · en_progreso · completado.
 *  - Plan: Pro (o admin) navega toda la secuencia; Básica accede al primer
 *    Learning Path de cada materia/módulo (configurable con BASICA_LP_POR_MATERIA)
 *    más los que ya haya completado.
 *
 * El avance vive en `tema_progress` (prefijo "lp:"), así que alimenta las
 * estadísticas y la actividad reciente que ya existen; el estado "en progreso"
 * vive en la colección `lp_started`.
 */
import { read, update, nowISO } from "./db";
import { completeTema, getTemaProgress } from "./domain";
import { isPaid } from "./gating";
import type { User } from "./types";
import { subjectSequence, type LpItem, type LpSubject } from "@/lib/lp/taxonomy";

export const LP_TEMA_PREFIX = "lp:";
/** Learning Paths por materia/módulo incluidos en el plan Básica. */
export const BASICA_LP_POR_MATERIA = 1;

export type LpStatus = "no_iniciado" | "en_progreso" | "completado";

export interface LpStartedRow {
  id: string;
  userId: string;
  lpId: string;
  at: string;
}

export function getLpStarted(userId: string): string[] {
  return read<LpStartedRow[]>("lp_started", [])
    .filter((r) => r.userId === userId)
    .map((r) => r.lpId);
}

export function getLpCompleted(userId: string): string[] {
  return getTemaProgress(userId)
    .filter((t) => t.completado && t.temaId.startsWith(LP_TEMA_PREFIX))
    .map((t) => t.temaId.slice(LP_TEMA_PREFIX.length));
}

export function lpStatus(userId: string, lpId: string): LpStatus {
  if (getLpCompleted(userId).includes(lpId)) return "completado";
  return getLpStarted(userId).includes(lpId) ? "en_progreso" : "no_iniciado";
}

/** Marca que la alumna abrió el Learning Path (una sola vez). */
export function startLp(userId: string, lpId: string) {
  update<LpStartedRow[]>("lp_started", [], (all) =>
    all.some((r) => r.userId === userId && r.lpId === lpId)
      ? all
      : [...all, { id: `${userId}:${lpId}`, userId, lpId, at: nowISO() }],
  );
}

/** Completa el Learning Path: habilita el siguiente de la secuencia. */
export function completeLp(userId: string, item: LpItem, subjectTitulo: string) {
  completeTema(userId, `${LP_TEMA_PREFIX}${item.id}`, null, `${subjectTitulo} · ${item.titulo}`, 15);
}

export interface LpAccess {
  status: LpStatus;
  allowed: boolean;
  /** Motivo del candado cuando allowed === false. */
  lock: "previo" | "plan" | null;
  /** Posición dentro de la secuencia de la materia (1-based). */
  posicion: number;
  total: number;
}

/** Índice del primer Learning Path no completado (el "actual"). */
export function subjectCursor(userId: string, subject: LpSubject): number {
  const done = new Set(getLpCompleted(userId));
  const seq = subjectSequence(subject);
  const idx = seq.findIndex((s) => !done.has(s.item.id));
  return idx === -1 ? seq.length : idx;
}

export function lpAccess(user: User | null, subject: LpSubject, lpId: string): LpAccess {
  const seq = subjectSequence(subject);
  const index = seq.findIndex((s) => s.item.id === lpId);
  const total = seq.length;
  const posicion = index + 1;
  if (!user || index === -1) {
    return { status: "no_iniciado", allowed: false, lock: "previo", posicion, total };
  }
  const status = lpStatus(user.id, lpId);
  const cursor = subjectCursor(user.id, subject);
  if (status !== "completado" && index > cursor) {
    return { status, allowed: false, lock: "previo", posicion, total };
  }
  if (!isPaid(user) && status !== "completado" && index >= BASICA_LP_POR_MATERIA) {
    return { status, allowed: false, lock: "plan", posicion, total };
  }
  return { status, allowed: true, lock: null, posicion, total };
}

/** Siguiente Learning Path por estudiar en la materia (o null si terminó). */
export function subjectContinue(userId: string, subject: LpSubject): LpItem | null {
  const seq = subjectSequence(subject);
  const cursor = subjectCursor(userId, subject);
  return seq[cursor]?.item ?? null;
}

export function subjectProgress(
  userId: string,
  subject: LpSubject,
): { done: number; total: number; percent: number } {
  const seq = subjectSequence(subject);
  const completed = new Set(getLpCompleted(userId));
  const done = seq.filter((s) => completed.has(s.item.id)).length;
  const total = seq.length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

/** Vecinos en la secuencia para la navegación anterior/siguiente. */
export function lpNeighbors(
  subject: LpSubject,
  lpId: string,
): { prev: LpItem | null; next: LpItem | null } {
  const seq = subjectSequence(subject);
  const i = seq.findIndex((s) => s.item.id === lpId);
  return { prev: i > 0 ? seq[i - 1].item : null, next: i >= 0 ? (seq[i + 1]?.item ?? null) : null };
}
