/**
 * Progreso de la Ruta de aprendizaje 737 MAX (FCOM Rev. 16).
 *
 * Réplica del modelo del paquete original (completedLessons / answers /
 * consolidation) pero por usuario y dentro del store:
 * - Respuestas y consolidaciones viven en la colección `lp737_state`
 *   (una fila por usuario, sincronizada a la nube en sync.ts).
 * - Las lecciones completadas usan el sistema existente de Learning Paths
 *   (`tema_progress` con prefijo "lp737:"), así que el avance alimenta
 *   gratis las estadísticas del perfil, del admin y la actividad reciente.
 */
import { read, update, nowISO } from "./db";
import { completeTema, getTemaProgress } from "./domain";
import type {
  Lp737Consolidation,
  Lp737ConsolidationSentence,
  Lp737ConsolidationTable,
} from "@/lib/lp737/types";

const KEY = "lp737_state";
const TEMA_PREFIX = "lp737:";

export interface Lp737ConsolidationResult {
  /** true_false guarda `value`; sentence/table guardan `values`. */
  value?: boolean;
  values?: string[];
  correct: boolean;
}

export interface Lp737StateRow {
  id: string;
  userId: string;
  answers: Record<string, number>;
  consolidation: Record<string, Lp737ConsolidationResult>;
  updatedAt: string;
}

function emptyRow(userId: string): Lp737StateRow {
  return { id: `lp737_${userId}`, userId, answers: {}, consolidation: {}, updatedAt: nowISO() };
}

export function getLp737State(userId: string): Lp737StateRow {
  return read<Lp737StateRow[]>(KEY, []).find((r) => r.userId === userId) ?? emptyRow(userId);
}

function patchState(userId: string, patch: (row: Lp737StateRow) => Lp737StateRow) {
  update<Lp737StateRow[]>(KEY, [], (all) => {
    const current = all.find((r) => r.userId === userId) ?? emptyRow(userId);
    const next = { ...patch(current), updatedAt: nowISO() };
    return [...all.filter((r) => r.userId !== userId), next];
  });
}

/** Registra la opción elegida en una pregunta de lección (una sola vez). */
export function answerLp737Question(userId: string, questionId: string, option: number) {
  patchState(userId, (row) =>
    Object.prototype.hasOwnProperty.call(row.answers, questionId)
      ? row
      : { ...row, answers: { ...row.answers, [questionId]: option } },
  );
}

/**
 * Evalúa y guarda una consolidación. Devuelve el resultado calculado con las
 * mismas reglas del paquete original (comparación exacta contra la respuesta).
 */
export function saveLp737Consolidation(
  userId: string,
  activity: Lp737Consolidation,
  input: boolean | string[],
): Lp737ConsolidationResult {
  let result: Lp737ConsolidationResult;
  if (activity.type === "true_false") {
    const value = input === true;
    result = { value, correct: value === activity.answer };
  } else if (activity.type === "complete_sentence") {
    const values = input as string[];
    const a = activity as Lp737ConsolidationSentence;
    result = { values, correct: a.answers.every((ans, i) => values[i] === ans) };
  } else {
    const values = input as string[];
    const a = activity as Lp737ConsolidationTable;
    result = { values, correct: a.rows.every((row, i) => values[i] === row.answer) };
  }
  patchState(userId, (row) => ({
    ...row,
    consolidation: { ...row.consolidation, [activity.id]: result },
  }));
  return result;
}

/** IDs de lecciones de la ruta 737 completadas por el usuario. */
export function lp737CompletedLessons(userId: string): string[] {
  return getTemaProgress(userId)
    .filter((t) => t.completado && t.temaId.startsWith(TEMA_PREFIX))
    .map((t) => t.temaId.slice(TEMA_PREFIX.length));
}

export function isLp737LessonCompleted(userId: string, lessonId: string): boolean {
  return lp737CompletedLessons(userId).includes(lessonId);
}

/**
 * Marca una lección como estudiada. Reutiliza completeTema: alimenta
 * tema_progress (stats de Learning Paths) y la actividad reciente.
 */
export function completeLp737Lesson(userId: string, lessonId: string, lessonTitle: string) {
  if (isLp737LessonCompleted(userId, lessonId)) return;
  completeTema(userId, `${TEMA_PREFIX}${lessonId}`, null, `Ruta 737 · ${lessonTitle}`, 15);
}
