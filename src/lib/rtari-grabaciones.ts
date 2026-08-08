/**
 * Bitácora auditable de las entrevistas RTARI.
 *
 * Cada entrevista terminada deja dos rastros medibles:
 *
 *  1. Un renglón en `rtari_grabaciones` con los minutos hablados, el modelo de
 *     voz, la dificultad y el costo real que reportó la liquidación. Es lo que
 *     el panel suma para saber cuánta voz se consumió y cuánto costó.
 *  2. El audio mezclado (alumno + sinodal) en el bucket privado `rtari-audio`,
 *     bajo `<user_id>/<session_id>.webm`, para poder escucharlo en el perfil
 *     del estudiante.
 *
 * Nada de esto puede tumbar la entrevista: si el audio no sube, el renglón se
 * guarda igual y simplemente no habrá qué reproducir.
 */
import { supabase } from "@/integrations/supabase/client";

export const RTARI_BUCKET = "rtari-audio";

export interface RtariGrabacionInput {
  userId: string;
  /** Id de la sesión de voz del servidor (el mismo de la liquidación). */
  sessionId: string;
  /** Id del registro local, para casar con el historial del alumno. */
  localSessionId: string;
  durationSec: number;
  model: string;
  nivel: string;
  voice: string;
  nivelGlobal: number | null;
  costUsd: number | null;
  preguntas: number;
  audio: Blob | null;
}

export async function registrarGrabacion(input: RtariGrabacionInput): Promise<void> {
  let storagePath: string | null = null;

  if (input.audio && input.audio.size > 0) {
    const ext = input.audio.type.includes("mp4") ? "mp4" : "webm";
    const path = `${input.userId}/${input.sessionId}.${ext}`;
    const { error } = await supabase.storage
      .from(RTARI_BUCKET)
      .upload(path, input.audio, { contentType: input.audio.type || "audio/webm", upsert: true });
    if (!error) storagePath = path;
  }

  await supabase.from("rtari_grabaciones").upsert(
    {
      user_id: input.userId,
      session_id: input.sessionId,
      local_session_id: input.localSessionId,
      storage_path: storagePath,
      duration_sec: Math.max(0, Math.round(input.durationSec)),
      model: input.model,
      nivel: input.nivel,
      voice: input.voice,
      nivel_global: input.nivelGlobal,
      cost_usd: input.costUsd,
      preguntas: input.preguntas,
    },
    { onConflict: "user_id,session_id" },
  );
}

/** Actualiza el nivel OACI del renglón cuando el debrief llega después. */
export async function actualizarNivelGrabacion(
  userId: string,
  sessionId: string,
  nivelGlobal: number,
): Promise<void> {
  await supabase
    .from("rtari_grabaciones")
    .update({ nivel_global: nivelGlobal })
    .eq("user_id", userId)
    .eq("session_id", sessionId);
}
