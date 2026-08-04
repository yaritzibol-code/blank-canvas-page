/**
 * Server functions del Evidence Engine.
 *
 * - `recordEvidence`: el cliente reporta hitos (login, cuestionario terminado,
 *   términos aceptados…) y el servidor los sella con IP/UA reales del request
 *   antes de escribirlos en el ledger append-only.
 * - `adminListDisputes` / `adminEvidenceDossier`: el panel admin lista las
 *   disputas de Stripe y genera el expediente completo de un estudiante
 *   (timeline, uso, términos, cobros con señal de riesgo y score de
 *   ganabilidad) listo para exportar como JSON o imprimir como PDF.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { StripeEnv } from "@/lib/stripe.server";
import {
  CLIENT_EVIDENCE_EVENTS,
  type ClientEvidenceEvent,
  insertEvidenceEvent,
  requestContext,
} from "@/lib/evidence.server";

type Res<T> = T | { error: string };

async function assertAdmin(supabase: any): Promise<string | null> {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return `No se pudo validar rol admin: ${error.message}`;
  if (!data) return "Requiere rol admin.";
  return null;
}

/* ─────────────────────────── Captura de eventos ─────────────────────────── */

export const recordEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      event: ClientEvidenceEvent;
      metadata?: Record<string, unknown>;
      locale?: string;
      timezone?: string;
      environment?: StripeEnv;
    }) => {
      if (!CLIENT_EVIDENCE_EVENTS.includes(data.event)) throw new Error("Evento no permitido");
      return data;
    },
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const ctx = requestContext(getRequest());
    await insertEvidenceEvent({
      event: data.event,
      userId: context.userId,
      environment: data.environment ?? "live",
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      referer: ctx.referer,
      locale: data.locale ?? null,
      timezone: data.timezone ?? null,
      metadata: data.metadata ?? {},
    });
    return { ok: true };
  });

/* ─────────────────────────────── Disputas ────────────────────────────────── */

export interface DisputeRow {
  id: string;
  stripe_dispute_id: string;
  charge_id: string | null;
  user_id: string | null;
  email: string | null;
  environment: string;
  reason: string | null;
  status: string | null;
  amount: number | null;
  currency: string | null;
  evidence_due_by: string | null;
  created_at: string;
}

export const adminListDisputes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Res<{ disputes: DisputeRow[] }>> => {
    const guard = await assertAdmin(context.supabase);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return { error: error.message };
    const rows = (data ?? []) as any[];
    const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
    const emails = new Map<string, string>();
    if (userIds.length) {
      const { data: profs } = await supabaseAdmin.from("profiles").select("id,email").in("id", userIds);
      (profs ?? []).forEach((p: any) => emails.set(p.id, p.email));
    }
    return {
      disputes: rows.map((r) => ({
        id: r.id,
        stripe_dispute_id: r.stripe_dispute_id,
        charge_id: r.charge_id,
        user_id: r.user_id,
        email: r.user_id ? (emails.get(r.user_id) ?? null) : null,
        environment: r.environment,
        reason: r.reason,
        status: r.status,
        amount: r.amount === null ? null : Number(r.amount),
        currency: r.currency,
        evidence_due_by: r.evidence_due_by,
        created_at: r.created_at,
      })),
    };
  });

/* ─────────────────────────────── Expediente ──────────────────────────────── */

export interface TimelineItem {
  at: string;
  source: "evidencia" | "facturación" | "stripe" | "soporte";
  event: string;
  detail: string;
  ip?: string | null;
}

export interface DossierScoreReason {
  ok: boolean;
  label: string;
}

export interface EvidenceDossier {
  generatedAt: string;
  environment: StripeEnv;
  user: {
    id: string;
    email: string;
    nombre: string | null;
    plan: string | null;
    accessStart: string | null;
    accessEnd: string | null;
  };
  terms: { accepted: boolean; version: string | null; at: string | null; ip: string | null };
  logins: { total: number; first: string | null; last: string | null; distinctIps: number; topIp: string | null };
  usage: {
    quizzes: number;
    questionsAnswered: number;
    avgScorePct: number | null;
    sims: number;
    studyMinutes: number;
    activeDays: number;
    flashSessions: number;
    clasesVistas: number;
  };
  subscriptions: Array<{
    stripe_subscription_id: string;
    status: string;
    price_id: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    created_at: string;
  }>;
  charges: Array<{
    id: string;
    created: string;
    amount: number;
    currency: string;
    status: string;
    riskLevel: string | null;
    riskScore: number | null;
    threeDSecure: string | null;
    cvcCheck: string | null;
    disputed: boolean;
  }>;
  support: Array<{ at: string; detail: string }>;
  timeline: TimelineItem[];
  score: { pct: number; reasons: DossierScoreReason[] };
}

