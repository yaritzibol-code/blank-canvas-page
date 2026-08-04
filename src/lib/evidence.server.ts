/**
 * Evidence Engine — server-only.
 *
 * Inserta eventos en el ledger append-only `public.evidence_events` y
 * mantiene `public.disputes` desde el webhook de Stripe. Igual que la
 * bitácora de facturación: NUNCA lanza — perder un evento de evidencia
 * jamás debe romper un flujo de producto.
 */
import type { StripeEnv } from "@/lib/stripe.server";

/** Eventos que el cliente puede reportar vía server function (whitelist). */
export const CLIENT_EVIDENCE_EVENTS = [
  "account_created",
  "terms_accepted",
  "login",
  "quiz_completed",
  "sim_completed",
  "clase_viewed",
  "flashcards_session",
  "checkout_opened",
] as const;
export type ClientEvidenceEvent = (typeof CLIENT_EVIDENCE_EVENTS)[number];

/** Eventos que solo origina el servidor (webhooks). */
export type ServerEvidenceEvent = "dispute_received" | "dispute_updated" | "dispute_closed";

export interface EvidenceInput {
  event: ClientEvidenceEvent | ServerEvidenceEvent;
  userId?: string | null;
  environment?: StripeEnv;
  ip?: string | null;
  userAgent?: string | null;
  locale?: string | null;
  timezone?: string | null;
  referer?: string | null;
  metadata?: Record<string, unknown>;
}

export async function insertEvidenceEvent(input: EvidenceInput): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("evidence_events").insert({
      user_id: input.userId ?? null,
      event: input.event,
      environment: input.environment ?? "live",
      ip: input.ip ?? null,
      user_agent: input.userAgent ?? null,
      locale: input.locale ?? null,
      timezone: input.timezone ?? null,
      referer: input.referer ?? null,
      metadata: (input.metadata ?? {}) as never,
    });
  } catch (e) {
    console.error("evidence_events insert failed", e);
  }
}

/** Contexto de red del request actual (IP real detrás del proxy, UA, referer). */
export function requestContext(request: Request | null | undefined): {
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
} {
  if (!request) return { ip: null, userAgent: null, referer: null };
  const h = request.headers;
  const fwd = h.get("x-forwarded-for") ?? h.get("cf-connecting-ip") ?? h.get("x-real-ip");
  return {
    ip: fwd ? fwd.split(",")[0].trim() : null,
    userAgent: h.get("user-agent"),
    referer: h.get("referer"),
  };
}

/** Upsert de una disputa de Stripe (charge.dispute.created/updated/closed). */
export async function upsertDisputeFromStripe(dispute: any, env: StripeEnv): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Resolver usuario: la disputa trae charge/customer; lo cruzamos con
    // `subscriptions.stripe_customer_id`. Best-effort: puede quedar null.
    let userId: string | null = dispute?.metadata?.userId ?? null;
    let customerId: string | null = null;
    try {
      if (!userId && dispute?.charge) {
        const { createStripeClient } = await import("@/lib/stripe.server");
        const stripe = createStripeClient(env);
        const charge = await stripe.charges.retrieve(String(dispute.charge));
        customerId = typeof charge.customer === "string" ? charge.customer : (charge.customer?.id ?? null);
        userId = (charge.metadata?.userId as string | undefined) ?? null;
        if (!userId && customerId) {
          const { data } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .eq("environment", env)
            .limit(1)
            .maybeSingle();
          userId = (data?.user_id as string | undefined) ?? null;
        }
      }
    } catch (e) {
      console.error("dispute user resolution failed", e);
    }

    await supabaseAdmin.from("disputes").upsert(
      {
        stripe_dispute_id: dispute?.id ?? `unknown_${Date.now()}`,
        charge_id: dispute?.charge ?? null,
        payment_intent_id: dispute?.payment_intent ?? null,
        user_id: userId,
        environment: env,
        reason: dispute?.reason ?? null,
        status: dispute?.status ?? null,
        amount: typeof dispute?.amount === "number" ? dispute.amount / 100 : null,
        currency: dispute?.currency ? String(dispute.currency).toUpperCase() : null,
        evidence_due_by: dispute?.evidence_details?.due_by
          ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_dispute_id" },
    );

    const event: ServerEvidenceEvent =
      dispute?.status === "won" || dispute?.status === "lost" || dispute?.status === "warning_closed"
        ? "dispute_closed"
        : dispute?.__eventType === "created"
          ? "dispute_received"
          : "dispute_updated";
    await insertEvidenceEvent({
      event,
      userId,
      environment: env,
      metadata: {
        stripe_dispute_id: dispute?.id,
        charge: dispute?.charge,
        reason: dispute?.reason,
        status: dispute?.status,
        amount: typeof dispute?.amount === "number" ? dispute.amount / 100 : null,
        currency: dispute?.currency,
      },
    });
  } catch (e) {
    console.error("disputes upsert failed", e);
  }
}
