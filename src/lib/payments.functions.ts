/**
 * Server functions de pagos — checkout embebido, portal de facturación
 * y sincronización del plan Pro al perfil del usuario tras el webhook.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";
import { PRO_MONTHLY_LOOKUP_KEY, type PlanPrice } from "@/lib/pricing";
import { logBillingEvent } from "@/lib/billing-audit.server";

type CheckoutResult = { clientSecret: string } | { error: string };
type PortalResult = { url: string } | { error: string };

/**
 * Precio público de Pro leído directamente de Stripe (la fuente de verdad del
 * cobro). Sin autenticación: sólo expone el importe de lista, ningún dato del
 * usuario. Devuelve `null` si Stripe no está configurado o el `lookup_key` no
 * existe, para que la UI caiga al respaldo de `@/lib/pricing`.
 */
export const getPublicPricing = createServerFn({ method: "POST" })
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data }): Promise<PlanPrice | null> => {
    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [PRO_MONTHLY_LOOKUP_KEY] });
      const price = prices.data[0];
      if (!price || price.unit_amount == null) return null;
      const interval = price.recurring?.interval;
      return {
        // Stripe entrega centavos; la UI muestra pesos.
        amount: price.unit_amount / 100,
        currency: price.currency.toUpperCase(),
        interval: interval === "month" || interval === "year" ? interval : null,
      };
    } catch {
      return null;
    }
  });

export type PlanSyncResult = {
  plan: "basica" | "paga";
  planNombre: string;
  accessStatus: "activo" | "expirado" | "inactivo";
  accessEnd: string | null;
  subscribed: boolean;
  status: string | null;
};

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId: string },
): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  const found = await stripe.customers.search({
    query: `metadata['userId']:'${options.userId}'`,
    limit: 1,
  });
  if (found.data.length) return found.data[0].id;

  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    metadata: { userId: options.userId },
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { priceId: string; returnUrl: string; environment: StripeEnv }) => {
      if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
      return data;
    },
  )
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      if (!prices.data.length) throw new Error("Precio no encontrado");
      const stripePrice = prices.data[0];
      const isRecurring = stripePrice.type === "recurring";

      const { data: { user } } = await context.supabase.auth.getUser();
      const email = user?.email ?? undefined;

      const customerId = await resolveOrCreateCustomer(stripe, {
        email,
        userId: context.userId,
      });

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: isRecurring ? "subscription" : "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        automatic_tax: { enabled: true },
        metadata: { userId: context.userId },
        ...(isRecurring && {
          subscription_data: { metadata: { userId: context.userId } },
        }),
      });

      await logBillingEvent({
        event: "checkout_session_created",
        environment: data.environment,
        userId: context.userId,
        detail: {
          session_id: session.id,
          price_lookup_key: data.priceId,
          stripe_price_id: stripePrice.id,
          customer: customerId,
          mode: session.mode,
        },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      const message = getStripeErrorMessage(error);
      await logBillingEvent({
        event: "checkout_session_failed",
        environment: data.environment,
        userId: context.userId,
        ok: false,
        message,
        detail: { price_lookup_key: data.priceId },
      });
      return { error: message };
    }
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl?: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<PortalResult> => {
    const { data: sub, error: subError } = await context.supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError || !sub?.stripe_customer_id) {
      return { error: "Aún no tienes una suscripción activa." };
    }

    try {
      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id as string,
        ...(data.returnUrl && { return_url: data.returnUrl }),
      });
      await logBillingEvent({
        event: "portal_session_created",
        environment: data.environment,
        userId: context.userId,
        detail: { customer: sub.stripe_customer_id },
      });
      return { url: portal.url };
    } catch (error) {
      const message = getStripeErrorMessage(error);
      await logBillingEvent({
        event: "portal_session_failed",
        environment: data.environment,
        userId: context.userId,
        ok: false,
        message,
      });
      return { error: message };
    }
  });

