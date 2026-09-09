/**
 * "Explícale a Yaris" — Yaris evalúa la explicación de la alumna.
 *
 * Misma tubería que el resto de Yaris (OpenAI propio, rate limit por usuario,
 * bitácora en `ai_usage` y `yaris_messages`) y las mismas reglas de acceso de
 * FlightPath. Yaris no responde dudas aquí: pregunta, analiza, repregunta y
 * cierra con feedback, apoyada en el contenido real de la plataforma.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  tema: z.string().min(2).max(200),
  turno: z.number().int().min(0).max(12),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .max(20),
  referencias: z
    .array(
      z.object({
        titulo: z.string().max(200),
        texto: z.string().max(3000),
        cite: z.string().max(200).optional(),
      }),
    )
    .max(5)
    .default([]),
});

export interface PruebaResumen {
  veredicto: "entendido" | "parcial" | "reforzar";
  entendiste: string;
  reforzar: string;
  recomienda: string;
  dominio: number;
}

export const explicaleAYaris = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const fail = (motivo: string, reply: string) => ({
      allowed: motivo !== "sin_pro",
      reply,
      cerrar: false,
      resumen: null as PruebaResumen | null,
      motivo,
    });

    const [{ data: isAdmin }, { data: profileRow }, { data: hasSub }] = await Promise.all([
      supabase.rpc("is_admin"),
      supabase.from("profiles").select("role,data").eq("id", userId).maybeSingle(),
      supabase.rpc("has_active_subscription", { user_uuid: userId, check_env: "live" }),
    ]);
    const pdata = (profileRow?.data ?? {}) as {
      plan?: string;
      accessStatus?: string;
      yarisTono?: "formal" | "normal" | "amiga";
    };
    const isPro =
      Boolean(isAdmin) ||
      Boolean(hasSub) ||
      (pdata.plan === "paga" &&
        ["activo", "extendido", "prueba"].includes(pdata.accessStatus ?? "activo"));
    if (!isPro) return fail("sin_pro", "Este ejercicio es parte de FlightPath Pro.");

    const apiKey = process.env['OPENAI_API_KEY'];
    if (!apiKey) return fail("sin_ia", "Todavía no está configurada la IA en este entorno.");

    const { callOpenAI, checkUserRateLimit, fitInputBudget, logAiUsage, YARIS_PERSONAS } =
      await import("@/lib/yaris-openai.server");

    const verdict = await checkUserRateLimit(userId);
    if (!verdict.allowed) return fail("limite", verdict.message!);

    const tono = pdata.yarisTono ?? "normal";
    const persona = YARIS_PERSONAS[tono] ?? "";

    const system = [
      "Eres Yaris, instructora de aviación de FlightPath. Estás aplicando el ejercicio",
      '"Explícale a Yaris": la alumna te explica un tema y tú compruebas si de verdad lo entendió.',
      persona,
      "",
      "REGLAS:",
      "- Tú diriges. Nunca resuelvas dudas por gusto ni des una clase completa.",
      "- Mensajes breves (máx. 3 frases), tono cercano, profesional y natural. Casi sin emojis.",
      "- Turno 0: plantea el reto con una sola instrucción clara sobre el tema. No adelantes contenido.",
      "- Después de cada respuesta: reconoce lo correcto en una frase y haz UNA repregunta que profundice.",
      "- Si falta algo: da una pista breve y pide que lo intente otra vez; no reveles la respuesta.",
      "- Si hay error conceptual: señálalo sin corregirlo del todo y pide un nuevo intento.",
      "- Si al segundo intento sigue mal: explica el concepto correcto en pocas frases y pide que lo reformule con sus palabras.",
      "- Cierra entre el 2.º y el 4.º intercambio; antes si ya demostró comprensión.",
      "- Evalúa contra el MATERIAL DE REFERENCIA cuando exista. No inventes datos académicos.",
      "",
      "Devuelve SOLO un JSON válido con esta forma:",
      '{"reply":"lo que le dices a la alumna","cerrar":false,"resumen":null}',
      "Cuando cierres el ejercicio: cerrar=true y resumen con",
      '{"veredicto":"entendido|parcial|reforzar","entendiste":"1 frase","reforzar":"1 frase","recomienda":"1 frase","dominio":0-100}.',
    ]
      .filter(Boolean)
      .join("\n");

    const refs = data.referencias.length
      ? [
          "MATERIAL DE REFERENCIA DE FLIGHTPATH:",
          ...data.referencias.map(
            (r) => `- ${r.titulo}${r.cite ? ` (${r.cite})` : ""}: ${r.texto}`,
          ),
        ].join("\n")
      : "MATERIAL DE REFERENCIA: no hay material específico cargado; apóyate en conocimiento aeronáutico estándar y sé prudente.";

    const head = [
      `TEMA A EVALUAR: ${data.tema}`,
      `INTERCAMBIO NÚMERO: ${data.turno}`,
      refs,
      data.turno === 0 ? "Plantea el reto inicial." : "Analiza la última respuesta de la alumna.",
    ].join("\n\n");

    const messages = fitInputBudget(system, [
      { role: "user" as const, content: head },
      ...data.history,
    ]);
    const started = Date.now();

    try {
      const result = await callOpenAI(apiKey, messages, { maxOutputTokens: 700 });
      if (result.error !== undefined) {
        await logAiUsage({
          userId, materia: null, tokensIn: 0, tokensOut: 0,
          latencyMs: Date.now() - started, success: false,
          errorMessage: `prueba HTTP ${result.status}: ${result.error}`,
        });
        return fail("error", "No pude conectarme con la IA justo ahora. Inténtalo en un momento.");
      }

      const cleaned = result.text.replace(/```(?:json)?/gi, "").trim();
      const a = cleaned.indexOf("{");
      const b = cleaned.lastIndexOf("}");
      let reply = cleaned;
      let cerrar = false;
      let resumen: PruebaResumen | null = null;
      if (a !== -1 && b > a) {
        try {
          const obj = JSON.parse(cleaned.slice(a, b + 1)) as {
            reply?: unknown;
            cerrar?: unknown;
            resumen?: Partial<PruebaResumen> | null;
          };
          if (typeof obj.reply === "string" && obj.reply.trim()) reply = obj.reply.trim();
          cerrar = Boolean(obj.cerrar);
          const r = obj.resumen;
          if (cerrar && r && typeof r === "object") {
            resumen = {
              veredicto:
                r.veredicto === "entendido" || r.veredicto === "reforzar" ? r.veredicto : "parcial",
              entendiste: String(r.entendiste ?? "").slice(0, 400),
              reforzar: String(r.reforzar ?? "").slice(0, 400),
              recomienda: String(r.recomienda ?? "").slice(0, 400),
              dominio: Math.max(0, Math.min(100, Number(r.dominio) || 0)),
            };
          }
        } catch {
          /* respuesta no-JSON: se usa el texto tal cual */
        }
      }

      await logAiUsage({
        userId, materia: null, tokensIn: result.tokensIn, tokensOut: result.tokensOut,
        latencyMs: Date.now() - started, success: true,
      });

      const { logYarisMessage } = await import("@/lib/yaris-log.server");
      await logYarisMessage({
        userId,
        pregunta: [...data.history].reverse().find((m) => m.role === "user")?.content ?? data.tema,
        respuesta: reply,
        seccion: `Ponme a Prueba — Explícale a Yaris (${data.tema})`,
        materia: null,
        tono,
        fuente: "chat",
        questionText: data.tema,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        latencyMs: Date.now() - started,
        success: true,
      });

      return { allowed: true, reply, cerrar, resumen, motivo: undefined as string | undefined };
    } catch (err) {
      console.error("explicaleAYaris failed", err);
      await logAiUsage({
        userId, materia: null, tokensIn: 0, tokensOut: 0,
        latencyMs: Date.now() - started, success: false,
        errorMessage: String(err).slice(0, 300),
      });
      return fail("error", "Tuve un problema al conectarme. Vuelve a intentarlo, por favor.");
    }
  });
