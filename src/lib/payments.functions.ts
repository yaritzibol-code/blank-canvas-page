/**
 * Server functions de pagos — checkout embebido, portal de facturación
 * y sincronización del plan Pro al perfil del usuario tras el webhook.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type CheckoutResult = { clientSecret: string } | { error: string };
type PortalResult = { url: string } | { error: string };

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

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
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
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
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

    const now = Date.now();
    const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end as string).getTime() : null;
    const inWindow = periodEnd === null || periodEnd > now;
    const subscribed = !!sub && inWindow && ["active", "trialing", "past_due"].includes(sub.status as string)
      || !!sub && sub.status === "canceled" && !!periodEnd && periodEnd > now;

    const result: PlanSyncResult = subscribed
      ? {
          plan: "paga",
          planNombre: "FlightPath Pro",
          accessStatus: "activo",
          accessEnd: (sub?.current_period_end as string | null) ?? null,
          subscribed: true,
          status: (sub?.status as string) ?? null,
        }
      : {
          plan: "basica",
          planNombre: "Suscripción básica",
          accessStatus: sub && !inWindow ? "expirado" : "activo",
          accessEnd: (sub?.current_period_end as string | null) ?? null,
          subscribed: false,
          status: (sub?.status as string) ?? null,
        };

    // Merge en profiles.data (JSON) sin pisar el resto del perfil.
    const { data: prof } = await supabase.from("profiles").select("data").eq("id", userId).maybeSingle();
    const prevData = (prof?.data ?? {}) as Record<string, unknown>;
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
    await supabase.from("profiles").update({ data: nextData }).eq("id", userId);

    return result;
  });