/**
 * Consulta la suscripción activa del usuario en la tabla `subscriptions` y
 * refleja el plan Pro en `profiles.data` (plan, accessStatus, accessEnd).
 * Se llama tras el checkout desde el cliente para reflejar el cambio de
 * inmediato aunque el webhook aún esté por llegar.
 */
export const syncMyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<PlanSyncResult> => {
    const { supabase, userId } = context;
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status,current_period_end,cancel_at_period_end,price_id")
      .eq("user_id", userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let status: string | null = (sub?.status as string) ?? null;
    let currentPeriodEnd: string | null = (sub?.current_period_end as string | null) ?? null;

    // Respaldo: si el webhook aún no llegó (o falló) preguntamos directamente a
    // Stripe por las suscripciones del usuario. Así el regreso del checkout
    // refleja el acceso Pro sin depender del tiempo de entrega del webhook.
    if (!status) {
      try {
        const stripe = createStripeClient(data.environment);
        const found = await stripe.subscriptions.search({
          query: `metadata['userId']:'${userId}'`,
          limit: 5,
        });
        const live = found.data
          .filter((s) => ["active", "trialing", "past_due"].includes(s.status))
          .sort((a, b) => b.created - a.created)[0];
        if (live) {
          status = live.status;
          const end = live.items.data[0]?.current_period_end;
          currentPeriodEnd = end ? new Date(end * 1000).toISOString() : null;
        }
      } catch {
        /* sin Stripe disponible nos quedamos con lo que hay en la base */
      }
    }

    const now = Date.now();
    const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd).getTime() : null;
    const inWindow = periodEnd === null || periodEnd > now;
    const subscribed =
      (!!status && inWindow && ["active", "trialing", "past_due"].includes(status)) ||
      (status === "canceled" && !!periodEnd && periodEnd > now);


    const result: PlanSyncResult = subscribed
      ? {
          plan: "paga",
          planNombre: "FlightPath Pro",
          accessStatus: "activo",
          accessEnd: currentPeriodEnd,
          subscribed: true,
          status,
        }
      : {
          plan: "basica",
          planNombre: "Suscripción básica",
          accessStatus: status && !inWindow ? "expirado" : "activo",
          accessEnd: currentPeriodEnd,
          subscribed: false,
          status,
        };

    // Merge en profiles.data (JSON) sin pisar el resto del perfil.
    const { data: prof } = await supabase.from("profiles").select("data").eq("id", userId).maybeSingle();
    const prevData = (prof?.data ?? {}) as Record<string, unknown>;

    // Sin rastro de suscripción en Stripe ni en la base no degradamos el
    // perfil: el acceso pudo otorgarse a mano desde el panel admin.
    if (!status) {
      await logBillingEvent({
        event: "plan_sync",
        environment: data.environment,
        userId,
        detail: { outcome: "sin_suscripcion", profile_plan: prevData.plan ?? null },
      });
      return { ...result, plan: (prevData.plan as PlanSyncResult["plan"]) ?? result.plan };
    }

    const nextData: Record<string, unknown> = {
      ...prevData,
      plan: result.plan,
      planNombre: result.planNombre,
      accessStatus: result.accessStatus,
      accessEnd: result.accessEnd,
    };
    if (result.plan === "paga" && prevData.plan !== "paga") {
      nextData.accessStart = new Date().toISOString();
    }
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ data: nextData as never })
      .eq("id", userId);

    const planChanged = prevData.plan !== result.plan;
    await logBillingEvent({
      event: planChanged ? "plan_changed" : "plan_sync",
      environment: data.environment,
      userId,
      ok: !updateError,
      message: updateError?.message ?? null,
      detail: {
        from: prevData.plan ?? null,
        to: result.plan,
        sub_status: status,
        access_end: result.accessEnd,
        source_of_truth: "stripe+db",
      },
    });

    return result;
  });

