/**
 * Selectores de analítica (PRD §6.12 y §9): separan "Avance del curso"
 * (recorrido por la plataforma) de "Preparación estimada" (desempeño en
 * Cuestionarios y Simulador). No garantizan aprobación.
 */
import { MATERIAS_DEF } from "./materias";
import { SUBJECT_TEMAS } from "@/modules/data/registry";
import {
  getActivity,
  getBitacora,
  getClases,
  getClaseProgress,
  getFlashcards,
  getFlashSessions,
  getFlashStates,
  getQuizAttempts,
  getReports,
  getSimAttempts,
  getStreak,
  getStudyDays,
  getTemaProgress,
  getTotalStudyHours,
} from "./domain";
import { getUsers } from "./auth";
import type { User } from "./types";

export type Period = "hoy" | "semana" | "mes" | "todo";

export function periodStart(period: Period): Date {
  const d = new Date();
  if (period === "hoy") {
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "semana") return new Date(Date.now() - 7 * 86400000);
  if (period === "mes") return new Date(Date.now() - 30 * 86400000);
  return new Date(0);
}

const inPeriod = (iso: string, since: Date) => new Date(iso).getTime() >= since.getTime();

/* ───────────────────────── Por estudiante ───────────────────────── */

export interface MateriaPerf {
  slug: string;
  name: string;
  icon: string;
  /** % de aciertos en cuestionarios+simulador (null si sin datos). */
  avg: number | null;
  answered: number;
}

export function materiaPerformance(userId: string, period: Period = "todo"): MateriaPerf[] {
  const since = periodStart(period);
  const acc: Record<string, { c: number; t: number }> = {};
  const add = (slug: string, c: number, t: number) => {
    if (!acc[slug]) acc[slug] = { c: 0, t: 0 };
    acc[slug].c += c;
    acc[slug].t += t;
  };
  getQuizAttempts(userId)
    .filter((a) => inPeriod(a.date, since))
    .forEach((a) => Object.entries(a.porMateria).forEach(([m, v]) => add(m, v.correct, v.total)));
  getSimAttempts(userId)
    .filter((a) => inPeriod(a.date, since))
    .forEach((a) => Object.entries(a.porMateria).forEach(([m, v]) => add(m, v.correct, v.total)));
  return MATERIAS_DEF.map((m) => {
    const v = acc[m.slug];
    return {
      slug: m.slug,
      name: m.name,
      icon: m.icon,
      avg: v && v.t > 0 ? Math.round((v.c / v.t) * 100) : null,
      answered: v?.t ?? 0,
    };
  });
}

/** Avance del curso: recorrido por la plataforma (temas, clases, flashcards). */
export function courseProgress(userId: string): number {
  // Temas de Learning Paths disponibles
  const allTemas = Object.values(SUBJECT_TEMAS).flat();
  const totalTemas = allTemas.length;
  const doneTemas = getTemaProgress(userId).filter((t) => t.completado).length;
  const temaPct = totalTemas > 0 ? Math.min(1, doneTemas / totalTemas) : 0;

  const clases = getClases().filter((c) => c.status === "publicada");
  const doneClases = getClaseProgress(userId).filter((p) => p.completada).length;
  const clasePct = clases.length > 0 ? Math.min(1, doneClases / clases.length) : null;

  const cards = getFlashcards().filter((c) => c.status === "publicada");
  const dominadas = getFlashStates(userId).filter((s) => s.state === "dominada").length;
  const flashPct = cards.length > 0 ? Math.min(1, dominadas / cards.length) : 0;

  // Ponderación: temas 50%, clases 25% (si hay), flashcards 25%
  const parts: Array<[number, number]> =
    clasePct === null
      ? [
          [temaPct, 0.65],
          [flashPct, 0.35],
        ]
      : [
          [temaPct, 0.5],
          [clasePct, 0.25],
          [flashPct, 0.25],
        ];
  const pct = parts.reduce((s, [v, w]) => s + v * w, 0);
  return Math.round(pct * 100);
}

/** Preparación estimada: SOLO cuestionarios y simulador. No garantiza aprobación. */
export function estimatedReadiness(userId: string): number | null {
  const quiz = getQuizAttempts(userId);
  const sims = getSimAttempts(userId);
  let c = 0;
  let t = 0;
  quiz.forEach((a) => {
    c += a.correct;
    t += a.total;
  });
  // El simulador pesa doble: es la medición más fiel al examen.
  sims.forEach((a) => {
    c += a.correct * 2;
    t += a.total * 2;
  });
  if (t === 0) return null;
  return Math.round((c / t) * 100);
}

export function materiaProgressPct(userId: string, slug: string): number {
  const temas = SUBJECT_TEMAS[slug] ?? [];
  if (temas.length === 0) return 0;
  const done = new Set(
    getTemaProgress(userId)
      .filter((t) => t.completado)
      .map((t) => t.temaId),
  );
  return Math.round((temas.filter((t) => done.has(t.id)).length / temas.length) * 100);
}