function fmtDetail(obj: Record<string, unknown>): string {
  const parts = Object.entries(obj)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .slice(0, 5)
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`);
  return parts.join(" · ");
}

export const adminEvidenceDossier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userIdOrEmail: string; environment: StripeEnv }) => {
    if (!data.userIdOrEmail?.trim()) throw new Error("Falta usuario");
    return data;
  })
  .handler(async ({ data, context }): Promise<Res<EvidenceDossier>> => {
    const guard = await assertAdmin(context.supabase);
    if (guard) return { error: guard };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const needle = data.userIdOrEmail.trim().toLowerCase();
    const byId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(needle);
    const { data: prof, error: profErr } = byId
      ? await supabaseAdmin.from("profiles").select("*").eq("id", needle).maybeSingle()
      : await supabaseAdmin.from("profiles").select("*").eq("email", needle).maybeSingle();
    if (profErr) return { error: profErr.message };
    if (!prof) return { error: "No existe un estudiante con ese correo o ID." };

    const userId = prof.id as string;
    const pdata = ((prof as any).data ?? {}) as Record<string, any>;

    const [evid, billing, stripeEvents, subs, reports, states] = await Promise.all([
      supabaseAdmin.from("evidence_events").select("*").eq("user_id", userId).order("created_at", { ascending: true }).limit(1000),
      supabaseAdmin.from("billing_audit").select("*").eq("user_id", userId).order("created_at", { ascending: true }).limit(300),
      supabaseAdmin.from("stripe_events").select("*").eq("user_id", userId).order("received_at", { ascending: true }).limit(200),
      supabaseAdmin.from("subscriptions").select("*").eq("user_id", userId).eq("environment", data.environment).order("created_at", { ascending: true }),
      supabaseAdmin.from("reports").select("*").eq("user_id", userId).order("updated_at", { ascending: true }).limit(100),
      supabaseAdmin.from("user_state").select("collection,data").eq("user_id", userId),
    ]);

    const evidRows = (evid.data ?? []) as any[];
    const billingRows = (billing.data ?? []) as any[];
    const stripeRows = (stripeEvents.data ?? []) as any[];
    const subRows = (subs.data ?? []) as any[];
    const reportRows = (reports.data ?? []) as any[];
    const stateBy = new Map<string, any[]>();
    ((states.data ?? []) as any[]).forEach((r) => stateBy.set(r.collection, Array.isArray(r.data) ? r.data : []));

    // ── Términos
    const termsEv = evidRows.filter((e) => e.event === "terms_accepted").at(-1) ?? null;

    // ── Logins
    const loginEvs = evidRows.filter((e) => e.event === "login" || e.event === "account_created");
    const ipCounts = new Map<string, number>();
    loginEvs.forEach((e) => { if (e.ip) ipCounts.set(e.ip, (ipCounts.get(e.ip) ?? 0) + 1); });
    const topIp = [...ipCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // ── Uso (desde el estado sincronizado del estudiante)
    const quizzes = stateBy.get("quiz_attempts") ?? [];
    const sims = stateBy.get("sim_attempts") ?? [];
    const activity = stateBy.get("activity") ?? [];
    const flash = stateBy.get("flash_sessions") ?? [];
    const clases = (stateBy.get("clase_progress") ?? []).filter((c: any) => (c?.pct ?? 0) >= 50 || c?.done);
    const questionsAnswered = quizzes.reduce((s: number, q: any) => s + (q?.total ?? 0), 0)
      + sims.reduce((s: number, x: any) => s + (x?.total ?? 0), 0);
    const scored = quizzes.filter((q: any) => q?.total > 0);
    const avgScorePct = scored.length
      ? Math.round(scored.reduce((s: number, q: any) => s + (q.correct / q.total) * 100, 0) / scored.length)
      : null;
    const studyMinutes = activity.reduce((s: number, a: any) => s + (a?.durationMin ?? 0), 0);
    const dayKey = (iso: string) => (iso ?? "").slice(0, 10);
    const activeDays = new Set(activity.map((a: any) => dayKey(a?.at ?? a?.date)).filter(Boolean)).size;

    // ── Cobros con señal de riesgo (best-effort contra Stripe)
    const charges: EvidenceDossier["charges"] = [];
    try {
      const customerId = subRows.find((s) => s.stripe_customer_id)?.stripe_customer_id as string | undefined;
      if (customerId) {
        const { createStripeClient } = await import("@/lib/stripe.server");
        const stripe = createStripeClient(data.environment);
        const list = await stripe.charges.list({ customer: customerId, limit: 10 });
        for (const ch of list.data) {
          charges.push({
            id: ch.id,
            created: new Date(ch.created * 1000).toISOString(),
            amount: ch.amount / 100,
            currency: ch.currency.toUpperCase(),
            status: ch.status,
            riskLevel: (ch.outcome?.risk_level as string | undefined) ?? null,
            riskScore: (ch.outcome as any)?.risk_score ?? null,
            threeDSecure: (ch.payment_method_details?.card?.three_d_secure as any)?.result ?? null,
            cvcCheck: ch.payment_method_details?.card?.checks?.cvc_check ?? null,
            disputed: ch.disputed ?? false,
          });
        }
      }
    } catch (e) {
      console.error("dossier: stripe charges lookup failed", e);
    }

    // ── Timeline cronológico unificado
    const timeline: TimelineItem[] = [
      ...evidRows.map((e) => ({
        at: e.created_at as string,
        source: "evidencia" as const,
        event: e.event as string,
        detail: fmtDetail({ ...(e.metadata ?? {}), ua: e.user_agent ? String(e.user_agent).slice(0, 60) : undefined }),
        ip: e.ip as string | null,
      })),
      ...billingRows.map((b) => ({
        at: b.created_at as string,
        source: "facturación" as const,
        event: b.event as string,
        detail: fmtDetail({ ok: b.ok, ...(b.detail ?? {}) }),
      })),
      ...stripeRows.map((s) => ({
        at: (s.received_at ?? s.processed_at) as string,
        source: "stripe" as const,
        event: s.type as string,
        detail: fmtDetail({ status: s.status, sub: s.stripe_subscription_id }),
      })),
      ...reportRows.map((r) => ({
        at: r.updated_at as string,
        source: "soporte" as const,
        event: "reporte",
        detail: fmtDetail(r.data ?? {}),
      })),
    ]
      .filter((t) => t.at)
      .sort((a, b) => a.at.localeCompare(b.at));

    // ── Score de ganabilidad (heurístico, con razones)
    const logins = evidRows.filter((e) => e.event === "login").length;
    const usageCount = quizzes.length + sims.length;
    const purchaseIp = evidRows.find((e) => e.event === "checkout_opened" || e.event === "account_created")?.ip ?? null;
    const sameIp = !!purchaseIp && !!topIp && purchaseIp === topIp;
    const any3ds = charges.some((c) => c.threeDSecure === "authenticated");
    const activeSub = subRows.some((s) => ["active", "trialing", "past_due"].includes(s.status));
    const reasons: DossierScoreReason[] = [
      { ok: !!termsEv, label: termsEv ? `Términos aceptados (${termsEv.metadata?.version ?? "versión registrada"})` : "Sin registro de aceptación de términos" },
      { ok: logins >= 3, label: `${logins} inicios de sesión registrados` },
      { ok: usageCount > 0, label: usageCount > 0 ? `Uso real: ${quizzes.length} cuestionarios y ${sims.length} simulacros` : "Sin uso registrado del producto" },
      { ok: studyMinutes >= 60, label: `${Math.round(studyMinutes)} minutos de estudio acumulados` },
      { ok: activeDays >= 3, label: `${activeDays} días activos` },
      { ok: sameIp, label: sameIp ? "Misma IP en compra/registro y uso" : "IP de compra y de uso no coinciden (o falta dato)" },
      { ok: any3ds, label: any3ds ? "Cobro autenticado con 3D Secure" : "Sin 3D Secure registrado" },
      { ok: activeSub, label: activeSub ? "Suscripción activa en Stripe" : "Sin suscripción activa" },
    ];
    const weights = [20, 15, 20, 10, 10, 10, 15, 10];
    const raw = reasons.reduce((s, r, i) => s + (r.ok ? weights[i] : 0), 0);
    const pct = Math.max(5, Math.min(95, Math.round((raw / weights.reduce((a, b) => a + b, 0)) * 100)));

    return {
      generatedAt: new Date().toISOString(),
      environment: data.environment,
      user: {
        id: userId,
        email: prof.email as string,
        nombre: (pdata.nombre as string | undefined) ?? null,
        plan: (pdata.planNombre as string | undefined) ?? (pdata.plan as string | undefined) ?? null,
        accessStart: (pdata.accessStart as string | undefined) ?? null,
        accessEnd: (pdata.accessEnd as string | undefined) ?? null,
      },
      terms: {
        accepted: !!termsEv,
        version: (termsEv?.metadata?.version as string | undefined) ?? null,
        at: (termsEv?.created_at as string | undefined) ?? null,
        ip: (termsEv?.ip as string | undefined) ?? null,
      },
      logins: {
        total: logins,
        first: loginEvs[0]?.created_at ?? null,
        last: loginEvs.at(-1)?.created_at ?? null,
        distinctIps: ipCounts.size,
        topIp,
      },
      usage: {
        quizzes: quizzes.length,
        questionsAnswered,
        avgScorePct,
        sims: sims.length,
        studyMinutes: Math.round(studyMinutes),
        activeDays,
        flashSessions: flash.length,
        clasesVistas: clases.length,
      },
      subscriptions: subRows.map((s) => ({
        stripe_subscription_id: s.stripe_subscription_id,
        status: s.status,
        price_id: s.price_id,
        current_period_start: s.current_period_start,
        current_period_end: s.current_period_end,
        cancel_at_period_end: !!s.cancel_at_period_end,
        created_at: s.created_at,
      })),
      charges,
      support: reportRows.map((r) => ({ at: r.updated_at as string, detail: fmtDetail(r.data ?? {}) })),
      timeline,
      score: { pct, reasons },
    };
  });
