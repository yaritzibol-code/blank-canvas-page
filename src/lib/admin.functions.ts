/**
 * Server functions administrativas del Panel de Operaciones.
 *
 * Todas validan `is_admin()` server-side antes de tocar `supabaseAdmin`,
 * y devuelven `{ error }` en fallo en vez de lanzar excepciones para que
 * TanStack no convierta el error en un 500 opaco.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type Res<T> = T | { error: string };

async function assertAdmin(supabase: any, userId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return `No se pudo validar rol admin: ${error.message}`;
  if (!data) return "Requiere rol admin.";
  return null;
}

export interface AdminOverview {
  mrr: number;
  pro: {
    active: number;
    trialing: number;
    past_due: number;
    canceled_last_30d: number;
    renewing_next_7d: number;
  };
  stripe: { processed: number; failed: number; ignored: number; received: number };
  ai: { calls: number; errors: number; tokens_in: number; tokens_out: number; latency_p50: number; latency_p95: number };
  platform: {
    total_users: number;
    admins: number;
    reports_open: number;
    reminders_last_24h: number;
    reminders_failed_24h: number;
    rag_chunks: number;
  };
  drift: Array<{
    user_id: string;
    email: string;
    profile_plan: string | null;
    sub_status: string | null;
    current_period_end: string | null;
    kind: string;
  }>;
}

export const adminOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<Res<AdminOverview>> => {
    const { supabase, userId } = context;
    const guard = await assertAdmin(supabase, userId);
    if (guard) return { error: guard };
    const [mrr, pro, stripe, ai, platform, drift] = await Promise.all([
      supabase.rpc("admin_mrr", { check_env: data.environment }),
      supabase.rpc("admin_pro_stats", { check_env: data.environment }),
      supabase.rpc("admin_stripe_event_stats", { hours_back: 24 }),
      supabase.rpc("admin_ai_stats", { hours_back: 24 }),
      supabase.rpc("admin_platform_stats"),
      supabase.rpc("admin_plan_drift", { check_env: data.environment }),
    ]);
    return {
      mrr: Number(mrr.data ?? 0),
      pro: (pro.data as any) ?? { active: 0, trialing: 0, past_due: 0, canceled_last_30d: 0, renewing_next_7d: 0 },
      stripe: (stripe.data as any) ?? { processed: 0, failed: 0, ignored: 0, received: 0 },
      ai: (ai.data as any) ?? { calls: 0, errors: 0, tokens_in: 0, tokens_out: 0, latency_p50: 0, latency_p95: 0 },
      platform: (platform.data as any) ?? { total_users: 0, admins: 0, reports_open: 0, reminders_last_24h: 0, reminders_failed_24h: 0, rag_chunks: 0 },
      drift: (drift.data as AdminOverview["drift"]) ?? [],
    };
  });

export interface StripeEventRow {
  id: string;
  stripe_event_id: string;
  type: string;
  environment: string;
  status: string;
  error_message: string | null;
  user_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  payload: any;
  received_at: string;
  processed_at: string | null;
}

export const adminListStripeEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment?: StripeEnv; status?: string; limit?: number }) => data)
  .handler(async ({ data, context }): Promise<Res<StripeEventRow[]>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    let q = context.supabase.from("stripe_events").select("*").order("received_at", { ascending: false }).limit(Math.min(data.limit ?? 100, 500));
    if (data.environment) q = q.eq("environment", data.environment);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) return { error: error.message };
    return (rows ?? []) as StripeEventRow[];
  });

export const adminReprocessStripeEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { stripeEventId: string }) => data)
  .handler(async ({ data, context }): Promise<Res<{ ok: true; outcome: string }>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { data: row, error } = await context.supabase
      .from("stripe_events")
      .select("*")
      .eq("stripe_event_id", data.stripeEventId)
      .maybeSingle();
    if (error || !row) return { error: "Evento no encontrado." };
    const { processStripeEvent } = await import("@/routes/api/public/payments/webhook");
    try {
      const outcome = await processStripeEvent(
        { type: row.type as string, data: { object: row.payload } },
        row.environment as StripeEnv,
      );
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("stripe_events")
        .update({ status: outcome, error_message: null, processed_at: new Date().toISOString() })
        .eq("stripe_event_id", data.stripeEventId);
      return { ok: true, outcome };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Reprocesado falló." };
    }
  });

/** Cancela la suscripción activa del usuario en Stripe (no proratea). */
export const adminRevokeSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { targetUserId: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<Res<{ ok: true }>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", data.targetUserId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.stripe_subscription_id) return { error: "El usuario no tiene suscripción activa." };
    try {
      const stripe = createStripeClient(data.environment);
      await stripe.subscriptions.cancel(sub.stripe_subscription_id as string, { prorate: false });
      return { ok: true };
    } catch (e) {
      return { error: getStripeErrorMessage(e) };
    }
  });

