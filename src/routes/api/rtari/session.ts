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
 *
 * Los minutos se cobran POR ADELANTADO (ver `rtari-saldo.server.ts`): el audio
 * no pasa por aquí, así que la única forma de no depender de la buena fe del
 * cliente es apartar el máximo y devolver lo que sobre al colgar.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  RTARI_MAX_PREGUNTAS,
  RTARI_MIN_PREGUNTAS,
  RTARI_MINUTOS_MINIMOS,
  RTARI_MODELO_POR_NIVEL,
  RTARI_NIVELES,
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

        const apiKey = process.env["OPENAI_API_KEY"];
        if (!apiKey) return json({ error: "sin_configurar" }, 503);

        const { buildExaminerInstructions, createRealtimeSecret } =
          await import("@/lib/rtari.server");
        const { liquidarMinutos, reservarMinutos } = await import("@/lib/rtari-saldo.server");
        const { logAiUsage } = await import("@/lib/yaris-openai.server");

        // Un id propio: identifica la reserva y vuelve en la liquidación.
        const sessionId = crypto.randomUUID();
        const reserva = await reservarMinutos(
          auth.userId,
          profile.isPro,
          sessionId,
          profile.isAdmin,
        );
        if (reserva.segundos <= 0) {
          return json({ error: "sin_minutos", minimoMinutos: RTARI_MINUTOS_MINIMOS }, 429);
        }

        const model = RTARI_MODELO_POR_NIVEL[parsed.nivel];
        const started = Date.now();
        const secret = await createRealtimeSecret(apiKey, {
          model,
          instructions: buildExaminerInstructions({
            nombre: profile.nombre,
            questions,
            nivel: parsed.nivel,
          }),
          voice: parsed.voice,
        });

        if ("status" in secret) {
          // La entrevista no llegó a abrirse: se devuelven íntegros los
          // minutos apartados hace un instante.
          await liquidarMinutos(auth.userId, reserva, 0, sessionId);
          await logAiUsage({
            userId: auth.userId,
            materia: "rtari",
            model,
            tokensIn: 0,
            tokensOut: 0,
            latencyMs: Date.now() - started,
            success: false,
            errorMessage: `realtime ${secret.status}: ${secret.message}`,
          });
          return json({ error: "openai", status: secret.status }, 502);
        }

        return json({
          value: secret.value,
          expiresAt: secret.expiresAt,
          model,
          sessionId,
          maxMinutos: Math.floor(reserva.segundos / 60),
        });
      },
    },
  },
});
