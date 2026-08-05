import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const contextSchema = z
  .object({
    materia: z.string().optional(),
    questionText: z.string().optional(),
    options: z.array(z.string()).optional(),
    correctIndex: z.number().optional(),
    userSelectedIndex: z.number().optional(),
    explanation: z.string().optional(),
    cite: z.string().optional(),
    /** Libro o tema abierto cuando la duda nace de la biblioteca. */
    resourceTitle: z.string().max(300).optional(),
  })
  .optional();

const schema = z.object({
  history: z.array(messageSchema).max(20),
  context: contextSchema,
});

const LETTERS = ["A", "B", "C", "D", "E"];

/**
 * Yaris tutora IA — corre sobre la API propia de OpenAI del proyecto
 * (`OPENAI_API_KEY`), con rate limiting por usuario y bitácora en `ai_usage`.
 * Requiere autenticación y plan Pro / admin.
 */
export const yarisAiChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const {
      callOpenAI,
      checkUserRateLimit,
      estimateTokens,
      fitInputBudget,
      loadAdminPrompt,
      logAiUsage,
    } = await import("@/lib/yaris-openai.server");

    // Autorización: sólo Pro / admin pueden usar Yaris IA.
    const [{ data: isAdmin }, { data: profileRow }, { data: hasSub }] = await Promise.all([
      supabase.rpc("is_admin"),
      supabase.from("profiles").select("role,data").eq("id", userId).maybeSingle(),
      supabase.rpc("has_active_subscription", { user_uuid: userId, check_env: "live" }),
    ]);

    const plan = (profileRow?.data as { plan?: string } | null)?.plan ?? "basica";
    const accessStatus = (profileRow?.data as { accessStatus?: string } | null)?.accessStatus ?? "activo";
    const isPro =
      Boolean(isAdmin) ||
      Boolean(hasSub) ||
      (plan === "paga" && ["activo", "extendido", "prueba"].includes(accessStatus));

    const ctx = data.context ?? {};

    if (!isPro) {
      return {
        text:
          "Yaris IA está disponible sólo para FlightPath Pro. Actualiza tu plan para chatear conmigo sin límites.",
        cite: null as string | null,
      };
    }

    // Rate limiting por usuario: 10/min · 100/hora · 300/día.
    const verdict = await checkUserRateLimit(userId);
    if (!verdict.allowed) {
      return { text: verdict.message!, cite: ctx.cite ?? null };
    }

    const apiKey = process.env['OPENAI_API_KEY'];
    if (!apiKey) {
      return {
        text:
          "Todavía no está configurada la llave de OpenAI en este entorno. Avísale al equipo de FlightPath para activar Yaris IA.",
        cite: null as string | null,
      };
    }

    const adminPrompt = await loadAdminPrompt();
    let system =
      adminPrompt ??
      [
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
    }

    const messages = fitInputBudget(system, data.history);
    const started = Date.now();

    try {
      const result = await callOpenAI(apiKey, messages);

      if (result.error !== undefined) {
        await logAiUsage({
          userId,
          materia: ctx.materia ?? null,
          tokensIn: estimateTokens(messages.map((m) => m.content).join(" ")),
          tokensOut: 0,
          latencyMs: Date.now() - started,
          success: false,
          errorMessage: `HTTP ${result.status}: ${result.error}`,
        });
        if (result.status === 429) {
          return {
            text: "¡Uy! La cuenta de OpenAI está recibiendo demasiadas consultas ahora mismo. Dame un momento y vuelve a preguntarme, por favor.",
            cite: ctx.cite ?? null,
          };
        }
        if (result.status === 401 || result.status === 403) {
          return {
            text: "La llave de OpenAI configurada no es válida o no tiene permisos. Avísale al equipo de FlightPath.",
            cite: ctx.cite ?? null,
          };
        }
        if (result.status === 402 || (result.error ?? "").includes("insufficient_quota")) {
          return {
            text: "Se agotó el crédito de la cuenta de OpenAI. Avísale a tu instructor o al equipo de FlightPath para reactivar Yaris.",
            cite: ctx.cite ?? null,
          };
        }
        console.error("Yaris OpenAI error", result.status, result.error);
        return {
          text: "No pude conectarme con la IA justo ahora. Puedes releer la explicación oficial y volver a intentarlo en un momento.",
          cite: ctx.cite ?? null,
        };
      }

      const text = result.text || "No pude generar una respuesta esta vez. Intenta reformular tu pregunta.";
      await logAiUsage({
        userId,
        materia: ctx.materia ?? null,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        latencyMs: Date.now() - started,
        success: true,
      });
      return { text, cite: ctx.cite ?? null };
    } catch (err) {
      console.error("Yaris OpenAI fetch failed", err);
      await logAiUsage({
        userId,
        materia: ctx.materia ?? null,
        tokensIn: 0,
        tokensOut: 0,
        latencyMs: Date.now() - started,
        success: false,
        errorMessage: String(err).slice(0, 300),
      });
      return {
        text: "Tuve un problema al conectarme con la IA. Revisa la explicación oficial de la pregunta y vuelve a intentarlo.",
        cite: ctx.cite ?? null,
      };
    }
  });