/** Concede Pro manual (beca / acceso extendido) sin pasar por Stripe. */
export const adminGrantPro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { targetUserId: string; days: number }) => data)
  .handler(async ({ data, context }): Promise<Res<{ ok: true }>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: prof } = await supabaseAdmin.from("profiles").select("data").eq("id", data.targetUserId).maybeSingle();
    const prev = ((prof?.data as Record<string, unknown>) ?? {}) as Record<string, unknown>;
    const now = new Date();
    const end = new Date(now.getTime() + Math.max(1, data.days) * 24 * 60 * 60 * 1000).toISOString();
    const next = {
      ...prev,
      plan: "paga",
      planNombre: "FlightPath Pro (extendido)",
      accessStatus: "extendido",
      accessStart: (prev.accessStart as string) ?? now.toISOString(),
      accessEnd: end,
    };
    const { error } = await supabaseAdmin.from("profiles").update({ data: next as never }).eq("id", data.targetUserId);
    if (error) return { error: error.message };
    return { ok: true };
  });

/** Prompt de Yaris + límites de IA. */
export interface YarisConfig {
  prompt: string;
  notes: string;
  version: number;
  updated_at: string | null;
  updated_by_email: string | null;
}

export const adminGetYarisConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Res<{ config: YarisConfig; history: Array<{ version: number; created_at: string; updated_by_email: string | null }> }>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { data } = await context.supabase.from("ai_config").select("value,version,updated_at,updated_by").eq("key", "yaris_system_prompt").maybeSingle();
    const val = (data?.value as any) ?? {};
    const hist = await context.supabase.from("ai_config_history").select("version,created_at,updated_by").eq("key", "yaris_system_prompt").order("version", { ascending: false }).limit(20);
    return {
      config: {
        prompt: val.prompt ?? "",
        notes: val.notes ?? "",
        version: data?.version ?? 1,
        updated_at: (data?.updated_at as string) ?? null,
        updated_by_email: null,
      },
      history: (hist.data ?? []).map((h: any) => ({ version: h.version, created_at: h.created_at, updated_by_email: null })),
    };
  });

export const adminUpdateYarisPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { prompt: string; notes?: string }) => data)
  .handler(async ({ data, context }): Promise<Res<{ ok: true; version: number }>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: current } = await supabaseAdmin.from("ai_config").select("version,value").eq("key", "yaris_system_prompt").maybeSingle();
    const nextVersion = (current?.version ?? 0) + 1;
    if (current) {
      await supabaseAdmin.from("ai_config_history").insert({
        key: "yaris_system_prompt",
        value: current.value as never,
        version: current.version as number,
        updated_by: context.userId,
      });
    }
    const value = { prompt: data.prompt, notes: data.notes ?? "" };
    const { error } = await supabaseAdmin
      .from("ai_config")
      .upsert(
        {
          key: "yaris_system_prompt",
          value: value as never,
          version: nextVersion,
          updated_by: context.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    if (error) return { error: error.message };
    return { ok: true, version: nextVersion };
  });

export const adminSetAILimit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { dailyTokenLimit: number; dailyCallLimit: number }) => data)
  .handler(async ({ data, context }): Promise<Res<{ ok: true }>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("ai_limits")
      .update({
        daily_token_limit: Math.max(0, Math.floor(data.dailyTokenLimit)),
        daily_call_limit: Math.max(0, Math.floor(data.dailyCallLimit)),
        updated_by: context.userId,
        updated_at: new Date().toISOString(),
      })
      .eq("scope", "global");
    if (error) return { error: error.message };
    return { ok: true };
  });

export const adminGetAILimits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Res<{ daily_token_limit: number; daily_call_limit: number }>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { data } = await context.supabase.from("ai_limits").select("daily_token_limit,daily_call_limit").eq("scope", "global").maybeSingle();
    return { daily_token_limit: (data?.daily_token_limit as number) ?? 500000, daily_call_limit: (data?.daily_call_limit as number) ?? 1000 };
  });

export const adminListClientErrors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { limit?: number }) => data)
  .handler(async ({ data, context }): Promise<Res<Array<{ id: string; route: string | null; message: string; stack: string | null; user_id: string | null; created_at: string }>>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { data: rows, error } = await context.supabase
      .from("client_errors")
      .select("id,route,message,stack,user_id,created_at")
      .order("created_at", { ascending: false })
      .limit(Math.min(data.limit ?? 30, 200));
    if (error) return { error: error.message };
    return (rows ?? []) as any;
  });
