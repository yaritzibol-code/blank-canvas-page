/**
 * Historial de entrevistas RTARI.
 *
 * Cada entrevista terminada se guarda con su transcripción y su debrief para
 * que el alumno vea su progreso en el tiempo (y pueda releer las correcciones
 * sin volver a pagar minutos de voz). Se sincroniza con la nube como el resto
 * de colecciones por usuario (`rtari_sessions` en `sync.ts`).
 */
import { read, update, uid, nowISO } from "./db";
import { icaoOverall } from "@/modules/rtari/icao";
import type { RtariDebrief } from "@/modules/rtari/debrief";
import type { RtariNivel, RtariVoice } from "@/modules/rtari/config";

export interface RtariTurnRecord {
  role: "examiner" | "candidate";
  text: string;
  /** ms desde el inicio de la entrevista. */
  at: number;
}

export interface RtariSessionRecord {
  id: string;
  userId: string;
  date: string;
  durationSec: number;
  nivel: RtariNivel;
  voice: RtariVoice;
  questionIds: string[];
  turns: RtariTurnRecord[];
  /** Evaluación; `null` mientras no se pudo generar. */
  debrief: RtariDebrief | null;
  /** Nivel OACI global (el más bajo de las seis áreas). */
  nivelGlobal: number | null;
}

const KEY = "rtari_sessions";

export function getRtariSessions(userId: string): RtariSessionRecord[] {
  return read<RtariSessionRecord[]>(KEY, [])
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function saveRtariSession(input: {
  userId: string;
  durationSec: number;
  nivel: RtariNivel;
  voice: RtariVoice;
  questionIds: string[];
  turns: RtariTurnRecord[];
  debrief?: RtariDebrief | null;
}): RtariSessionRecord {
  const debrief = input.debrief ?? null;
  const row: RtariSessionRecord = {
    id: uid("rtari"),
    userId: input.userId,
    date: nowISO(),
    durationSec: input.durationSec,
    nivel: input.nivel,
    voice: input.voice,
    questionIds: input.questionIds,
    turns: input.turns,
    debrief,
    nivelGlobal: debrief ? icaoOverall(debrief.niveles) : null,
  };
  update<RtariSessionRecord[]>(KEY, [], (all) => [...all, row]);
  return row;
}

/** Adjunta el debrief a una entrevista ya guardada (llega unos segundos después). */
export function setRtariDebrief(id: string, debrief: RtariDebrief) {
  update<RtariSessionRecord[]>(KEY, [], (all) =>
    all.map((s) =>
      s.id === id ? { ...s, debrief, nivelGlobal: icaoOverall(debrief.niveles) } : s,
    ),
  );
}

export interface RtariStats {
  sesiones: number;
  /** Minutos totales de entrevista. */
  minutos: number;
  /** Mejor nivel global alcanzado, `null` si aún no hay evaluación. */
  mejorNivel: number | null;
  /** Nivel de la última entrevista evaluada. */
  ultimoNivel: number | null;
  /** Preguntas distintas del banco que ya le han tocado. */
  preguntasVistas: number;
}

export function rtariStats(userId: string): RtariStats {
  const sesiones = getRtariSessions(userId);
  const niveles = sesiones
    .map((s) => s.nivelGlobal)
    .filter((n): n is number => typeof n === "number");
  const vistas = new Set<string>();
  sesiones.forEach((s) => s.questionIds.forEach((q) => vistas.add(q)));

  return {
    sesiones: sesiones.length,
    minutos: Math.round(sesiones.reduce((acc, s) => acc + s.durationSec, 0) / 60),
    mejorNivel: niveles.length > 0 ? Math.max(...niveles) : null,
    // `getRtariSessions` ordena de la más nueva a la más vieja.
    ultimoNivel: sesiones.find((s) => s.nivelGlobal !== null)?.nivelGlobal ?? null,
    preguntasVistas: vistas.size,
  };
}
