/**
 * Lo que el navegador le pide al servidor cuando la sesión de voz YA terminó:
 * liquidar los minutos, consultar el saldo y evaluar la entrevista.
 *
 * Vive aparte de `rtari-realtime.ts` porque ninguna de estas llamadas toca el
 * micrófono ni la conexión WebRTC.
 */
import { supabase } from "@/integrations/supabase/client";
import { RTARI_MAX_TURNOS } from "@/modules/rtari/config";
import type { RtariDebrief, DebriefTurn } from "@/modules/rtari/debrief";
import type { RtariCierre } from "@/lib/rtari-realtime";

/** Token del usuario en sesión, o `undefined` si no hay. */
async function bearer(): Promise<string | undefined> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  } catch {
    return undefined;
  }
}

export interface RtariSaldoInfo {
  /** Segundos incluidos que quedan en el ciclo. */
  incluidosRestantes: number;
  incluidosTotales: number;
  comprados: number;
  disponible: number;
  ciclo: string;
}

/** Saldo del alumno, con los minutos del ciclo ya otorgados. */
export async function fetchSaldo(): Promise<RtariSaldoInfo | null> {
  const token = await bearer();
  if (!token) return null;
  try {
    const res = await fetch("/api/rtari/saldo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { saldo?: RtariSaldoInfo };
    return body.saldo ?? null;
  } catch {
    return null;
  }
}

/**
 * Liquida la entrevista: devuelve los minutos reservados que no se usaron y
 * bitacoriza el consumo real de voz.
 *
 * Se llama siempre al colgar, aunque el debrief falle: lo que está en juego
 * son los minutos del alumno.
 */
export async function settleSession(cierre: RtariCierre): Promise<RtariSaldoInfo | null> {
  if (!cierre.sessionId) return null;
  const token = await bearer();
  if (!token) return null;
  try {
    const res = await fetch("/api/rtari/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(cierre),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { saldo?: RtariSaldoInfo };
    return body.saldo ?? null;
  } catch {
    return null;
  }
}

export type DebriefFallo = "sin_sesion" | "requiere_pro" | "limite" | "red" | "servidor";

export interface DebriefResultado {
  ok: boolean;
  debrief?: RtariDebrief;
  fallo?: DebriefFallo;
}

export async function requestDebrief(input: {
  questionIds: string[];
  turns: DebriefTurn[];
  durationSec: number;
}): Promise<DebriefResultado> {
  const token = await bearer();
  if (!token) return { ok: false, fallo: "sin_sesion" };

  // Una entrevista larga puede pasarse del tope: se conserva el final, que es
  // donde están las respuestas más elaboradas.
  const turns = input.turns.slice(-RTARI_MAX_TURNOS);
  if (turns.length === 0) return { ok: false, fallo: "servidor" };

  let res: Response;
  try {
    res = await fetch("/api/rtari/debrief", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        questionIds: input.questionIds,
        turns,
        durationSec: Math.max(0, Math.round(input.durationSec)),
      }),
    });
  } catch {
    return { ok: false, fallo: "red" };
  }

  if (res.status === 402) return { ok: false, fallo: "requiere_pro" };
  if (res.status === 429) return { ok: false, fallo: "limite" };
  if (!res.ok) return { ok: false, fallo: "servidor" };

  try {
    const body = (await res.json()) as { debrief?: RtariDebrief };
    if (!body.debrief) return { ok: false, fallo: "servidor" };
    return { ok: true, debrief: body.debrief };
  } catch {
    return { ok: false, fallo: "servidor" };
  }
}
