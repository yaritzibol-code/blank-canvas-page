/**
 * Arranque de una entrevista RTARI por voz.
 *
 * El navegador nunca ve `OPENAI_API_KEY`: pide aquí una credencial efímera de
 * la API Realtime con las instrucciones del sinodal ya incrustadas, y con ella
 * abre la sesión WebRTC directo contra OpenAI.
 *
 * Del cliente sólo se aceptan tres cosas —qué preguntas, qué voz y qué nivel
 * de exigencia— y las preguntas se resuelven contra el banco del módulo. El
 * guion del sinodal jamás sale de texto libre del navegador.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  RTARI_MAX_PREGUNTAS,
  RTARI_MIN_PREGUNTAS,
  RTARI_NIVELES,
  RTARI_SESIONES_POR_DIA,
  RTARI_VOICES,
} from "@/modules/rtari/config";
import { sanitizeQuestionIds } from "@/modules/rtari/questions";

const schema = z.object({
  questionIds: z.array(z.string().max(40)).min(RTARI_MIN_PREGUNTAS).max(RTARI_MAX_PREGUNTAS),
  voice: z.enum(RTARI_VOICES),
  nivel: z.enum(RTARI_NIVELES),
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/rtari/session")({
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

        const questions = sanitizeQuestionIds(parsed.questionIds, RTARI_MAX_PREGUNTAS);
        if (questions.length < RTARI_MIN_PREGUNTAS) {
          return json({ error: "bad_request", detail: "guion inválido" }, 400);
        }

        const profile = await loadRouteProfile(auth);
        // La voz a voz se cobra por minuto de audio: es función de Pro.
        if (!profile.isPro) return json({ error: "requiere_pro" }, 402);

        const {
          buildExaminerInstructions,
          countRtariSessions,
          createRealtimeSecret,
          RTARI_REALTIME_MODEL,
        } = await import("@/lib/rtari.server");
        const { logAiUsage } = await import("@/lib/yaris-openai.server");

        const usadas = await countRtariSessions(auth.userId);
        if (usadas >= RTARI_SESIONES_POR_DIA) {
          return json(
            {
              error: "limite_diario",
              usadas,
              limite: RTARI_SESIONES_POR_DIA,
            },
            429,
          );
        }

        const apiKey = process.env["OPENAI_API_KEY"];
        if (!apiKey) return json({ error: "sin_configurar" }, 503);

        const started = Date.now();
        const secret = await createRealtimeSecret(apiKey, {
          instructions: buildExaminerInstructions({
            nombre: profile.nombre,
            questions,
            nivel: parsed.nivel,
          }),
          voice: parsed.voice,
        });

        if ("status" in secret) {
          await logAiUsage({
            userId: auth.userId,
            materia: "rtari",
            model: RTARI_REALTIME_MODEL,
            tokensIn: 0,
            tokensOut: 0,
            latencyMs: Date.now() - started,
            success: false,
            errorMessage: `realtime ${secret.status}: ${secret.message}`,
          });
          return json({ error: "openai", status: secret.status }, 502);
        }

        // La bitácora se escribe al ACUÑAR la credencial, no al colgar: es lo
        // que cuenta el tope diario, y una sesión abierta ya consume audio.
        await logAiUsage({
          userId: auth.userId,
          materia: "rtari",
          model: RTARI_REALTIME_MODEL,
          tokensIn: 0,
          tokensOut: 0,
          latencyMs: Date.now() - started,
          success: true,
        });

        return json({
          value: secret.value,
          expiresAt: secret.expiresAt,
          model: RTARI_REALTIME_MODEL,
          restantes: Math.max(0, RTARI_SESIONES_POR_DIA - usadas - 1),
        });
      },
    },
  },
});
