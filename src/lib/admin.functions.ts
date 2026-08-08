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
import { logBillingEvent } from "@/lib/billing-audit.server";

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
  ai: {
    calls: number;
    errors: number;
    tokens_in: number;
    tokens_out: number;
    /** Costo real sumado de `ai_usage.cost_usd` (0 en llamadas que no lo escriben). */
    cost_usd: number;
    /** Tokens de las llamadas SIN costo propio: son las que el panel estima. */
    tokens_in_est: number;
    tokens_out_est: number;
    latency_p50: number;
    latency_p95: number;
  };
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [mrr, pro, stripe, ai, platform, drift] = await Promise.all([
      supabaseAdmin.rpc("admin_mrr", { check_env: data.environment }),
      supabaseAdmin.rpc("admin_pro_stats", { check_env: data.environment }),
      supabaseAdmin.rpc("admin_stripe_event_stats", { hours_back: 24 }),
      supabaseAdmin.rpc("admin_ai_stats", { hours_back: 24 }),
      supabaseAdmin.rpc("admin_platform_stats"),
      supabaseAdmin.rpc("admin_plan_drift", { check_env: data.environment }),
    ]);
    return {
      mrr: Number(mrr.data ?? 0),
      pro: (pro.data as any) ?? { active: 0, trialing: 0, past_due: 0, canceled_last_30d: 0, renewing_next_7d: 0 },
      stripe: (stripe.data as any) ?? { processed: 0, failed: 0, ignored: 0, received: 0 },
      ai: (ai.data as any) ?? { calls: 0, errors: 0, tokens_in: 0, tokens_out: 0, cost_usd: 0, tokens_in_est: 0, tokens_out_est: 0, latency_p50: 0, latency_p95: 0 },
      platform: (platform.data as any) ?? { total_users: 0, admins: 0, reports_open: 0, reminders_last_24h: 0, reminders_failed_24h: 0, rag_chunks: 0 },
      drift: (drift.data as AdminOverview["drift"]) ?? [],
    };
  });

export interface MrrDailyPoint { day: string; mrr: number; active_count: number }
export interface AiDailyPoint {
  day: string;
  calls: number;
  errors: number;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  /** Tokens de las llamadas SIN costo propio: son las que el panel estima. */
  tokens_in_est: number;
  tokens_out_est: number;
  avg_latency_ms: number;
}

export const adminMrrDaily = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv; days?: number }) => data)
  .handler(async ({ data, context }): Promise<Res<MrrDailyPoint[]>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("admin_mrr_daily", {
      check_env: data.environment,
      days_back: Math.min(Math.max(data.days ?? 30, 7), 90),
    });
    if (error) return { error: error.message };
    return (rows ?? []).map((r: any) => ({
      day: String(r.day),
      mrr: Number(r.mrr ?? 0),
      active_count: Number(r.active_count ?? 0),
    }));
  });

export const adminAiDaily = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { days?: number }) => data)
  .handler(async ({ data, context }): Promise<Res<AiDailyPoint[]>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("admin_ai_daily", {
      days_back: Math.min(Math.max(data.days ?? 30, 7), 90),
    });
    if (error) return { error: error.message };
    return (rows ?? []).map((r: any) => ({
      day: String(r.day),
      calls: Number(r.calls ?? 0),
      errors: Number(r.errors ?? 0),
      tokens_in: Number(r.tokens_in ?? 0),
      tokens_out: Number(r.tokens_out ?? 0),
      cost_usd: Number(r.cost_usd ?? 0),
      tokens_in_est: Number(r.tokens_in_est ?? 0),
      tokens_out_est: Number(r.tokens_out_est ?? 0),
      avg_latency_ms: Number(r.avg_latency_ms ?? 0),
    }));
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
      await logBillingEvent({
        event: "plan_changed",
        environment: data.environment,
        source: "admin",
        userId: data.targetUserId,
        detail: { to: "basica", reason: "admin_revoke", subscription: sub.stripe_subscription_id, by: context.userId },
      });
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
    await logBillingEvent({
      event: "plan_changed",
      environment: "live",
      source: "admin",
      userId: data.targetUserId,
      detail: { from: prev.plan ?? null, to: "paga", reason: "admin_grant", days: data.days, by: context.userId },
    });
    return { ok: true };
  });

