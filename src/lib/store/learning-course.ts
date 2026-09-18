/**
 * Progreso de los Learning Paths (Jeppesen y rutas futuras).
 *
 * Réplica del modelo de los paquetes originales (completedLessons / answers /
 * consolidation) pero por usuario y por curso:
 * - Respuestas y consolidaciones viven en la colección `lp737_state`
 *   (nombre histórico: hoy guarda TODAS las rutas; una fila por usuario y
 *   curso, sincronizada a la nube en sync.ts). Las filas antiguas sin
 *   `courseId` pertenecen a la ruta 737.
 * - Las lecciones completadas usan el sistema existente de Learning Paths
 *   (`tema_progress` con el prefijo de cada curso, p. ej. "lp737:"), así que
 *   el avance alimenta gratis las estadísticas del perfil, del admin y la
 *   actividad reciente.
 */
import { read, update, nowISO } from "./db";
import { completeTema, getTemaProgress } from "./domain";
import type {
  LpConsolidation,
  LpConsolidationSentence,
  LpConsolidationTable,
} from "@/lib/lp/course-types";

const KEY = "lp737_state";

export interface LpConsolidationResult {
  /** true_false guarda `value`; sentence/table guardan `values`. */
  value?: boolean;
  values?: string[];
  correct: boolean;
}

export interface LpCourseStateRow {
  id: string;
  userId: string;
  /** Slug del curso. */
  courseId?: string;
  answers: Record<string, number>;
  consolidation: Record<string, LpConsolidationResult>;
  updatedAt: string;
}

function rowCourse(row: LpCourseStateRow): string {
  return row.courseId ?? "";
}

function emptyRow(userId: string, courseId: string): LpCourseStateRow {
  return {
    id: `lp_${courseId}_${userId}`,
    userId,
    courseId,
    answers: {},
    consolidation: {},
    updatedAt: nowISO(),
  };
}

export function getLpState(userId: string, courseId: string): LpCourseStateRow {
  return (
    read<LpCourseStateRow[]>(KEY, []).find((r) => r.userId === userId && rowCourse(r) === courseId) ??
    emptyRow(userId, courseId)
  );
}

function patchState(
  userId: string,
  courseId: string,
  patch: (row: LpCourseStateRow) => LpCourseStateRow,
) {
  update<LpCourseStateRow[]>(KEY, [], (all) => {
    const current =
      all.find((r) => r.userId === userId && rowCourse(r) === courseId) ??
      emptyRow(userId, courseId);
    const next = { ...patch(current), updatedAt: nowISO() };
    return [...all.filter((r) => !(r.userId === userId && rowCourse(r) === courseId)), next];
  });
}

/** Registra la opción elegida en una pregunta de lección (una sola vez). */
export function answerLpQuestion(
  userId: string,
  courseId: string,
  questionId: string,
  option: number,
) {
  patchState(userId, courseId, (row) =>
    Object.prototype.hasOwnProperty.call(row.answers, questionId)
      ? row
      : { ...row, answers: { ...row.answers, [questionId]: option } },
  );
}

/**
 * Evalúa y guarda una consolidación. Devuelve el resultado calculado con las
 * mismas reglas de los paquetes (comparación exacta contra la respuesta).
 */
export function saveLpConsolidation(
  userId: string,
  courseId: string,
  activity: LpConsolidation,
  input: boolean | string[],
): LpConsolidationResult {
  let result: LpConsolidationResult;
  if (activity.type === "true_false") {
    const value = input === true;
    result = { value, correct: value === activity.answer };
  } else if (activity.type === "complete_sentence") {
    const values = input as string[];
    const a = activity as LpConsolidationSentence;
    result = { values, correct: a.answers.every((ans, i) => values[i] === ans) };
  } else {
    const values = input as string[];
    const a = activity as LpConsolidationTable;
    result = { values, correct: a.rows.every((row, i) => values[i] === row.answer) };
  }
  patchState(userId, courseId, (row) => ({
    ...row,
    consolidation: { ...row.consolidation, [activity.id]: result },
  }));
  return result;
}

/** IDs de lecciones completadas de la ruta con el prefijo dado. */
export function lpCompletedLessons(userId: string, temaPrefix: string): string[] {
  return getTemaProgress(userId)
    .filter((t) => t.completado && t.temaId.startsWith(temaPrefix))
    .map((t) => t.temaId.slice(temaPrefix.length));
}

export function isLpLessonCompleted(userId: string, temaPrefix: string, lessonId: string): boolean {
  return lpCompletedLessons(userId, temaPrefix).includes(lessonId);
}

/**
 * Marca una lección como estudiada. Reutiliza completeTema: alimenta
 * tema_progress (stats de Learning Paths) y la actividad reciente.
 */
export function completeLpLesson(
  userId: string,
  temaPrefix: string,
  actividadLabel: string,
  lessonId: string,
  lessonTitle: string,
) {
  if (isLpLessonCompleted(userId, temaPrefix, lessonId)) return;
  completeTema(userId, `${temaPrefix}${lessonId}`, null, `${actividadLabel} · ${lessonTitle}`, 15);
}
