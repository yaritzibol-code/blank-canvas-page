/**
 * Motor de logros: arma el contexto con la actividad real del usuario,
 * evalúa el catálogo y persiste los desbloqueos.
 *
 * Los desbloqueos son permanentes: una vez registrada la fecha, el logro no
 * vuelve a evaluarse (si el usuario pierde la racha conserva "Imparable").
 */
import { read, update, nowISO, todayKey } from "@/lib/store/db";
import {
  getActivity,
  getQuizAttempts,
  getSimAttempts,
  getFlashSessions,
  getFlashStates,
  getFlashcards,
  getStudyDays,
  getMateriales,
} from "@/lib/store/domain";
import { getLpCompleted } from "@/lib/store/lp-nav";
import { LP_CATEGORIES, subjectSequence } from "@/lib/lp/taxonomy";
import { LOGROS, LOGROS_POR_ID } from "./catalog";
import type { LogroCtx, LogroEstado } from "./types";

export interface LogroRow {
  id: string;
  userId: string;
  logroId: string;
  at: string;
}

export interface LogroDestacadoRow {
  id: string;
  userId: string;
  logroId: string;
  orden: number;
}

export const MAX_DESTACADOS = 3;

/* ───────────────────────── Persistencia ───────────────────────── */

export function getLogrosRows(userId: string): LogroRow[] {
  return read<LogroRow[]>("logros", []).filter((r) => r.userId === userId);
}

export function getDestacados(userId: string): string[] {
  return read<LogroDestacadoRow[]>("logros_destacados", [])
    .filter((r) => r.userId === userId)
    .sort((a, b) => a.orden - b.orden)
    .map((r) => r.logroId);
}

export function setDestacados(userId: string, logroIds: string[]) {
  const ids = logroIds.slice(0, MAX_DESTACADOS);
  update<LogroDestacadoRow[]>("logros_destacados", [], (all) => [
    ...all.filter((r) => r.userId !== userId),
    ...ids.map((logroId, i) => ({ id: `${userId}:${logroId}`, userId, logroId, orden: i })),
  ]);
}

/* ───────────────────────── Utilidades ───────────────────────── */

const dayOf = (iso: string) => iso.slice(0, 10);

function rachaMaxima(dias: Set<string>): number {
  const orden = Array.from(dias).sort();
  let max = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of orden) {
    const cur = new Date(`${d}T00:00:00`);
    if (prev && (cur.getTime() - prev.getTime()) / 86400000 === 1) run++;
    else run = 1;
    prev = cur;
    if (run > max) max = run;
  }
  return max;
}

