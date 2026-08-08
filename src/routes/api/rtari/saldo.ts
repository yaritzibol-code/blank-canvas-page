/**
 * Saldo de minutos de entrevista del usuario.
 *
 * Además de leer, otorga los minutos incluidos cuando el ciclo cambió: es el
 * primer lugar que toca la pantalla del módulo, así que un alumno que entra el
 * día 1 del mes ya ve su cuota nueva sin tener que iniciar una entrevista.
 */
import { createFileRoute } from "@tanstack/react-router";
import { RTARI_MINUTOS_INCLUIDOS_PRO } from "@/modules/rtari/config";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/rtari/saldo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { authenticateRequest, loadRouteProfile } = await import("@/lib/route-auth.server");
        const auth = await authenticateRequest(request);
        if (!auth) return json({ error: "unauthorized" }, 401);

        const profile = await loadRouteProfile(auth);
        const { asegurarSaldo } = await import("@/lib/rtari-saldo.server");
        const saldo = await asegurarSaldo(auth.userId, profile.isPro, profile.isAdmin);

        return json({
          saldo,
          esPro: profile.isPro,
          minutosIncluidosPro: RTARI_MINUTOS_INCLUIDOS_PRO,
        });
      },
    },
  },
});
