/**
 * Petición del debrief desde el navegador.
 *
 * Vive aparte de la sesión de voz porque ocurre cuando esa sesión ya se cerró:
 * la entrevista terminó, el micrófono está libre y lo único que queda es
 * mandar la transcripción a evaluar.
 */
import { supabase } from "@/integrations/supabase/client";
import { RTARI_MAX_TURNOS } from "@/modules/rtari/config";
import type { RtariDebrief, DebriefTurn } from "@/modules/rtari/debrief";

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
  let token: string | undefined;
  try {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token;
  } catch {
    token = undefined;
  }
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
