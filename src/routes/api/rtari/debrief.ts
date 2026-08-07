/**
 * Evaluación de una entrevista RTARI.
 *
 * Recibe la transcripción que el navegador fue armando durante la sesión de
 * voz y devuelve la calificación por las seis áreas de la escala OACI más las
 * correcciones concretas. Es texto, no voz: usa el modelo de chat del proyecto.
 *
 * La transcripción es contenido del propio alumno (y del reconocimiento
 * automático): entra al prompt marcada como datos, nunca como instrucciones.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { RTARI_MAX_PREGUNTAS, RTARI_MAX_TURNOS } from "@/modules/rtari/config";
import { sanitizeQuestionIds } from "@/modules/rtari/questions";

const schema = z.object({
  questionIds: z.array(z.string().max(40)).min(1).max(RTARI_MAX_PREGUNTAS),
  turns: z
    .array(
      z.object({
        role: z.enum(["examiner", "candidate"]),
        text: z.string().min(1).max(3000),
      }),
    )
    .min(1)
    .max(RTARI_MAX_TURNOS),
  durationSec: z.number().int().min(0).max(7200),
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/rtari/debrief")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { authenticateRequest, loadRouteProfile } = await import("@/lib/route-auth.server");
        const auth = await authenticateRequest(request);
        if (!auth) return json({ error: "unauthorized" }, 401);

        let parsed: z.infer<typeof schema>;
        try {
          parsed = schema.parse(await request.json());
        } catch {
          return json({ error: "bad_request" }, 400);
        }

        const profile = await loadRouteProfile(auth);
        if (!profile.isPro) return json({ error: "requiere_pro" }, 402);

        const { buildDebriefMessages, parseDebrief, RTARI_DEBRIEF_MAX_TOKENS } =
          await import("@/lib/rtari.server");
        const { callOpenAI, checkUserRateLimit, logAiUsage } =
          await import("@/lib/yaris-openai.server");

        const verdict = await checkUserRateLimit(auth.userId);
        if (!verdict.allowed) return json({ error: "rate_limit", message: verdict.message }, 429);

        const apiKey = process.env["OPENAI_API_KEY"];
        if (!apiKey) return json({ error: "sin_configurar" }, 503);

        // El guion se resuelve contra el banco: da contexto a la evaluación sin
        // dejar que el cliente meta preguntas inventadas.
        const questions = sanitizeQuestionIds(parsed.questionIds, RTARI_MAX_PREGUNTAS);
        const messages = buildDebriefMessages({
          turns: parsed.turns,
          questions,
          duracionSec: parsed.durationSec,
        });

        const started = Date.now();
        const result = await callOpenAI(apiKey, messages, {
          maxOutputTokens: RTARI_DEBRIEF_MAX_TOKENS,
        });

        if (result.error !== undefined) {
          await logAiUsage({
            userId: auth.userId,
            materia: "rtari",
            tokensIn: 0,
            tokensOut: 0,
            latencyMs: Date.now() - started,
            success: false,
            errorMessage: `debrief ${result.status}: ${result.error}`,
          });
          return json({ error: "openai", status: result.status ?? 500 }, 502);
        }

        const debrief = parseDebrief(result.text);
        await logAiUsage({
          userId: auth.userId,
          materia: "rtari",
          tokensIn: result.tokensIn,
          tokensOut: result.tokensOut,
          latencyMs: Date.now() - started,
          success: debrief !== null,
          errorMessage: debrief === null ? "debrief ilegible" : null,
        });

        if (!debrief) return json({ error: "ilegible" }, 502);
        return json({ debrief });
      },
    },
  },
});
