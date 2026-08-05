/**
 * Bitácora de facturación — server-only.
 *
 * Registra en `public.billing_audit` cada paso del flujo de pago que ocurre
 * fuera del webhook (creación de checkout, portal, sincronización de plan) y
 * también la recepción de webhooks. Sirve para diagnosticar discrepancias
 * entre lo que muestra la UI y lo que dice Stripe.
 *
 * Nunca lanza: un fallo de bitácora jamás debe romper un cobro.
 */
import type { StripeEnv } from "@/lib/stripe.server";

export type BillingAuditEvent =
  | "checkout_session_created"
  | "checkout_session_failed"
  | "portal_session_created"
  | "portal_session_failed"
  | "plan_sync"
  | "plan_changed"
  | "webhook_received"
  | "webhook_processed"
  | "webhook_failed"
  | "subscription_cancel_requested"
  | "subscription_cancel_failed"
  | "subscription_resumed"
  | "plan_switched"
  | "plan_switch_failed";

export interface BillingAuditInput {
  event: BillingAuditEvent;
  environment: StripeEnv;
  userId?: string | null;
  /** `app` para server functions, `webhook` para eventos de Stripe. */
  source?: "app" | "webhook" | "admin";
  ok?: boolean;
  message?: string | null;
  detail?: Record<string, unknown>;
}

export async function logBillingEvent(input: BillingAuditInput): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("billing_audit").insert({
      event: input.event,
      environment: input.environment,
      user_id: input.userId ?? null,
      source: input.source ?? "app",
      ok: input.ok ?? true,
      message: input.message ?? null,
      detail: (input.detail ?? {}) as never,
    });
  } catch (e) {
    console.error("billing_audit insert failed", e);
  }
}
