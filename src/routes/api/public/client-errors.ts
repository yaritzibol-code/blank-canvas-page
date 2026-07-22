/**
 * Endpoint público para que el navegador reporte errores al backend.
 * Rate-limit ligero por IP (ventana en memoria) para evitar spam.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return _supabase;
}

const bucket = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, max = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const cur = bucket.get(key);
  if (!cur || cur.resetAt < now) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (cur.count >= max) return false;
  cur.count += 1;
  return true;
}

export const Route = createFileRoute("/api/public/client-errors")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
        const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 24);
        if (!rateLimit(ipHash)) return new Response("rate limited", { status: 429 });
        let body: any = null;
        try {
          body = await request.json();
        } catch {
          return new Response("bad json", { status: 400 });
        }
        const message = typeof body?.message === "string" ? body.message.slice(0, 2000) : null;
        if (!message) return new Response("missing message", { status: 400 });
        const stack = typeof body?.stack === "string" ? body.stack.slice(0, 8000) : null;
        const route = typeof body?.route === "string" ? body.route.slice(0, 500) : null;
        const userId = typeof body?.userId === "string" && /^[0-9a-f-]{36}$/i.test(body.userId) ? body.userId : null;
        const ua = request.headers.get("user-agent")?.slice(0, 500) ?? null;
        try {
          await getSupabase().from("client_errors").insert({
            user_id: userId,
            route,
            message,
            stack,
            user_agent: ua,
            ip_hash: ipHash,
          });
          return Response.json({ ok: true });
        } catch (e) {
          console.error("client-errors insert", e);
          return new Response("insert failed", { status: 500 });
        }
      },
    },
  },
});