export interface StudentStats {
  streak: number;
  answered: number;
  avgScore: number | null;
  studyHours: number;
  quizCount: number;
  simCount: number;
  temasDone: number;
  clasesVistas: number;
  flashDominadas: number;
  courseProgress: number;
  readiness: number | null;
}

export function studentStats(userId: string, period: Period = "todo"): StudentStats {
  const since = periodStart(period);
  const quiz = getQuizAttempts(userId).filter((a) => inPeriod(a.date, since));
  const sims = getSimAttempts(userId).filter((a) => inPeriod(a.date, since));
  let c = 0;
  let t = 0;
  quiz.forEach((a) => {
    c += a.correct;
    t += a.total;
  });
  sims.forEach((a) => {
    c += a.correct;
    t += a.total;
  });
  const days = getStudyDays(userId);
  const secsInPeriod = Object.entries(days)
    .filter(([d]) => new Date(`${d}T12:00:00`).getTime() >= since.getTime() - 86400000)
    .reduce((s, [, v]) => s + v, 0);
  return {
    streak: getStreak(userId),
    answered: t,
    avgScore: t > 0 ? Math.round((c / t) * 100) : null,
    studyHours: period === "todo" ? getTotalStudyHours(userId) : Math.round(secsInPeriod / 3600),
    quizCount: quiz.length,
    simCount: sims.length,
    temasDone: getTemaProgress(userId).filter((x) => x.completado).length,
    clasesVistas: getClaseProgress(userId).filter((x) => x.completada).length,
    flashDominadas: getFlashStates(userId).filter((x) => x.state === "dominada").length,
    courseProgress: courseProgress(userId),
    readiness: estimatedReadiness(userId),
  };
}

/** Mensaje interpretativo de Pathy para Análisis (calculado, no inventado). */
export function pathyAnalysisMessage(user: User, period: Period): string {
  const stats = studentStats(user.id, period);
  const perf = materiaPerformance(user.id, "todo").filter((m) => m.avg !== null);
  const nombre = user.nombre.split(" ")[0];
  if (perf.length === 0) {
    return `¡Hola, ${nombre}! Aún no tengo datos de cuestionarios o simuladores para analizar. Haz tu primer cuestionario y aquí te diré exactamente qué va bien y qué ajustar.`;
  }
  const best = perf.reduce((a, b) => ((a.avg ?? 0) >= (b.avg ?? 0) ? a : b));
  const worst = perf.reduce((a, b) => ((a.avg ?? 100) <= (b.avg ?? 100) ? a : b));
  const parts: string[] = [];
  parts.push(
    `${nombre}, tu materia más fuerte es ${best.name} (${best.avg}% de aciertos).`,
  );
  if (worst.slug !== best.slug && (worst.avg ?? 100) < 70) {
    parts.push(
      `${worst.name} necesita atención (${worst.avg}%): te recomiendo un cuestionario corto de esa materia esta semana.`,
    );
  }
  if (stats.streak >= 3) parts.push(`Llevas ${stats.streak} días seguidos estudiando: no sueltes la racha.`);
  if (stats.readiness !== null)
    parts.push(
      `Tu preparación estimada es ${stats.readiness}% — recuerda que mide tu desempeño en práctica y simuladores, no garantiza el resultado del examen.`,
    );
  return parts.join(" ");
}

/* ───────────────────────── Panel Admin ───────────────────────── */

export interface AdminSummary {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  newLast7: number;
  avgCourseProgress: number;
  avgReadiness: number | null;
  simCount: number;
  quizCount: number;
  answered: number;
  weakestMaterias: { name: string; avg: number }[];
}

export function isStudentActive(u: User): boolean {
  return Date.now() - new Date(u.lastAccess).getTime() < 7 * 86400000;
}

export function adminSummary(): AdminSummary {
  const students = getUsers().filter((u) => u.role === "student" && !u.deactivatedAt);
  const active = students.filter(isStudentActive);
  const newLast7 = students.filter(
    (u) => Date.now() - new Date(u.createdAt).getTime() < 7 * 86400000,
  ).length;

  let quizCount = 0;
  let simCount = 0;
  let answered = 0;
  const progresses: number[] = [];
  const readiness: number[] = [];
  const matAcc: Record<string, { c: number; t: number }> = {};

  students.forEach((u) => {
    const q = getQuizAttempts(u.id);
    const s = getSimAttempts(u.id);
    quizCount += q.length;
    simCount += s.length;
    q.forEach((a) => (answered += a.total));
    s.forEach((a) => (answered += a.total));
    progresses.push(courseProgress(u.id));
    const r = estimatedReadiness(u.id);
    if (r !== null) readiness.push(r);
    materiaPerformance(u.id).forEach((m) => {
      if (m.avg === null) return;
      if (!matAcc[m.name]) matAcc[m.name] = { c: 0, t: 0 };
      matAcc[m.name].c += m.avg;
      matAcc[m.name].t += 1;
    });
  });

  const weakest = Object.entries(matAcc)
    .map(([name, v]) => ({ name, avg: Math.round(v.c / v.t) }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3);

  return {
    totalStudents: students.length,
    activeStudents: active.length,
    inactiveStudents: students.length - active.length,
    newLast7,
    avgCourseProgress:
      progresses.length > 0
        ? Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length)
        : 0,
    avgReadiness:
      readiness.length > 0
        ? Math.round(readiness.reduce((a, b) => a + b, 0) / readiness.length)
        : null,
    simCount,
    quizCount,
    answered,
    weakestMaterias: weakest,
  };
}