/** Personalidades configurables de Yaris. */
export type YarisTonoKey = "formal" | "normal" | "amiga";

/** Prompt de Yaris + límites de IA. */
export interface YarisConfig {
  /** Prompt base (carácter, rigor, formato) común a las tres personalidades. */
  prompt: string;
  /** Bloque de voz por personalidad; vacío = se usa el de fábrica. */
  personas: Record<YarisTonoKey, string>;
  notes: string;
  version: number;
  updated_at: string | null;
  updated_by_email: string | null;
}

/** Textos de fábrica que usa Yaris cuando el admin no configuró los suyos. */
export interface YarisDefaults {
  prompt: string;
  personas: Record<YarisTonoKey, string>;
  largos: Record<"corta" | "normal" | "detallada", string>;
  model: string;
}

export const adminGetYarisConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Res<{ config: YarisConfig; defaults: YarisDefaults; history: Array<{ version: number; created_at: string; updated_by_email: string | null }> }>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { YARIS_DEFAULT_PROMPT, YARIS_PERSONAS, YARIS_LARGOS, YARIS_MODEL } = await import("@/lib/yaris-openai.server");
    const { data } = await context.supabase.from("ai_config").select("value,version,updated_at,updated_by").eq("key", "yaris_system_prompt").maybeSingle();
    const val = (data?.value as any) ?? {};
    const p = (val.personas ?? {}) as Record<string, string>;
    const hist = await context.supabase.from("ai_config_history").select("version,created_at,updated_by").eq("key", "yaris_system_prompt").order("version", { ascending: false }).limit(20);
    return {
      config: {
        prompt: val.prompt ?? "",
        personas: {
          formal: p.formal ?? "",
          normal: p.normal ?? "",
          amiga: p.amiga ?? "",
        },
        notes: val.notes ?? "",
        version: data?.version ?? 1,
        updated_at: (data?.updated_at as string) ?? null,
        updated_by_email: null,
      },
      defaults: {
        prompt: YARIS_DEFAULT_PROMPT,
        personas: YARIS_PERSONAS,
        largos: YARIS_LARGOS,
        model: YARIS_MODEL,
      },
      history: (hist.data ?? []).map((h: any) => ({ version: h.version, created_at: h.created_at, updated_by_email: null })),
    };
  });

export const adminUpdateYarisPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { prompt: string; personas?: Partial<Record<YarisTonoKey, string>>; notes?: string }) => data)
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
    const clean = (s?: string) => (s ?? "").trim();
    const value = {
      prompt: data.prompt,
      notes: data.notes ?? "",
      personas: {
        formal: clean(data.personas?.formal),
        normal: clean(data.personas?.normal),
        amiga: clean(data.personas?.amiga),
      },
    };
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

/** Drill-down por día: suscripciones activas ese día, eventos de estudio, errores de sincronización. */
export interface DayDrilldown {
  day: string;
  active_subscriptions: Array<{ user_id: string; email: string | null; status: string; current_period_end: string | null; created_at: string }>;
  study_events: Array<{ user_id: string; email: string | null; collection: string; count: number }>;
  stripe_failures: Array<{ id: string; stripe_event_id: string; type: string; error_message: string | null; received_at: string }>;
  drift_users: Array<{ user_id: string; email: string; profile_plan: string | null; sub_status: string | null; kind: string }>;
  totals: { subs: number; events: number; failures: number; drift: number };
}

