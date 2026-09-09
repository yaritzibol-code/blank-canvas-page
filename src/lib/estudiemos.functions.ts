import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const candidateSchema = z.object({
  id: z.string().max(120),
  titulo: z.string().max(160),
  detalle: z.string().max(240),
  minutes: z.number(),
});

const schema = z.object({
  track: z.enum(["ciaac", "la"]),
  tema: z.string().max(200),
  mood: z.enum(["cero", "normal", "ganas", "atope"]),
  urgency: z.enum(["verde", "amarillo", "naranja", "rojo"]),
  minutes: z.number(),
  nombre: z.string().max(80).optional(),
  /** Plan determinista propuesto (ids en orden). */
  propuesta: z.array(z.string().max(120)).max(12),
  candidatos: z.array(candidateSchema).max(24),
});

/**
 * Capa opcional de Pathy: verifica la suscripción en el servidor y usa la
 * misma tubería de OpenAI que Yaris para **ordenar** recursos existentes y
 * redactar el mensaje de bienvenida. Nunca inventa contenido: sólo puede
 * elegir ids del catálogo que se le entrega. Si algo falla, el cliente se
 * queda con el plan determinista.
 */
export const planStudySession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const fail = (motivo: string) => ({
      allowed: motivo !== "sin_pro",
      order: null as string[] | null,
      intro: null as string | null,
      motivo,
    });

    const [{ data: isAdmin }, { data: profileRow }, { data: hasSub }] = await Promise.all([
      supabase.rpc("is_admin"),
      supabase.from("profiles").select("role,data").eq("id", userId).maybeSingle(),
      supabase.rpc("has_active_subscription", { user_uuid: userId, check_env: "live" }),
    ]);
    const pdata = (profileRow?.data ?? {}) as { plan?: string; accessStatus?: string };
    const isPro =
      Boolean(isAdmin) ||
      Boolean(hasSub) ||
      (pdata.plan === "paga" &&
        ["activo", "extendido", "prueba"].includes(pdata.accessStatus ?? "activo"));
    if (!isPro) return fail("sin_pro");

    const apiKey = process.env['OPENAI_API_KEY'];
    if (!apiKey) return fail("sin_ia");

    const { callOpenAI, checkUserRateLimit, fitInputBudget, logAiUsage } = await import(
      "@/lib/yaris-openai.server"
    );
    const verdict = await checkUserRateLimit(userId);
    if (!verdict.allowed) return fail("limite");

    const system = [
      "Eres Pathy, la copiloto de estudio de FlightPath. Organizas una sesión de estudio para una",
      "aspirante mexicana a piloto. NO inventas contenido, preguntas ni ejercicios: sólo eliges y",
      "ordenas recursos de la lista que te doy, usando sus ids exactos.",
      "Devuelves SOLO un JSON válido con esta forma:",
      '{"order":["id1","id2"],"intro":"una o dos frases cálidas en español mexicano"}',
      "Reglas: usa entre 2 y 6 ids, todos de la lista; respeta el tiempo total disponible;",
      "si viene con cero ganas empieza por algo corto; si es urgente prioriza práctica;",
      "en la intro no prometas nada que no esté en la lista y no menciones porcentajes inventados.",
    ].join("\n");

    const user = [
      `Track: ${data.track === "ciaac" ? "CIAAC" : "Línea Aérea"}`,
      `Tema pedido: ${data.tema || "(nada en específico)"}`,
      `Ánimo: ${data.mood} · Urgencia: ${data.urgency} · Minutos: ${data.minutes}`,
      data.nombre ? `Nombre: ${data.nombre}` : "",
      "",
      "Plan propuesto por el sistema (ids en orden):",
      data.propuesta.join(", "),
      "",
      "Recursos disponibles:",
      ...data.candidatos.map((c) => `- ${c.id} | ${c.titulo} | ${c.detalle} | ~${c.minutes} min`),
    ]
      .filter(Boolean)
      .join("\n");

    const messages = fitInputBudget(system, [{ role: "user", content: user }]);
    const started = Date.now();

    try {
      const result = await callOpenAI(apiKey, messages, { maxOutputTokens: 600 });
      if (result.error !== undefined) {
        await logAiUsage({
          userId, materia: null, tokensIn: 0, tokensOut: 0,
          latencyMs: Date.now() - started, success: false,
          errorMessage: `estudiemos HTTP ${result.status}: ${result.error}`,
        });
        return fail("error");
      }
      const cleaned = result.text.replace(/```(?:json)?/gi, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      let order: string[] | null = null;
      let intro: string | null = null;
      if (start !== -1 && end > start) {
        try {
          const obj = JSON.parse(cleaned.slice(start, end + 1)) as {
            order?: unknown;
            intro?: unknown;
          };
          const valid = new Set(data.candidatos.map((c) => c.id));
          if (Array.isArray(obj.order)) {
            const ids = obj.order.filter(
              (x): x is string => typeof x === "string" && valid.has(x),
            );
            if (ids.length >= 2) order = [...new Set(ids)].slice(0, 8);
          }
          if (typeof obj.intro === "string" && obj.intro.trim()) intro = obj.intro.trim().slice(0, 400);
        } catch {
          /* respuesta no parseable: se usa el plan determinista */
        }
      }

      await logAiUsage({
        userId, materia: null, tokensIn: result.tokensIn, tokensOut: result.tokensOut,
        latencyMs: Date.now() - started, success: Boolean(order ?? intro),
        errorMessage: order ?? intro ? undefined : "estudiemos: respuesta no parseable",
      });

      return { allowed: true, order, intro, motivo: undefined as string | undefined };
    } catch (err) {
      console.error("planStudySession failed", err);
      await logAiUsage({
        userId, materia: null, tokensIn: 0, tokensOut: 0,
        latencyMs: Date.now() - started, success: false,
        errorMessage: String(err).slice(0, 300),
      });
      return fail("error");
    }
  });
