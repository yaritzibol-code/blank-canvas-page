/**
 * Capa de facturación (Stripe vía edge functions de Lovable Cloud).
 *
 * Terreno preparado para la app de paga: el flujo completo funciona en cuanto
 * se configuren los secretos en Lovable Cloud (STRIPE_SECRET_KEY y
 * STRIPE_PRICE_ID). Mientras tanto todas las llamadas degradan con gracia y la
 * app sigue operando con el plan local.
 *
 *   startCheckout()       → URL de Stripe Checkout (suscripción)
 *   openCustomerPortal()  → URL del portal de facturación (gestionar/cancelar)
 *   refreshSubscription() → sincroniza el estado real de Stripe con el plan
 *                           local del usuario (basica ⇄ paga)
 */
import { supa } from "./cloud";
import { getSessionUser, updateUser } from "./auth";
import { nowISO } from "./db";

export interface SubscriptionStatus {
  /** false cuando el backend aún no tiene STRIPE_SECRET_KEY configurada. */
  configured: boolean;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export interface BillingResult {
  ok: boolean;
  url?: string;
  error?: string;
}

const NOT_CONFIGURED = "Los pagos estarán disponibles muy pronto. Intenta más tarde.";

async function invokeForUrl(fn: string, body?: Record<string, unknown>): Promise<BillingResult> {
  const s = supa();
  if (!s) return { ok: false, error: NOT_CONFIGURED };
  try {
    const { data, error } = await s.functions.invoke(fn, { body: body ?? {} });
    if (error) return { ok: false, error: NOT_CONFIGURED };
    const payload = data as { url?: string; error?: string } | null;
    if (!payload?.url) return { ok: false, error: payload?.error ?? NOT_CONFIGURED };
    return { ok: true, url: payload.url };
  } catch {
    return { ok: false, error: NOT_CONFIGURED };
  }
}

/**
 * Crea la sesión de Stripe Checkout para desbloquear FlightPath completo.
 * @param priceId price de Stripe opcional; sin él usa STRIPE_PRICE_ID del backend.
 */
export function startCheckout(priceId?: string): Promise<BillingResult> {
  return invokeForUrl("create-checkout", priceId ? { priceId } : {});
}

/** Abre el portal de Stripe para gestionar o cancelar la suscripción. */
export function openCustomerPortal(): Promise<BillingResult> {
  return invokeForUrl("customer-portal");
}

/**
 * Consulta el estado real de la suscripción en Stripe y lo refleja en el plan
 * local del usuario. Solo PROMUEVE automáticamente (basica → paga); las bajas
 * las gestiona la administración (o un webhook futuro) para no pisar accesos
 * extendidos/pruebas otorgados a mano.
 */
export async function refreshSubscription(): Promise<SubscriptionStatus | null> {
  const s = supa();
  const me = getSessionUser();
  if (!s || !me) return null;
  try {
    const { data, error } = await s.functions.invoke("check-subscription");
    if (error || !data) return null;
    const status = data as SubscriptionStatus;
    if (!status.configured) return status;

    if (status.subscribed) {
      const patch: Parameters<typeof updateUser>[1] = {
        plan: "paga",
        planNombre: status.subscription_tier ?? "FlightPath completo",
        accessStatus: "activo",
        accessEnd: status.subscription_end ?? null,
      };
      if (me.plan !== "paga") patch.accessStart = nowISO();
      const changed =
        me.plan !== "paga" ||
        me.accessEnd !== (status.subscription_end ?? null) ||
        me.planNombre !== patch.planNombre;
      if (changed) updateUser(me.id, patch);
    }
    return status;
  } catch {
    return null;
  }
}