function rachaActual(dias: Set<string>): number {
  let n = 0;
  const cursor = new Date();
  if (!dias.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dias.has(todayKey(cursor))) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

/** Racha más larga (en números) de una serie que cumple un predicado. */
function maxRun(values: number[], ok: (v: number) => boolean): number {
  let max = 0;
  let run = 0;
  for (const v of values) {
    run = ok(v) ? run + 1 : 0;
    if (run > max) max = run;
  }
  return max;
}

/* ───────────────────────── Contexto ───────────────────────── */

export function buildLogroCtx(userId: string): LogroCtx {
  const activity = getActivity(userId)
    .filter((a) => a.kind !== "login")
    .sort((a, b) => a.date.localeCompare(b.date));
  const quizzes = getQuizAttempts(userId).sort((a, b) => a.date.localeCompare(b.date));
  const sims = getSimAttempts(userId);
  const flashSessions = getFlashSessions(userId);
  const flashStates = getFlashStates(userId);
  const flashcards = getFlashcards();
  const studyDays = getStudyDays(userId);
  const lpDone = new Set(getLpCompleted(userId));
  const materiales = getMateriales();

  /* Días con actividad */
  const dias = new Set<string>(activity.map((a) => dayOf(a.date)));
  Object.entries(studyDays).forEach(([d, secs]) => {
    if (secs >= 60) dias.add(d);
  });

  const porDia = new Map<string, number>();
  const herramientasPorDia = new Map<string, Set<string>>();
  activity.forEach((a) => {
    const d = dayOf(a.date);
    porDia.set(d, (porDia.get(d) ?? 0) + 1);
    if (!herramientasPorDia.has(d)) herramientasPorDia.set(d, new Set());
    herramientasPorDia.get(d)!.add(a.kind);
  });

  const porMes = new Map<string, Set<string>>();
  dias.forEach((d) => {
    const m = d.slice(0, 7);
    if (!porMes.has(m)) porMes.set(m, new Set());
    porMes.get(m)!.add(d);
  });

  const hora = (iso: string) => new Date(iso).getHours();
  const sesionesEstudio = activity.filter((a) => a.durationMin > 0);

  /* Cuestionarios */
  const pct = (q: { correct: number; total: number }) =>
    q.total ? Math.round((q.correct / q.total) * 100) : 0;
  const quizPcts = quizzes.map(pct);
  const claveQuiz = (q: (typeof quizzes)[number]) =>
    q.titulo ?? (q.materias.length ? q.materias.slice().sort().join("+") : "general");

  let mejoroRespectoAnterior = false;
  let maxMejora = 0;
  let bajoLuegoMejor = false;
  let repetidoMejorado = false;
  const previoPorClave = new Map<string, number>();
  const materiaPcts = new Map<string, number[]>();
  let primerIntento90 = false;

  quizzes.forEach((q, i) => {
    const p = quizPcts[i];
    const k = claveQuiz(q);
    const prev = previoPorClave.get(k);
    if (prev !== undefined) {
      if (p > prev) {
        repetidoMejorado = true;
        maxMejora = Math.max(maxMejora, p - prev);
        if (prev < 70) bajoLuegoMejor = true;
      }
    } else if (p >= 90) {
      primerIntento90 = true;
    }
    previoPorClave.set(k, Math.max(prev ?? 0, p));
    if (i > 0 && p > quizPcts[i - 1]) mejoroRespectoAnterior = true;
    q.materias.forEach((m) => {
      if (!materiaPcts.has(m)) materiaPcts.set(m, []);
      materiaPcts.get(m)!.push(p);
    });
  });

  const materiasQuiz90 = Array.from(materiaPcts.values()).filter((ps) =>
    ps.some((p) => p >= 90),
  ).length;
  const materiasDominadas = Array.from(materiaPcts.values()).filter(
    (ps) => ps.length >= 2 && ps.every((p) => p >= 90),
  ).length;

  const ultimos10 = quizPcts.slice(-10);
  const promedioUltimos10 =
    ultimos10.length >= 10
      ? Math.round(ultimos10.reduce((a, b) => a + b, 0) / ultimos10.length)
      : null;
  const rangoUltimos10 =
    ultimos10.length >= 10 ? Math.max(...ultimos10) - Math.min(...ultimos10) : null;
  const promedioGeneral = quizPcts.length
    ? Math.round(quizPcts.reduce((a, b) => a + b, 0) / quizPcts.length)
    : null;

  let mejoras5Consecutivas = false;
  for (let i = 4; i < quizPcts.length; i++) {
    if (
      quizPcts[i] > quizPcts[i - 1] &&
      quizPcts[i - 1] > quizPcts[i - 2] &&
      quizPcts[i - 2] > quizPcts[i - 3] &&
      quizPcts[i - 3] > quizPcts[i - 4]
    ) {
      mejoras5Consecutivas = true;
      break;
    }
  }

  /* Learning Paths */
  let lpMateriasCompletas = 0;
  let materiasConLp = 0;
  let maxProgresoMateria = 0;
  let rutaProgresoMax = 0;
  LP_CATEGORIES.forEach((cat) => {
    let catDone = 0;
    let catTotal = 0;
    cat.subjects.forEach((s) => {
      const seq = subjectSequence(s);
      if (seq.length === 0) return;
      const done = seq.filter((x) => lpDone.has(x.item.id)).length;
      catDone += done;
      catTotal += seq.length;
      if (done > 0) materiasConLp++;
      const p = Math.round((done / seq.length) * 100);
      if (p > maxProgresoMateria) maxProgresoMateria = p;
      if (done === seq.length) lpMateriasCompletas++;
    });
    if (catTotal > 0) {
      const p = Math.round((catDone / catTotal) * 100);
      if (p > rutaProgresoMax) rutaProgresoMax = p;
    }
  });

  /* Flashcards */
  const dominadas = new Set(
    flashStates.filter((s) => s.state === "dominada").map((s) => s.cardId),
  );
  const porSeccion = new Map<string, string[]>();
  const porMateriaCards = new Map<string, string[]>();
  flashcards.forEach((c) => {
    const sec = `${c.materia}::${c.tema}`;
    if (!porSeccion.has(sec)) porSeccion.set(sec, []);
    porSeccion.get(sec)!.push(c.id);
    if (!porMateriaCards.has(c.materia)) porMateriaCards.set(c.materia, []);
    porMateriaCards.get(c.materia)!.push(c.id);
  });
  const completos = (m: Map<string, string[]>) =>
    Array.from(m.values()).filter((ids) => ids.length > 0 && ids.every((id) => dominadas.has(id)))
      .length;

  const temasVistos = new Map<string, number>();
  flashSessions.forEach((s) => {
    const k = `${s.materia}::${s.tema}`;
    temasVistos.set(k, (temasVistos.get(k) ?? 0) + 1);
  });

  /* Biblioteca */
  const bibliotecaLabels = new Set(
    activity.filter((a) => a.kind === "biblioteca").map((a) => a.label),
  );
  const bibliotecaMaterias = new Set(
    Array.from(bibliotecaLabels)
      .map((l) => materiales.find((m) => l.includes(m.titulo))?.materia)
      .filter((m): m is string => !!m && m !== ""),
  );

  /* Día perfecto / semana perfecta */
  let diaPerfecto = false;
  porDia.forEach((count, d) => {
    if (count < 3) return;
    const califs = activity
      .filter((a) => dayOf(a.date) === d && a.score !== null)
      .map((a) => a.score as number);
    if (califs.length > 0 && califs.every((s) => s >= 90)) diaPerfecto = true;
  });
  const diasConActividadReal = new Set(activity.map((a) => dayOf(a.date)));
  const semanaPerfecta = rachaMaxima(diasConActividadReal) >= 7;

  const minutosTotales = Math.round(
    Object.values(studyDays).reduce((s, v) => s + v, 0) / 60,
  );

  return {
    actividades: activity.length,
    diasConActividad: dias.size,
    maxActividadesEnDia: Math.max(0, ...Array.from(porDia.values())),
    maxHerramientasEnDia: Math.max(
      0,
      ...Array.from(herramientasPorDia.values()).map((s) => s.size),
    ),
    herramientas: Array.from(new Set(activity.map((a) => a.kind))),
    diaPerfecto,
    semanaPerfecta,

    streakActual: rachaActual(dias),
    streakMax: rachaMaxima(dias),
    maxDiasEnMes: Math.max(0, ...Array.from(porMes.values()).map((s) => s.size)),
    sesionesMadrugada: sesionesEstudio.filter((a) => hora(a.date) < 9).length,
    sesionesNoche: sesionesEstudio.filter((a) => hora(a.date) >= 21).length,

    minutosTotales,
    sesiones30min: sesionesEstudio.filter((a) => a.durationMin >= 30).length,
    sesionesEstudio: sesionesEstudio.length,
    pathySesiones: activity.filter(
      (a) => a.kind === "pathy_session" && a.durationMin > 0,
    ).length,

    quizCount: quizzes.length,
    quizPcts,
    quiz80: quizPcts.filter((p) => p >= 80).length,
    quiz90: quizPcts.filter((p) => p >= 90).length,
    quizPerfectos: quizPcts.filter((p) => p >= 100).length,
    quiz90Consecutivos: maxRun(quizPcts, (p) => p >= 90),
    quiz95Consecutivos: maxRun(quizPcts, (p) => p >= 95),
    mejoras5Consecutivas,
    mejoroRespectoAnterior,
    maxMejora,
    repetidoMejorado,
    bajoLuegoMejor,
    primerIntento90,
    materiasQuiz90,
    materiasDominadas,
    promedioUltimos10,
    rangoUltimos10,
    promedioGeneral,
    contraReloj: quizzes.some((q) => q.total > 0 && q.durationMin > 0 && q.durationMin <= q.total),

    simCount: sims.length,

    lpCompletados: lpDone.size,
    materiasLpCompletas: lpMateriasCompletas,
    materiasConLp,
    maxProgresoMateria,
    rutaProgresoMax,

    flashEstudiadas: flashSessions.reduce((s, x) => s + x.total, 0),
    flashSesiones: flashSessions.length,
    flashMaxSesion: Math.max(0, ...flashSessions.map((s) => s.total)),
    flashRepetida: Array.from(temasVistos.values()).some((n) => n >= 2),
    flashRecuperadas: flashSessions.some((s) => s.review > 0) && dominadas.size > 0,
    flashSeccionesDominadas: completos(porSeccion),
    flashMateriasDominadas: completos(porMateriaCards),

    bibliotecaRecursos: bibliotecaLabels.size,
    bibliotecaMaterias: bibliotecaMaterias.size,
  };
}

/* ───────────────────────── Evaluación ───────────────────────── */

/**
 * Evalúa el catálogo y registra los logros recién cumplidos.
 * Devuelve los ids desbloqueados en esta pasada (para la notificación).
 */
export function evaluarLogros(userId: string): string[] {
  const yaTiene = new Set(getLogrosRows(userId).map((r) => r.logroId));
  const ctx = buildLogroCtx(userId);
  const nuevos: string[] = [];
  for (const logro of LOGROS) {
    if (yaTiene.has(logro.id)) continue;
    let ok = false;
    try {
      ok = logro.check(ctx);
    } catch {
      ok = false;
    }
    if (ok) nuevos.push(logro.id);
  }
  if (nuevos.length > 0) {
    const at = nowISO();
    update<LogroRow[]>("logros", [], (all) => [
      ...all,
      ...nuevos
        .filter((logroId) => !all.some((r) => r.userId === userId && r.logroId === logroId))
        .map((logroId) => ({ id: `${userId}:${logroId}`, userId, logroId, at })),
    ]);
  }
  return nuevos;
}

/** Estado completo del catálogo para el perfil. */
export function listarLogros(userId: string): LogroEstado[] {
  const rows = new Map(getLogrosRows(userId).map((r) => [r.logroId, r.at]));
  const destacados = new Set(getDestacados(userId));
  return LOGROS.map((l) => ({
    ...l,
    desbloqueado: rows.has(l.id),
    fecha: rows.get(l.id) ?? null,
    destacado: destacados.has(l.id),
  }));
}

export function logroPorId(id: string) {
  return LOGROS_POR_ID.get(id);
}
