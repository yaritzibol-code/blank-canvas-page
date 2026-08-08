/**
 * Cierre de cuentas de una entrevista.
 *
 * Al colgar, el navegador reporta cuánto duró la sesión y cuánto consumo le
 * reportó la API por su canal de datos. Con eso pasan dos cosas:
 *
 *  1. **Se devuelven los minutos no usados.** La reserva se hizo por el máximo
 *     que podía durar la entrevista; aquí se libera la diferencia. Reportar de
 *     menos sólo puede devolverle al alumno minutos que él mismo ya pagó, y
 *     nunca más de los reservados: por eso el cobro no depende de este dato.
 *  2. **Se bitacoriza el costo real** en `ai_usage`, con las tarifas de audio
 *     del modelo que atendió la sesión.
 *
 * Es idempotente: una sesión ya liquidada no devuelve minutos otra vez.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { RTARI_MAX_MINUTOS } from "@/modules/rtari/config";

const usageSchema = z
  .object({
    audioIn: z.number().min(0).max(50_000_000),
    audioCached: z.number().min(0).max(50_000_000),
    audioOut: z.number().min(0).max(50_000_000),
    textIn: z.number().min(0).max(50_000_000),
    textCached: z.number().min(0).max(50_000_000),
    textOut: z.number().min(0).max(50_000_000),
  })
  .partial()
  .transform((u) => ({
    audioIn: u.audioIn ?? 0,
    audioCached: u.audioCached ?? 0,
    audioOut: u.audioOut ?? 0,
    textIn: u.textIn ?? 0,
    textCached: u.textCached ?? 0,
    textOut: u.textOut ?? 0,
  }));

const schema = z.object({
  sessionId: z.string().uuid(),
  model: z.string().min(1).max(60),
  durationSec: z
    .number()
    .int()
    .min(0)
    .max(RTARI_MAX_MINUTOS * 60 + 120),
  usage: usageSchema,
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/rtari/settle")({
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

        const { asegurarSaldo, leerSaldo, liquidarMinutos, reservaPendiente } =
          await import("@/lib/rtari-saldo.server");
        const { logAiUsage } = await import("@/lib/yaris-openai.server");
        const { realtimeCost, realtimeTotals } = await import("@/lib/ai-cost");

        // La bitácora del costo va SIEMPRE y va primero, aunque no haya nada
        // que devolver: las sesiones de la administración no gastan minutos
        // pero sí cuestan dinero, y el panel tiene que verlas.
        const { tokensIn, tokensOut } = realtimeTotals(parsed.usage);
        const costo = realtimeCost(parsed.model, parsed.usage);
        if (tokensIn > 0 || tokensOut > 0) {
          await logAiUsage({
            userId: auth.userId,
            materia: "rtari",
            model: parsed.model,
            tokensIn,
            tokensOut,
            costUsd: costo.usd,
            latencyMs: parsed.durationSec * 1000,
            success: true,
          });
        }

        const profile = await loadRouteProfile(auth);
        const saldoDe = async () =>
          profile.isAdmin ? asegurarSaldo(auth.userId, true, true) : leerSaldo(auth.userId);

        const reserva = await reservaPendiente(auth.userId, parsed.sessionId);
        if (!reserva) {
          // Sesión sin cargo, desconocida o ya liquidada: no hay minutos que
          // devolver. No es un error, sólo no queda nada por hacer.
          return json({
            ok: true,
            yaLiquidada: true,
            costoUsd: Number(costo.usd.toFixed(4)),
            saldo: await saldoDe(),
          });
        }

        const devueltos = await liquidarMinutos(
          auth.userId,
          reserva,
          parsed.durationSec,
          parsed.sessionId,
        );

        return json({
          ok: true,
          devueltos,
          costoUsd: Number(costo.usd.toFixed(4)),
          saldo: await saldoDe(),
        });
      },
    },
  },
});