export const adminDayDrilldown = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { day: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<Res<DayDrilldown>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const dayStart = new Date(`${data.day}T00:00:00.000Z`).toISOString();
    const dayEnd = new Date(`${data.day}T23:59:59.999Z`).toISOString();

    // Suscripciones activas ese día
    const { data: subs } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id,status,current_period_end,created_at")
      .eq("environment", data.environment)
      .lte("created_at", dayEnd)
      .in("status", ["active", "trialing", "past_due", "canceled"]);
    const activeThatDay = (subs ?? []).filter((s: any) =>
      ["active", "trialing"].includes(s.status) &&
      (!s.current_period_end || new Date(s.current_period_end) >= new Date(dayStart)),
    );
    const subUserIds = Array.from(new Set(activeThatDay.map((s: any) => s.user_id))).filter(Boolean);

    // Eventos de estudio del día (user_state actualizado ese día en colecciones de eventos/progreso)
    const { data: states } = await supabaseAdmin
      .from("user_state")
      .select("user_id,collection,updated_at")
      .in("collection", ["quiz_attempts", "sim_attempts", "activity", "tema_progress", "clase_progress"])
      .gte("updated_at", dayStart)
      .lte("updated_at", dayEnd);
    const eventMap = new Map<string, { user_id: string; collection: string; count: number }>();
    for (const row of states ?? []) {
      const key = `${(row as any).user_id}:${(row as any).collection}`;
      const cur = eventMap.get(key);
      if (cur) cur.count++;
      else eventMap.set(key, { user_id: (row as any).user_id, collection: (row as any).collection, count: 1 });
    }
    const eventUserIds = Array.from(new Set(Array.from(eventMap.values()).map((e) => e.user_id)));

    // Fallos de webhook en ese día
    const { data: failures } = await supabaseAdmin
      .from("stripe_events")
      .select("id,stripe_event_id,type,error_message,received_at,status")
      .eq("environment", data.environment)
      .eq("status", "failed")
      .gte("received_at", dayStart)
      .lte("received_at", dayEnd)
      .order("received_at", { ascending: false });

    // Drift actual (snapshot; el desfase es un estado, no un evento diario)
    const { data: drift } = await supabaseAdmin.rpc("admin_plan_drift", { check_env: data.environment });

    // Emails
    const allIds = Array.from(new Set([...subUserIds, ...eventUserIds]));
    const emailMap = new Map<string, string | null>();
    if (allIds.length > 0) {
      const { data: profs } = await supabaseAdmin.from("profiles").select("id,email").in("id", allIds);
      for (const p of profs ?? []) emailMap.set((p as any).id, (p as any).email ?? null);
    }

    return {
      day: data.day,
      active_subscriptions: activeThatDay.map((s: any) => ({
        user_id: s.user_id,
        email: emailMap.get(s.user_id) ?? null,
        status: s.status,
        current_period_end: s.current_period_end,
        created_at: s.created_at,
      })),
      study_events: Array.from(eventMap.values()).map((e) => ({
        user_id: e.user_id,
        email: emailMap.get(e.user_id) ?? null,
        collection: e.collection,
        count: e.count,
      })),
      stripe_failures: (failures ?? []).map((f: any) => ({
        id: f.id,
        stripe_event_id: f.stripe_event_id,
        type: f.type,
        error_message: f.error_message,
        received_at: f.received_at,
      })),
      drift_users: (drift ?? []) as DayDrilldown["drift_users"],
      totals: {
        subs: activeThatDay.length,
        events: (states ?? []).length,
        failures: (failures ?? []).length,
        drift: (drift ?? []).length,
      },
    };
  });

/** Fila de la bitácora de facturación (`billing_audit`). */
export interface BillingAuditRow {
  id: string;
  user_id: string | null;
  event: string;
  environment: string;
  source: string;
  ok: boolean;
  message: string | null;
  detail: any;
  created_at: string;
}

/**
 * Bitácora de facturación: checkout creado, portal, sincronización de plan y
 * webhooks recibidos. Sirve para explicar cualquier diferencia entre lo que
 * ve el usuario en la UI y lo que Stripe reporta.
 */
export const adminListBillingAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment?: StripeEnv; event?: string; userId?: string; limit?: number }) => data)
  .handler(async ({ data, context }): Promise<Res<BillingAuditRow[]>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    let q = context.supabase
      .from("billing_audit")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.min(data.limit ?? 150, 500));
    if (data.environment) q = q.eq("environment", data.environment);
    if (data.event && data.event !== "all") q = q.eq("event", data.event);
    if (data.userId) q = q.eq("user_id", data.userId);
    const { data: rows, error } = await q;
    if (error) return { error: error.message };
    return (rows ?? []) as BillingAuditRow[];
  });

