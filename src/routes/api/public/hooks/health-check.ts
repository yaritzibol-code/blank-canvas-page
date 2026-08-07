/**
 * Revisión de salud programada (pg_cron): valida Stripe live y las consultas
 * críticas del panel admin, y bitacoriza los fallos en `health_checks`.
 */
import { createFileRoute } from "@tanstack/react-router";
import { ejecutarHealthChecks } from "@/lib/health.server";

export const Route = createFileRoute("/api/public/hooks/health-check")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey =
          request.headers.get("apikey") ??
          request.headers.get("authorization")?.replace("Bearer ", "");
        const esperada = process.env["SUPABASE_ANON_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!apikey || !esperada || apikey !== esperada) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const resultados = await ejecutarHealthChecks("live");
        const fallos = resultados.filter((r) => !r.ok);
        return new Response(
          JSON.stringify({ ok: fallos.length === 0, total: resultados.length, fallos }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
