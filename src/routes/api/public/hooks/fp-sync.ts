/**
 * Sincronización programada de FlightPoints (pg_cron).
 *
 * Recorre la actividad real ya guardada de los alumnos y crea las
 * transacciones que falten, para que los rankings de Comunidad estén al día
 * aunque el alumno no haya abierto la sección. Es idempotente.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/fp-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey =
          request.headers.get("apikey") ??
          request.headers.get("authorization")?.replace("Bearer ", "");
        const validas = [
          process.env["SUPABASE_ANON_KEY"],
          process.env["SUPABASE_PUBLISHABLE_KEY"],
          process.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
          import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined,
        ].filter(Boolean) as string[];
        if (!apikey || !validas.includes(apikey)) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { procesarTodosFP } = await import("@/lib/fp/fp.functions");
        // Por defecto sólo alumnos con actividad de los últimos 7 días;
        // con ?todo=1 se recorre a toda la plataforma.
        const todo = new URL(request.url).searchParams.get("todo") === "1";
        const desde = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
        const r = await procesarTodosFP(supabaseAdmin as unknown as { from: (t: string) => any }, {
          ...(todo ? {} : { desde }),
        });
        return new Response(JSON.stringify({ ok: true, ...r }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