export interface AdminResumen {
  total_students: number;
  active_students: number;
  new_last7: number;
  quiz_count: number;
  sim_count: number;
  answered: number;
  avg_score: number;
  weakest_materias: Array<{ name: string; avg: number }>;
}

/** Resumen real de la plataforma (calculado en la base de datos, no en el store local). */
export const adminResumen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Res<AdminResumen>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("admin_resumen");
    if (error) return { error: error.message };
    const r = (data as any) ?? {};
    return {
      total_students: Number(r.total_students ?? 0),
      active_students: Number(r.active_students ?? 0),
      new_last7: Number(r.new_last7 ?? 0),
      quiz_count: Number(r.quiz_count ?? 0),
      sim_count: Number(r.sim_count ?? 0),
      answered: Number(r.answered ?? 0),
      avg_score: Number(r.avg_score ?? 0),
      weakest_materias: Array.isArray(r.weakest_materias)
        ? r.weakest_materias.map((m: any) => ({ name: String(m.name), avg: Number(m.avg ?? 0) }))
        : [],
    };
  });

/* ── Salud de la plataforma ─────────────────────────────────────────────── */

export interface HealthCheckRow {
  id: string;
  check_key: string;
  ok: boolean;
  environment: string;
  message: string | null;
  detail: any;
  duration_ms: number;
  created_at: string;
}

/** Bitácora de revisiones automáticas (Stripe live + consultas del panel). */
export const adminHealthChecks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { limit?: number; soloFallos?: boolean }) => data)
  .handler(async ({ data, context }): Promise<Res<HealthCheckRow[]>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    let q = context.supabase
      .from("health_checks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.min(data.limit ?? 40, 200));
    if (data.soloFallos) q = q.eq("ok", false);
    const { data: rows, error } = await q;
    if (error) return { error: error.message };
    return (rows ?? []) as HealthCheckRow[];
  });

/** Corre las revisiones al momento desde el panel (botón "Revisar ahora"). */
export const adminRunHealthChecks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment?: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<Res<{ ok: boolean; total: number; fallos: number }>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { ejecutarHealthChecks } = await import("@/lib/health.server");
    const resultados = await ejecutarHealthChecks(data.environment ?? "live");
    const fallos = resultados.filter((r) => !r.ok).length;
    return { ok: fallos === 0, total: resultados.length, fallos };
  });

/* ── Presencia de respaldo ──────────────────────────────────────────────── */

export interface PresenciaRecienteRow {
  user_id: string;
  email: string | null;
  nombre: string;
  plan: string;
  role: string;
  last_seen: string;
  started_at: string;
  path: string | null;
  label: string | null;
}

/**
 * Respaldo de "Usuarios activos": cuando el canal en vivo no reporta a nadie,
 * se listan las personas con actividad registrada recientemente.
 */
export const adminPresenciaReciente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { minutes?: number }) => data)
  .handler(async ({ data, context }): Promise<Res<PresenciaRecienteRow[]>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("admin_presencia_reciente", {
      minutes_back: Math.min(Math.max(data.minutes ?? 15, 1), 240),
    });
    if (error) return { error: error.message };
    return ((rows ?? []) as any[]).map((r) => ({
      user_id: String(r.user_id),
      email: r.email ?? null,
      nombre: String(r.nombre ?? ""),
      plan: String(r.plan ?? "basica"),
      role: String(r.role ?? "student"),
      last_seen: String(r.last_seen),
      started_at: String(r.started_at),
      path: r.path ?? null,
      label: r.label ?? null,
    }));
  });

/* ── Total ganado ───────────────────────────────────────────────────────── */

export interface TotalGanado {
  /** Cobrado neto (cargos exitosos menos reembolsos), en MXN. */
  total: number;
  currency: string;
  charges: number;
  refunded: number;
  /** `true` si Stripe truncó el histórico (más de 1000 cargos). */
  truncado: boolean;
}