/* ───────────────────────── Analítica general (PRD 9.11) ───────────────────────── */

export interface GlobalAnalytics extends AdminSummary {
  /** Promedio global de aciertos (cuestionarios + simuladores). */
  avgScore: number | null;
  temasDone: number;
  clasesVistas: number;
  flashRepasadas: number;
  usoHerramientas: { kind: string; label: string; count: number }[];
  actividad7d: number;
  actividad30d: number;
  /** Desempeño global por materia, de menor a mayor. */
  materias: { name: string; avg: number }[];
  preguntasReportadas: number;
}

const KIND_LABEL: Record<string, string> = {
  quiz: "Cuestionarios",
  simulador: "Simulador CIAAC",
  tema: "Learning Paths",
  clase: "Clases grabadas",
  flashcards: "Flashcards",
  biblioteca: "Biblioteca",
  yaris: "Yaris (tutor IA)",
  bitacora: "Bitácora (con Pathy)",
};

export function globalAnalytics(): GlobalAnalytics {
  const base = adminSummary();
  const students = getUsers().filter((u) => u.role === "student" && !u.deactivatedAt);

  let correct = 0;
  let total = 0;
  let temasDone = 0;
  let clasesVistas = 0;
  let flashRepasadas = 0;
  const matAcc: Record<string, { c: number; t: number }> = {};

  students.forEach((u) => {
    getQuizAttempts(u.id).forEach((a) => { correct += a.correct; total += a.total; });
    getSimAttempts(u.id).forEach((a) => { correct += a.correct; total += a.total; });
    temasDone += getTemaProgress(u.id).filter((x) => x.completado).length;
    clasesVistas += getClaseProgress(u.id).filter((x) => x.completada).length;
    flashRepasadas += getFlashSessions(u.id).reduce((s, f) => s + f.total, 0);
    materiaPerformance(u.id).forEach((m) => {
      if (m.avg === null) return;
      if (!matAcc[m.name]) matAcc[m.name] = { c: 0, t: 0 };
      matAcc[m.name].c += m.avg;
      matAcc[m.name].t += 1;
    });
  });

  const activity = getActivity();
  const now = Date.now();
  const counts: Record<string, number> = {};
  let actividad7d = 0;
  let actividad30d = 0;
  activity.forEach((a) => {
    counts[a.kind] = (counts[a.kind] ?? 0) + 1;
    const age = now - new Date(a.date).getTime();
    if (age < 7 * 86400000) actividad7d += 1;
    if (age < 30 * 86400000) actividad30d += 1;
  });

  const preguntasReportadas = getReports().filter((r) =>
    /pregunta|respuesta|explicaci/i.test(r.tipo),
  ).length;

  return {
    ...base,
    avgScore: total > 0 ? Math.round((correct / total) * 100) : null,
    temasDone,
    clasesVistas,
    flashRepasadas,
    usoHerramientas: Object.entries(KIND_LABEL)
      .map(([kind, label]) => ({ kind, label, count: counts[kind] ?? 0 }))
      .sort((a, b) => b.count - a.count),
    actividad7d,
    actividad30d,
    materias: Object.entries(matAcc)
      .map(([name, v]) => ({ name, avg: Math.round(v.c / v.t) }))
      .sort((a, b) => a.avg - b.avg),
    preguntasReportadas,
  };
}

/** Estado general sugerido de un estudiante para la lista del admin (PRD 9.3). */
export function studentGeneralState(u: User): string {
  if (u.accessStatus === "vencido") return "Acceso vencido";
  if (u.accessStatus === "prueba") return "Acceso de prueba";
  if (u.deactivatedAt) return "Eliminación pendiente";
  if (!isStudentActive(u)) {
    return Date.now() - new Date(u.lastAccess).getTime() > 21 * 86400000
      ? "En riesgo de abandono"
      : "Inactivo";
  }
  if (u.fechaCiaac) {
    const days = (new Date(`${u.fechaCiaac}T12:00:00`).getTime() - Date.now()) / 86400000;
    if (days >= 0 && days <= 30) return "Cerca del CIAAC";
  }
  const r = estimatedReadiness(u.id);
  if (r !== null && r < 60) return "Necesita apoyo";
  if (courseProgress(u.id) >= 40) return "Buen avance";
  return "Activo";
}

/** Datos recientes para "Actividad reciente" (estudiante o global). */
export function recentActivity(userId?: string, limit = 8) {
  return getActivity(userId)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

/** Últimas entradas de bitácora con nivel de ánimo, para gráficos. */
export function moodHistory(userId: string, limit = 7) {
  return getBitacora(userId).slice(0, limit);
}
