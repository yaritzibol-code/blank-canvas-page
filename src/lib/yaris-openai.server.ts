/**
 * Yaris IA sobre la API propia de OpenAI del proyecto (`OPENAI_API_KEY`).
 *
 * Incluye el rate limiting por usuario pedido por el equipo:
 *   10 solicitudes / minuto · 60 / hora · 150 / día
 *   ≤ 12,000 tokens de entrada por solicitud · ≤ 1,200 tokens de salida
 *   reasoning effort: low
 *
 * El conteo se hace contra la tabla `ai_usage`, que ya bitacoriza cada llamada.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const YARIS_MODEL = "gpt-5-mini";
export const MAX_INPUT_TOKENS = 12000;
export const MAX_OUTPUT_TOKENS = 1200;

export const RATE_LIMITS = [
  { windowMs: 60_000, max: 10, label: "por minuto" },
  { windowMs: 3_600_000, max: 60, label: "por hora" },
  { windowMs: 86_400_000, max: 150, label: "por día" },
] as const;

/** Estimación conservadora de tokens (~4 caracteres por token). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Recorta el historial (de más antiguo a más nuevo) hasta caber en el tope de
 * tokens de entrada, conservando siempre el system prompt y el último turno.
 */
export function fitInputBudget(
  system: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
): Array<{ role: string; content: string }> {
  let budget = MAX_INPUT_TOKENS - estimateTokens(system) - 32;
  const kept: Array<{ role: string; content: string }> = [];
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i]!;
    let content = msg.content;
    let cost = estimateTokens(content);
    if (cost > budget) {
      if (kept.length === 0) {
        // El último turno siempre viaja, aunque haya que truncarlo.
        content = content.slice(0, Math.max(0, budget * 4));
        cost = estimateTokens(content);
      } else break;
    }
    budget -= cost;
    kept.unshift({ role: msg.role, content });
    if (budget <= 0) break;
  }
  return [{ role: "system", content: system }, ...kept];
}

export interface RateVerdict {
  allowed: boolean;
  message?: string;
  retryAfterSec?: number;
}

/** Verifica los tres límites por usuario contra `ai_usage`. */
export async function checkUserRateLimit(userId: string): Promise<RateVerdict> {
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("ai_usage")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { allowed: true }; // no bloqueamos por fallas de lectura
  const stamps = (data ?? []).map((r) => new Date(r.created_at as string).getTime());
  const now = Date.now();

  for (const limit of RATE_LIMITS) {
    const used = stamps.filter((t) => now - t < limit.windowMs).length;
    if (used >= limit.max) {
      const oldest = Math.min(...stamps.filter((t) => now - t < limit.windowMs));
      const retryAfterSec = Math.max(1, Math.ceil((limit.windowMs - (now - oldest)) / 1000));
      return {
        allowed: false,
        retryAfterSec,
        message: `Alcanzaste tu límite de ${limit.max} consultas ${limit.label} a Yaris. Vuelve a intentarlo en ${formatWait(retryAfterSec)}.`,
      };
    }
  }
  return { allowed: true };
}

function formatWait(sec: number): string {
  if (sec < 60) return `${sec} segundos`;
  if (sec < 3600) return `${Math.ceil(sec / 60)} minutos`;
  return `${Math.ceil(sec / 3600)} horas`;
}

/** Bitácora de uso (alimenta el panel admin y el propio rate limit). */
export async function logAiUsage(row: {
  userId: string;
  materia?: string | null;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  success: boolean;
  errorMessage?: string | null;
}) {
  try {
    await supabaseAdmin.from("ai_usage").insert({
      user_id: row.userId,
      model: YARIS_MODEL,
      materia: row.materia ?? null,
      tokens_in: row.tokensIn,
      tokens_out: row.tokensOut,
      latency_ms: row.latencyMs,
      success: row.success,
      error_message: row.errorMessage ?? null,
    });
  } catch {
    // La bitácora nunca debe tumbar la respuesta al estudiante.
  }
}

/** System prompt configurable desde el panel admin (`ai_config`). */
export async function loadAdminPrompt(): Promise<string | null> {
  try {
    const { data } = await supabaseAdmin
      .from("ai_config")
      .select("value")
      .eq("key", "yaris_system_prompt")
      .maybeSingle();
    const prompt = (data?.value as { prompt?: string } | null)?.prompt?.trim();
    return prompt && prompt.length > 0 ? prompt : null;
  } catch {
    return null;
  }
}

export interface OpenAIResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
  error?: string;
  status?: number;
}

/** Llamada a la API de OpenAI del proyecto (chat completions, reasoning low). */
export async function callOpenAI(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
): Promise<OpenAIResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: YARIS_MODEL,
      messages,
      reasoning_effort: "low",
      max_completion_tokens: MAX_OUTPUT_TOKENS,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { text: "", tokensIn: 0, tokensOut: 0, status: res.status, error: body.slice(0, 400) };
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  return {
    text: json.choices?.[0]?.message?.content?.trim() ?? "",
    tokensIn: json.usage?.prompt_tokens ?? 0,
    tokensOut: json.usage?.completion_tokens ?? 0,
  };
}
