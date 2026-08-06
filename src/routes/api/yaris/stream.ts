/**
 * Yaris en streaming.
 *
 * La respuesta llega por SSE conforme el modelo la genera, en vez de esperar
 * al texto completo: la estudiante ve escribirse las palabras y el tiempo
 * hasta la primera línea deja de depender del largo de la respuesta.
 *
 * Reglas idénticas a `yarisAiChat` (misma autorización, mismo límite de uso y
 * el mismo system prompt vía `buildYarisSystemPrompt`); si algo falla, el
 * cliente cae de vuelta a la ruta normal.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const schema = z.object({
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) }))
    .max(20),
  context: z
    .object({
      materia: z.string().optional(),
      questionText: z.string().optional(),
      options: z.array(z.string()).optional(),
      correctIndex: z.number().optional(),
      userSelectedIndex: z.number().optional(),
      /** true = pide ayuda antes de responder (modo socrático). */
      preAnswer: z.boolean().optional(),
      explanation: z.string().optional(),
      cite: z.string().optional(),
      resourceTitle: z.string().max(300).optional(),
    })
    .optional(),
});

/** Verifica el Bearer del navegador y devuelve el cliente con RLS del usuario. */
async function authenticate(
  request: Request,
): Promise<{ supabase: SupabaseClient; userId: string } | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  if (token.split(".").length !== 3) return null;

  const supabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return { supabase, userId: String(data.claims.sub) };
}

/** Un evento SSE con su carga JSON. */
function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export const Route = createFileRoute("/api/yaris/stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticate(request);
        if (!auth) return new Response("unauthorized", { status: 401 });
        const { supabase, userId } = auth;

        let parsed: z.infer<typeof schema>;
        try {
          parsed = schema.parse(await request.json());
        } catch {
          return new Response("bad request", { status: 400 });
        }
        const ctx = parsed.context ?? {};

        const {
          buildYarisSystemPrompt,
          checkUserRateLimit,
          estimateTokens,
          fitInputBudget,
          loadAdminPrompt,
          logAiUsage,
          streamOpenAI,
        } = await import("@/lib/yaris-openai.server");

        // Autorización: sólo Pro / admin, igual que la ruta no-streaming.
        const [{ data: isAdmin }, { data: profileRow }, { data: hasSub }] = await Promise.all([
          supabase.rpc("is_admin"),
          supabase.from("profiles").select("role,data").eq("id", userId).maybeSingle(),
          supabase.rpc("has_active_subscription", { user_uuid: userId, check_env: "live" }),
        ]);
        const profile = (profileRow?.data ?? {}) as {
          plan?: string;
          accessStatus?: string;
          yarisTono?: "formal" | "normal" | "amiga";
          yarisLargo?: "corta" | "normal" | "detallada";
        };

        const isPro =
          Boolean(isAdmin) ||
          Boolean(hasSub) ||
          (profile.plan === "paga" &&
            ["activo", "extendido", "prueba"].includes(profile.accessStatus ?? "activo"));
        // Plan gratuito: 10 respuestas de cortesía. Al agotarse, 402 y el
        // cliente muestra el popup de mejora.
        if (!isPro) {
          const { consumeServerFreeQuota } = await import("@/lib/free-quota.server");
          const cuota = await consumeServerFreeQuota(
            supabase,
            userId,
            "yaris",
            (profileRow?.data ?? {}) as Record<string, unknown>,
          );
          if (!cuota.allowed) return new Response("free quota reached", { status: 402 });
        }


        const verdict = await checkUserRateLimit(userId);
        if (!verdict.allowed) return new Response(verdict.message ?? "rate limited", { status: 429 });

        const apiKey = process.env["OPENAI_API_KEY"];
        if (!apiKey) return new Response("missing key", { status: 503 });

        const system = buildYarisSystemPrompt(await loadAdminPrompt(), {
          ...ctx,
          tono: profile.yarisTono ?? "normal",
          largo: profile.yarisLargo ?? "normal",
        });

        const messages = fitInputBudget(system, parsed.history);
        const started = Date.now();

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const enc = new TextEncoder();
            const push = (chunk: string) => controller.enqueue(enc.encode(chunk));
            try {
              const result = await streamOpenAI(apiKey, messages, (delta) =>
                push(sse("delta", { t: delta })),
              );
              if (result.error !== undefined) {
                push(sse("error", { status: result.status ?? 500 }));
                await logAiUsage({
                  userId,
                  materia: ctx.materia ?? null,
                  tokensIn: estimateTokens(messages.map((m) => m.content).join(" ")),
                  tokensOut: 0,
                  latencyMs: Date.now() - started,
                  success: false,
                  errorMessage: `HTTP ${result.status}: ${result.error}`,
                });
              } else {
                push(sse("done", { cite: ctx.cite ?? null }));
                await logAiUsage({
                  userId,
                  materia: ctx.materia ?? null,
                  tokensIn: result.tokensIn,
                  tokensOut: result.tokensOut,
                  latencyMs: Date.now() - started,
                  success: true,
                });
              }
            } catch (err) {
              push(sse("error", { status: 500 }));
              await logAiUsage({
                userId,
                materia: ctx.materia ?? null,
                tokensIn: 0,
                tokensOut: 0,
                latencyMs: Date.now() - started,
                success: false,
                errorMessage: String(err).slice(0, 300),
              }).catch(() => {});
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
