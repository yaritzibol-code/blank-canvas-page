import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const spotSchema = z.object({
  label: z.string().max(200),
  pct: z.number(),
  correct: z.number(),
  total: z.number(),
  muestraCorta: z.boolean(),
});

const wrongSchema = z.object({
  questionId: z.string().max(120),
  selectedIndex: z.number(),
  materia: z.string().max(80).optional(),
  fuente: z.string().max(20).optional(),
  capitulo: z.number().optional(),
  capituloTitulo: z.string().max(200).optional(),
});

const schema = z.object({
  titulo: z.string().max(200),
  origen: z.enum(["cuestionario", "simulador"]),
  scorePct: z.number(),
  answered: z.number(),
  spots: z.array(spotSchema).max(6),
  wrong: z.array(wrongSchema).max(40),
});

/**
 * Informe de Pathy: lee los reactivos realmente fallados (desde el banco, en
 * el servidor) y devuelve un diagnóstico narrativo. Usa la misma tubería de
 * OpenAI que Yaris: llave, límites por usuario y bitácora en `ai_usage`.
 */
export const pathyAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { callOpenAI, checkUserRateLimit, fitInputBudget, logAiUsage } = await import(
      "@/lib/yaris-openai.server"
    );
    const { PATHY_SYSTEM, buildPathyUserMessage, parsePathyNarrative } = await import(
      "@/lib/pathy-ai.server"
    );

    const fail = (motivo: string) => ({
      diagnostico: null as string | null,
      confusiones: [] as string[],
      acciones: [] as string[],
      motivo,
    });

    if (data.wrong.length === 0) return fail("sin_errores");

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
    // Plan gratuito: 2 análisis de cortesía antes del popup de mejora.
    if (!isPro) {
      const { consumeServerFreeQuota } = await import("@/lib/free-quota.server");
      const cuota = await consumeServerFreeQuota(
        supabase,
        userId,
        "pathy",
        (profileRow?.data ?? {}) as Record<string, unknown>,
      );
      if (!cuota.allowed) return fail("sin_pro");
    }


    const verdict = await checkUserRateLimit(userId);
    if (!verdict.allowed) return fail("limite");

    const apiKey = process.env['OPENAI_API_KEY'];
    if (!apiKey) return fail("error");

    // Los enunciados se leen en el servidor: el cliente sólo manda ids.
    const ids = data.wrong.map((w) => w.questionId);
    const { data: rows } = await supabase.rpc("get_bank_questions", {
      p_materias: undefined,
      p_fuentes: undefined,
      p_caps: undefined,
      p_ids: ids,
      p_scope: "all",
      p_limit: ids.length,
      p_offset: 0,
      p_ordered: false,
    });

    type Q = { id: string; text?: string; options?: string[]; correctIndex?: number };
    const byId = new Map<string, Q>();
    ((rows ?? []) as Q[]).forEach((q) => {
      if (q && q.id) byId.set(String(q.id), q);
    });

    const errores = data.wrong.flatMap((w) => {
      const q = byId.get(w.questionId);
      if (!q?.text) return [];
      const opts = q.options ?? [];
      const eligio = w.selectedIndex >= 0 ? (opts[w.selectedIndex] ?? "—") : "(en blanco)";
      const correcta = opts[q.correctIndex ?? -1] ?? "—";
      return [
        {
          materia: w.materia,
          fuente: w.fuente,
          capitulo: w.capitulo,
          capituloTitulo: w.capituloTitulo,
          pregunta: q.text.slice(0, 320),
          eligio: String(eligio).slice(0, 160),
          correcta: String(correcta).slice(0, 160),
        },
      ];
    });

    if (errores.length === 0) return fail("error");

    const userMsg = buildPathyUserMessage({
      titulo: data.titulo,
      origen: data.origen,
      scorePct: data.scorePct,
      answered: data.answered,
      wrong: errores.length,
      spots: data.spots,
      errores,
    });

    const messages = fitInputBudget(PATHY_SYSTEM, [{ role: "user", content: userMsg }]);
    const started = Date.now();

    try {
      const result = await callOpenAI(apiKey, messages);
      if (result.error !== undefined) {
        await logAiUsage({
          userId,
          materia: null,
          tokensIn: 0,
          tokensOut: 0,
          latencyMs: Date.now() - started,
          success: false,
          errorMessage: `pathy HTTP ${result.status}: ${result.error}`,
        });
        return fail("error");
      }
      const parsed = parsePathyNarrative(result.text);
      await logAiUsage({
        userId,
        materia: null,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        latencyMs: Date.now() - started,
        success: Boolean(parsed),
        errorMessage: parsed ? undefined : "pathy: respuesta no parseable",
      });
      if (!parsed) return fail("error");
      return { ...parsed, motivo: undefined as string | undefined };
    } catch (err) {
      console.error("Pathy analysis failed", err);
      await logAiUsage({
        userId,
        materia: null,
        tokensIn: 0,
        tokensOut: 0,
        latencyMs: Date.now() - started,
        success: false,
        errorMessage: String(err).slice(0, 300),
      });
      return fail("error");
    }
  });