/** Suma histórica realmente cobrada en Stripe para el ambiente elegido. */
export const adminTotalGanado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<Res<TotalGanado>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    try {
      const stripe = createStripeClient(data.environment);
      let bruto = 0;
      let reembolsado = 0;
      let cargos = 0;
      let currency = "mxn";
      let truncado = false;
      let starting_after: string | undefined;
      for (let page = 0; page < 10; page++) {
        const lote = await stripe.charges.list({
          limit: 100,
          ...(starting_after ? { starting_after } : {}),
        });
        for (const c of lote.data) {
          if (c.status !== "succeeded" || !c.paid) continue;
          cargos++;
          bruto += c.amount_captured ?? c.amount ?? 0;
          reembolsado += c.amount_refunded ?? 0;
          if (c.currency) currency = c.currency;
        }
        if (!lote.has_more) break;
        starting_after = lote.data[lote.data.length - 1]?.id;
        if (page === 9 && lote.has_more) truncado = true;
      }
      return {
        total: (bruto - reembolsado) / 100,
        currency: currency.toUpperCase(),
        charges: cargos,
        refunded: reembolsado / 100,
        truncado,
      };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/* ── RTARI: minutos, costo de voz y grabaciones auditables ── */

export interface AdminRtariStats {
  sesiones: number;
  minutos: number;
  con_audio: number;
  costo_real_usd: number;
  llamadas: number;
  minutos_ia: number;
}

/** Consumo del módulo RTARI en el periodo elegido. */
export const adminRtariStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { days?: number }) => data)
  .handler(async ({ data, context }): Promise<Res<AdminRtariStats>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { data: stats, error } = await context.supabase.rpc("admin_rtari_stats", {
      days_back: Math.min(Math.max(data.days ?? 30, 1), 365),
    });
    if (error) return { error: error.message };
    return (stats ?? {
      sesiones: 0,
      minutos: 0,
      con_audio: 0,
      costo_real_usd: 0,
      llamadas: 0,
      minutos_ia: 0,
    }) as AdminRtariStats;
  });

export interface AdminRtariGrabacion {
  id: string;
  created_at: string;
  duration_sec: number;
  nivel: string | null;
  voice: string | null;
  model: string | null;
  nivel_global: number | null;
  cost_usd: number | null;
  preguntas: number;
  /** URL firmada temporal para escuchar la entrevista, si hay audio. */
  audio_url: string | null;
}

/** Entrevistas de un alumno, con enlace temporal para escucharlas. */
export const adminRtariGrabaciones = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data, context }): Promise<Res<AdminRtariGrabacion[]>> => {
    const guard = await assertAdmin(context.supabase, context.userId);
    if (guard) return { error: guard };
    const { data: filas, error } = await context.supabase
      .from("rtari_grabaciones")
      .select(
        "id, created_at, duration_sec, nivel, voice, model, nivel_global, cost_usd, preguntas, storage_path",
      )
      .eq("user_id", data.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return { error: error.message };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const out: AdminRtariGrabacion[] = [];
    for (const f of (filas ?? []) as Array<Record<string, any>>) {
      let audio_url: string | null = null;
      if (f["storage_path"]) {
        const { data: signed } = await supabaseAdmin.storage
          .from("rtari-audio")
          .createSignedUrl(f["storage_path"] as string, 60 * 60);
        audio_url = signed?.signedUrl ?? null;
      }
      out.push({
        id: f["id"] as string,
        created_at: f["created_at"] as string,
        duration_sec: (f["duration_sec"] as number) ?? 0,
        nivel: (f["nivel"] as string) ?? null,
        voice: (f["voice"] as string) ?? null,
        model: (f["model"] as string) ?? null,
        nivel_global: (f["nivel_global"] as number) ?? null,
        cost_usd: (f["cost_usd"] as number) ?? null,
        preguntas: (f["preguntas"] as number) ?? 0,
        audio_url,
      });
    }
    return out;
  });
