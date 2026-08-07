/**
 * Bitácora de conversaciones con Yaris (`yaris_messages`).
 *
 * Guarda el turno completo —lo que escribió la estudiante y lo que respondió
 * Yaris— para que el panel admin pueda auditar la calidad de las respuestas.
 * Nunca lanza: si la bitácora falla, la conversación sigue.
 */

export interface YarisLogInput {
  userId: string;
  pregunta: string;
  respuesta: string;
  seccion?: string | null;
  materia?: string | null;
  tono?: string | null;
  fuente?: "chat" | "stream";
  preAnswer?: boolean;
  questionText?: string | null;
  tokensIn?: number;
  tokensOut?: number;
  latencyMs?: number;
  success?: boolean;
  errorMessage?: string | null;
}

const cap = (v: string | null | undefined, n: number): string | null =>
  typeof v === "string" && v.length > 0 ? v.slice(0, n) : null;

export async function logYarisMessage(input: YarisLogInput): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("yaris_messages").insert({
      user_id: input.userId,
      seccion: cap(input.seccion, 120),
      materia: cap(input.materia, 120),
      tono: cap(input.tono, 20),
      fuente: input.fuente ?? "chat",
      pre_answer: Boolean(input.preAnswer),
      question_text: cap(input.questionText, 4000),
      pregunta: (input.pregunta ?? "").slice(0, 8000),
      respuesta: (input.respuesta ?? "").slice(0, 20000),
      tokens_in: input.tokensIn ?? 0,
      tokens_out: input.tokensOut ?? 0,
      latency_ms: input.latencyMs ?? 0,
      success: input.success ?? true,
      error_message: cap(input.errorMessage, 500),
    });
  } catch {
    /* la bitácora nunca rompe el chat */
  }
}
