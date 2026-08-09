/**
 * Historial del Pilot Aptitude Trainer (módulo Compass).
 *
 * Cada sesión terminada guarda seed, versiones, nivel, input y métricas: con
 * eso el resultado es auditable y la tendencia sólo compara sesiones
 * comparables (mismo módulo + modo + versión de scoring). Se sincroniza a la
 * nube como colección por usuario (`compass_sessions` en `sync.ts`).
 */
import { read, update, uid, nowISO } from "./db";
import { logActivity } from "./domain";
import {
  COMPASS_MODULE_MAP,
  COMPASS_MODULE_VERSION,
  COMPASS_SCORING_VERSION,
} from "@/modules/compass/config";
import type {
  CompassInput,
  CompassMetric,
  CompassMode,
  CompassModuleId,
  CompassResult,
} from "@/modules/compass/types";

export interface CompassSessionRecord {
  id: string;
  userId: string;
  date: string; // ISO
  moduleId: CompassModuleId;
  mode: CompassMode;
  level: number;
  seed: number;
  moduleVersion: number;
  scoringVersion: number;
  input: CompassInput;
  durationSec: number;
  score: number;
  metrics: CompassMetric[];
  raw: Record<string, number>;
  interruptions: number;
  advice: string;
  /** Agrupa las sesiones nacidas del mismo simulacro compacto. */
  simulacroId?: string;
}

const KEY = "compass_sessions";

export function getCompassSessions(userId: string): CompassSessionRecord[] {
  return read<CompassSessionRecord[]>(KEY, [])
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function saveCompassSession(input: {
  userId: string;
  mode: CompassMode;
  level: number;
  seed: number;
  result: CompassResult;
  simulacroId?: string;
}): CompassSessionRecord {
  const { result } = input;
  const row: CompassSessionRecord = {
    id: uid("cps"),
    userId: input.userId,
    date: nowISO(),
    moduleId: result.moduleId,
    mode: input.mode,
    level: input.level,
    seed: input.seed,
    moduleVersion: COMPASS_MODULE_VERSION,
    scoringVersion: COMPASS_SCORING_VERSION,
    input: result.input,
    durationSec: Math.round(result.durationSec),
    score: result.score,
    metrics: result.metrics,
    raw: result.raw,
    interruptions: result.interruptions,
    advice: result.advice,
    simulacroId: input.simulacroId,
  };
  update<CompassSessionRecord[]>(KEY, [], (all) => [...all, row]);
  logActivity({
    userId: input.userId,
    kind: "compass",
    label: `Aptitudes — ${COMPASS_MODULE_MAP[result.moduleId].nombre} (${input.mode})`,
    score: result.score,
    durationMin: Math.max(1, Math.round(result.durationSec / 60)),
  });
  return row;
}

/** Sesiones comparables entre sí: mismo módulo, modo y versiones de motor/scoring. */
function comparable(
  sessions: CompassSessionRecord[],
  moduleId: CompassModuleId,
  mode?: CompassMode,
): CompassSessionRecord[] {
  return sessions.filter(
    (s) =>
      s.moduleId === moduleId &&
      s.scoringVersion === COMPASS_SCORING_VERSION &&
      s.moduleVersion === COMPASS_MODULE_VERSION &&
      (mode === undefined || s.mode === mode),
  );
}

export interface CompassModuleStats {
  moduleId: CompassModuleId;
  sesiones: number;
  mejorScore: number | null;
  ultimoScore: number | null;
  /** Delta del último score vs la mediana de las 3 sesiones previas. */
  tendencia: number | null;
  /** Nivel sugerido para la próxima práctica (1-5). */
  nivelSugerido: number;
  ultimaFecha: string | null;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function compassModuleStats(userId: string, moduleId: CompassModuleId): CompassModuleStats {
  const all = comparable(getCompassSessions(userId), moduleId); // ya ordenadas desc
  const scores = all.map((s) => s.score);
  const last = all[0] ?? null;

  let tendencia: number | null = null;
  if (all.length >= 3) {
    const prev = all.slice(1, 4).map((s) => s.score);
    tendencia = Math.round((last?.score ?? 0) - median(prev));
  }

  // Nivel sugerido: sube tras 2 prácticas seguidas ≥75 en el nivel actual,
  // baja tras 2 seguidas <40. Transparente y explicable, sin cajas negras.
  const practicas = comparable(all, moduleId, "practica");
  let nivelSugerido = practicas[0]?.level ?? 1;
  const delNivel = practicas.filter((s) => s.level === nivelSugerido);
  if (delNivel.length >= 2 && delNivel[0].score >= 75 && delNivel[1].score >= 75) {
    nivelSugerido = Math.min(5, nivelSugerido + 1);
  } else if (delNivel.length >= 2 && delNivel[0].score < 40 && delNivel[1].score < 40) {
    nivelSugerido = Math.max(1, nivelSugerido - 1);
  }

  return {
    moduleId,
    sesiones: all.length,
    mejorScore: scores.length > 0 ? Math.max(...scores) : null,
    ultimoScore: last?.score ?? null,
    tendencia,
    nivelSugerido,
    ultimaFecha: last?.date ?? null,
  };
}

export interface CompassProfile {
  /** Score de perfil por módulo: mediana de las últimas 3 sesiones (null sin datos). */
  porModulo: Record<CompassModuleId, number | null>;
  /** Módulo más débil con datos, para recomendar la siguiente sesión. */
  debil: CompassModuleId | null;
  sesionesTotales: number;
  minutosTotales: number;
}

const MODULE_IDS: CompassModuleId[] = [
  "control",
  "slalom",
  "memoria",
  "calculo",
  "orientacion",
  "multitarea",
];

export function compassProfile(userId: string): CompassProfile {
  const sessions = getCompassSessions(userId);
  const porModulo = {} as Record<CompassModuleId, number | null>;
  for (const id of MODULE_IDS) {
    const recent = comparable(sessions, id)
      .slice(0, 3)
      .map((s) => s.score);
    porModulo[id] = recent.length > 0 ? Math.round(median(recent)) : null;
  }
  const conDatos = MODULE_IDS.filter((id) => porModulo[id] !== null);
  const debil =
    conDatos.length > 0
      ? conDatos.reduce((min, id) => ((porModulo[id] ?? 0) < (porModulo[min] ?? 0) ? id : min))
      : null;
  return {
    porModulo,
    debil,
    sesionesTotales: sessions.length,
    minutosTotales: Math.round(sessions.reduce((acc, s) => acc + s.durationSec, 0) / 60),
  };
}
