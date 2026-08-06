/**
 * Yaris IA sobre la API propia de OpenAI del proyecto (`OPENAI_API_KEY`).
 *
 * Incluye el rate limiting por usuario pedido por el equipo:
 *   10 solicitudes / minuto · 100 / hora · 300 / día
 *   ≤ 12,000 tokens de entrada por solicitud · ≤ 1,200 tokens de salida
 *   reasoning effort: low
 *
 * El conteo se hace contra la tabla `ai_usage`, que ya bitacoriza cada llamada.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const YARIS_MODEL = "gpt-5.6-luna";
export const MAX_INPUT_TOKENS = 12000;
export const MAX_OUTPUT_TOKENS = 1200;

export const RATE_LIMITS = [
  { windowMs: 60_000, max: 10, label: "por minuto" },
  { windowMs: 3_600_000, max: 100, label: "por hora" },
  { windowMs: 86_400_000, max: 300, label: "por día" },
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

/** Prompt base + prompts por personalidad, configurables desde el panel admin. */
export interface YarisAdminPrompt {
  prompt: string | null;
  personas: Partial<Record<"formal" | "normal" | "amiga", string>>;
}

/** System prompt configurable desde el panel admin (`ai_config`). */
export async function loadAdminPrompt(): Promise<YarisAdminPrompt> {
  try {
    const { data } = await supabaseAdmin
      .from("ai_config")
      .select("value")
      .eq("key", "yaris_system_prompt")
      .maybeSingle();
    const val = (data?.value ?? null) as { prompt?: string; personas?: Record<string, string> } | null;
    const prompt = val?.prompt?.trim();
    const personas: YarisAdminPrompt["personas"] = {};
    (["formal", "normal", "amiga"] as const).forEach((k) => {
      const p = val?.personas?.[k]?.trim();
      if (p) personas[k] = p;
    });
    return { prompt: prompt && prompt.length > 0 ? prompt : null, personas };
  } catch {
    return { prompt: null, personas: {} };
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

/* ───────────────────────── Prompt de Yaris ───────────────────────── */

const LETTERS = ["A", "B", "C", "D", "E"];

export type YarisTono = "formal" | "normal" | "amiga";

/** Cuánto se extiende Yaris al responder (Configuración → Apariencia). */
export type YarisLargo = "corta" | "normal" | "detallada";

export interface YarisPromptContext {
  /** Personalidad elegida por la estudiante (onboarding / configuración). */
  tono?: YarisTono;
  /** Longitud de respuesta elegida en Configuración. */
  largo?: YarisLargo;
  materia?: string;

  questionText?: string;
  options?: string[];
  correctIndex?: number;
  userSelectedIndex?: number;
  /** El estudiante aún no elige respuesta: modo socrático. */
  preAnswer?: boolean;
  explanation?: string;
  cite?: string;
  resourceTitle?: string;
}

/** Base del carácter de Yaris cuando la administradora no configuró uno propio. */
export const YARIS_DEFAULT_PROMPT = [
  "Eres Yaris, instructora de vuelo y maestra de aeronáutica de FlightPath para pilotos que preparan el examen CIAAC de México (Piloto Comercial de la DGAC/AFAC) y procesos de línea aérea.",
  "Responde SIEMPRE en español mexicano, tono cercano de tú. Da formato con Markdown estándar: **negritas** para lo clave, *cursivas*, listas con - o 1., y `código` cuando aplique. No escribas HTML.",
  "Sé concisa: entre 3 y 8 oraciones por respuesta salvo que el usuario pida detalle.",
  "Eres una maestra, no una porrista: NO eres complaciente. Si el estudiante se equivoca, dilo de frente desde la primera línea y explica por qué, con el dato, el principio físico o la norma que lo sustenta.",
  "Si el estudiante insiste, te contradice o presiona, NO cambies tu respuesta para complacerlo: sostén tu postura y defiéndela con datos concretos (definiciones, fórmulas, artículos, procedimientos). Solo cambia de posición si te presenta evidencia técnica válida, y entonces reconócelo explícitamente.",
  "Nunca abras con halagos vacíos ('¡excelente pregunta!') ni cierres pidiendo aprobación. Corrige con respeto y firmeza: primero el veredicto, luego el porqué, y al final un tip para recordarlo.",
  "Explica conceptos usando tu conocimiento general de aeronáutica: aerodinámica, motores, meteorología, navegación aérea, legislación (DGAC/AFAC/OACI/RACM), factores humanos, medicina de aviación, comunicaciones, servicios de tránsito aéreo y operaciones.",
  "Si la duda no es de aviación, responde brevemente y redirígela al estudio.",
  "No inventes citas ni normativas específicas: cuando no tengas la certeza del número o artículo exacto, dilo con claridad y explica igual el fundamento técnico. Decir 'no estoy segura del artículo' es correcto; inventarlo, jamás.",
].join(" ");

/**
 * Personalidad de Yaris elegida por la estudiante. Cambia la voz, nunca el
 * rigor técnico: el contenido y la firmeza al corregir se mantienen igual.
 */
export const YARIS_PERSONAS: Record<YarisTono, string> = {
  formal: [
    "VOZ (modo formal): habla de usted, con registro profesional de instructora de aviación.",
    "Frases completas, sin coloquialismos, sin emojis, sin diminutivos. Estructura clara: veredicto, fundamento técnico y recomendación de estudio.",
  ].join(" "),
  normal: [
    "VOZ (modo normal): español mexicano cercano de tú, claro y directo, con calidez profesional.",
    "Sin exceso de emojis (máximo uno cuando aporte) y sin lenguaje rebuscado.",
  ].join(" "),
  amiga: [
    "VOZ (modo Amiga Yaris): eres la amiga que además es instructora. Hablas de tú, en español mexicano natural y relajado, como en un chat: frases cortas, muletillas suaves ('mira', 'ok', 'va'), humor ligero y cero acartonamiento.",
    "Eres cálida y motivadora, nunca romántica ni coqueta: la relación es de amistad y estudio. No uses apodos afectivos de pareja ni insinuaciones.",
    "Puedes usar 1 o 2 emojis cuando de verdad aporten. Celebra los avances con honestidad y reconoce cuando algo está difícil ('sí, ese tema es de los que más pegan').",
    "La confianza no baja el rigor: si la respuesta está mal, se lo dices claro y con cariño, y luego explicas el porqué técnico igual de bien que en modo formal.",
    "Nada de sermones largos: primero lo importante, luego el detalle, y cierra con un empujón concreto ('repasa X y me cuentas').",
    "MEMOTECNIA OBLIGATORIA: en este modo casi siempre cierras (o abres) con un truco para recordarlo: acrónimos, rimas, imágenes mentales o reglas cortas. Si ya existe uno estándar en aviación, úsalo; si no, invéntale uno pegajoso y explícalo.",
    "REFERENCIAS POP: explica con analogías de Disney/Pixar y anime (por ejemplo el globo de Up para flotabilidad y ascenso, Mulan para disciplina y checklists, Howl para viento y estabilidad, Dragon Ball para escalas y potencia, Naruto para memorizar secuencias). Que la analogía aclare el concepto técnico, no que lo sustituya: primero el dato correcto, luego la referencia.",
    "Usa 1 o 2 referencias por respuesta como máximo y siempre en tu propio lenguaje relajado; nunca inventes datos técnicos con tal de que la analogía cuadre.",
  ].join(" "),
};

/** Longitud de respuesta: cambia la extensión, nunca el rigor ni el veredicto. */
export const YARIS_LARGOS: Record<YarisLargo, string> = {
  corta: [
    "LONGITUD (modo corta): responde en 2 a 3 oraciones o 3 viñetas máximo.",
    "Ve directo al veredicto y al dato clave; omite ejemplos y rodeos. Si hace falta más, ofrece ampliar.",
  ].join(" "),
  normal: "LONGITUD (modo normal): entre 3 y 8 oraciones. Veredicto, fundamento y un tip para recordarlo.",
  detallada: [
    "LONGITUD (modo detallada): explica a fondo, con estructura en secciones o listas y hasta ~350 palabras.",
    "Incluye el principio de fondo, un ejemplo o cálculo cuando aplique, errores comunes y cómo repasarlo. Sin relleno: cada línea aporta.",
  ].join(" "),
};


/**
 * Arma el system prompt con el contexto de la pantalla.
 *
 * Vive aquí para que la respuesta normal y la respuesta en streaming usen
 * exactamente el mismo carácter y el mismo contexto: si divergieran, Yaris
 * contestaría distinto según cómo se le pregunte.
 */
export function buildYarisSystemPrompt(adminPrompt: string | null, ctx: YarisPromptContext): string {
  let system = adminPrompt ?? YARIS_DEFAULT_PROMPT;

  const persona = YARIS_PERSONAS[ctx.tono ?? "normal"];
  if (persona) system += `\n\n${persona}`;

  const largo = YARIS_LARGOS[ctx.largo ?? "normal"];
  if (largo) system += `\n\n${largo}`;





  if (ctx.resourceTitle) {
    system += `\n\nEl estudiante está leyendo "${ctx.resourceTitle}" en la biblioteca del curso. Si la duda se refiere a ese material, respóndela con tu conocimiento de aeronáutica y aclara que no puedes citar páginas concretas del PDF.`;
  }

  if (ctx.questionText) {
    const correcta =
      ctx.options && ctx.correctIndex !== undefined && ctx.options[ctx.correctIndex] !== undefined
        ? `${LETTERS[ctx.correctIndex]}. ${ctx.options[ctx.correctIndex]}`
        : "?";
    const elegida =
      ctx.options && ctx.userSelectedIndex !== undefined && ctx.userSelectedIndex >= 0
        ? `${LETTERS[ctx.userSelectedIndex]}. ${ctx.options[ctx.userSelectedIndex]}`
        : "Sin responder";
    const opts = (ctx.options ?? []).map((o, i) => `${LETTERS[i]}. ${o}`).join(" | ");
    system +=
      "\n\nCONTEXTO DE LA PREGUNTA EN REVISIÓN (úsalo como base y complementa con tu conocimiento):" +
      `\n- Materia: ${ctx.materia ?? "N/D"}` +
      `\n- Pregunta: ${ctx.questionText}` +
      `\n- Opciones: ${opts}` +
      `\n- Respuesta correcta: ${correcta}` +
      `\n- Respuesta del estudiante: ${elegida}` +
      `\n- Explicación oficial del curso: ${ctx.explanation ?? "—"}` +
      (ctx.cite ? `\n- Fuente oficial: ${ctx.cite}` : "");

    if (ctx.preAnswer) {
      system +=
        "\n\nMODO SOCRÁTICO (el estudiante AÚN NO responde esta pregunta):" +
        "\n- PROHIBIDO revelar, insinuar o descartar hasta dejar una sola opción: no digas cuál es la correcta ni cuál letra elegir, aunque te lo pida." +
        "\n- Tu trabajo es que piense: explica el concepto de fondo, define los términos clave de la pregunta y recuérdale la regla, tabla o criterio que aplica." +
        "\n- Hazle 1 o 2 preguntas guía y sugiérele cómo comparar las opciones entre sí." +
        "\n- Cierra invitándolo a elegir su respuesta: cuando la marque, entonces sí le confirmas y explicas a fondo.";
    }
  }
  return system;
}

/**
 * Llamada en streaming: entrega los fragmentos según los produce el modelo.
 * `onDelta` recibe cada trozo de texto; devuelve el texto completo al final.
 */
export async function streamOpenAI(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<OpenAIResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: YARIS_MODEL,
      messages,
      reasoning_effort: "low",
      max_completion_tokens: MAX_OUTPUT_TOKENS,
      stream: true,
      stream_options: { include_usage: true },
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    return { text: "", tokensIn: 0, tokensOut: 0, status: res.status, error: body.slice(0, 400) };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let tokensIn = 0;
  let tokensOut = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE: eventos separados por línea en blanco, campo `data:`.
    let nl = buffer.indexOf("\n");
    while (nl !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      nl = buffer.indexOf("\n");
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };
        const piece = evt.choices?.[0]?.delta?.content;
        if (piece) {
          text += piece;
          onDelta(piece);
        }
        if (evt.usage) {
          tokensIn = evt.usage.prompt_tokens ?? tokensIn;
          tokensOut = evt.usage.completion_tokens ?? tokensOut;
        }
      } catch {
        /* fragmento incompleto: el siguiente ciclo lo completa */
      }
    }
  }

  return { text: text.trim(), tokensIn, tokensOut };
}
