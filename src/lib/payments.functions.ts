/**
 * Server functions de pagos — checkout embebido, portal de facturación
 * y sincronización del plan Pro al perfil del usuario tras el webhook.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";
import {
  PRO_ANNUAL_LOOKUP_KEY,
  PRO_MONTHLY_LOOKUP_KEY,
  PRO_SETUP_LOOKUP_KEY,
  type PlanPrice,
} from "@/lib/pricing";
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

/** Importe de la anualidad de Pro, leído de Stripe. `null` si no existe. */
export const getPublicAnnualPricing = createServerFn({ method: "POST" })
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data }): Promise<PlanPrice | null> => {
    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [PRO_ANNUAL_LOOKUP_KEY] });
      const price = prices.data[0];
      if (!price || price.unit_amount == null) return null;
      const interval = price.recurring?.interval;
      return {
        amount: price.unit_amount / 100,
        currency: price.currency.toUpperCase(),
        interval: interval === "month" || interval === "year" ? interval : null,
      };
    } catch {
      return null;
    }
  });

/**
 * Importe del pago único de inscripción, leído de Stripe con el mismo
 * `lookup_key` que usa el checkout. `null` si no está configurado.
 */
export const getPublicSetupPricing = createServerFn({ method: "POST" })
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data }): Promise<PlanPrice | null> => {
    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [PRO_SETUP_LOOKUP_KEY] });
      const price = prices.data[0];
      if (!price || price.unit_amount == null) return null;
      return { amount: price.unit_amount / 100, currency: price.currency.toUpperCase(), interval: null };
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
    (data: { priceId: string; returnUrl: string; environment: StripeEnv; promoCode?: string }) => {
      if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
      const promoCode = data.promoCode?.trim().toUpperCase();
      if (promoCode && !/^[A-Z0-9_-]{2,40}$/.test(promoCode)) throw new Error("Invalid promoCode");
      return { ...data, ...(promoCode ? { promoCode } : {}) };
    },
  )
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      if (!prices.data.length) throw new Error("Precio no encontrado");
      const stripePrice = prices.data[0];
      const isRecurring = stripePrice.type === "recurring";

      // Pro se cobra como inscripción única + mensualidad: en la suscripción
      // mensual se añade el pago único como segunda línea del mismo checkout.
      // Si el usuario ya pagó la inscripción antes, no se vuelve a cobrar.
      let setupPriceId: string | null = null;
      if (isRecurring && (data.priceId === PRO_MONTHLY_LOOKUP_KEY || data.priceId === PRO_ANNUAL_LOOKUP_KEY)) {
        const setup = await stripe.prices.list({ lookup_keys: [PRO_SETUP_LOOKUP_KEY] });
        setupPriceId = setup.data[0]?.id ?? null;
      }

      const { data: { user } } = await context.supabase.auth.getUser();
      const email = user?.email ?? undefined;

      const customerId = await resolveOrCreateCustomer(stripe, {
        email,
        userId: context.userId,
      });

      // ¿Ya pagó la inscripción en un checkout anterior?
      if (setupPriceId) {
        const previous = await stripe.checkout.sessions.list({
          customer: customerId,
          limit: 20,
        });
        for (const prev of previous.data) {
          if (prev.payment_status !== "paid") continue;
          const items = await stripe.checkout.sessions.listLineItems(prev.id, { limit: 10 });
          if (items.data.some((li) => li.price?.id === setupPriceId)) {
            setupPriceId = null;
            break;
          }
        }
      }

      // Cupones: si llega un código lo resolvemos y lo aplicamos directo;
      // si no, el checkout deja escribir uno. Stripe no admite las dos cosas a
      // la vez (`discounts` y `allow_promotion_codes` son excluyentes).
      let discounts: Array<{ promotion_code: string }> | null = null;
      if (data.promoCode) {
        const found = await stripe.promotionCodes.list({
          code: data.promoCode,
          active: true,
          limit: 1,
        });
        const promo = found.data[0];
        if (!promo) return { error: `El cupón "${data.promoCode}" no existe o ya no está activo.` };
        discounts = [{ promotion_code: promo.id }];
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [
          { price: stripePrice.id, quantity: 1 },
          ...(setupPriceId ? [{ price: setupPriceId, quantity: 1 }] : []),
        ],
        mode: isRecurring ? "subscription" : "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        // El impuesto automático necesita la dirección del cliente. Se pide en
        // el checkout y Stripe la guarda en el customer (`customer_update`);
        // sin esto el cobro falla con "requires a valid address on the customer".
        billing_address_collection: "required",
        customer_update: { address: "auto", name: "auto" },
        automatic_tax: { enabled: true },
        metadata: { userId: context.userId },
        ...(discounts ? { discounts } : { allow_promotion_codes: true }),
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
          setup_price_id: setupPriceId,
          promo_code: data.promoCode ?? null,
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
          planNombre: "Básica (gratis)",
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

export interface BillingState {
  /** Estado de la suscripción en Stripe (`active`, `canceled`…), null si no hay. */
  status: string | null;
  /** Fin del periodo pagado; con `cancelAtPeriodEnd` es la fecha de baja. */
  currentPeriodEnd: string | null;
  /** true cuando ya pidió la baja y sólo espera a que termine el periodo. */
  cancelAtPeriodEnd: boolean;
  /** `lookup_key` del precio contratado, para nombrar el plan. */
  priceId: string | null;
  /** true mientras el acceso Pro siga vigente. */
  active: boolean;
}

/** Estado de facturación del usuario para la vista de suscripción. */
export const getMyBilling = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<BillingState> => {
    const { data: sub } = await context.supabase
      .from("subscriptions")
      .select("status,current_period_end,cancel_at_period_end,price_id")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const status = (sub?.status as string | null) ?? null;
    const end = (sub?.current_period_end as string | null) ?? null;
    const vigente = end === null || new Date(end).getTime() > Date.now();
    return {
      status,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: Boolean(sub?.cancel_at_period_end),
      priceId: (sub?.price_id as string | null) ?? null,
      active: Boolean(status) && vigente && ["active", "trialing", "past_due"].includes(status!),
    };
  });

/**
 * Baja de la suscripción desde la propia app.
 *
 * Programa la cancelación al final del periodo ya pagado (no corta el acceso
 * a media mensualidad) y devuelve la fecha en la que terminará. Para cambios
 * de tarjeta o facturas queda el portal de Stripe.
 */
export const cancelMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<{ endsAt?: string | null; error?: string }> => {
    const { data: sub } = await context.supabase
      .from("subscriptions")
      .select("stripe_subscription_id,status")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const subId = sub?.stripe_subscription_id as string | undefined;
    if (!subId) return { error: "No encontramos una suscripción activa a tu nombre." };

    try {
      const stripe = createStripeClient(data.environment);
      const updated = await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
      const end = updated.items.data[0]?.current_period_end ?? null;
      const endsAt = end ? new Date(end * 1000).toISOString() : null;
      await context.supabase
        .from("subscriptions")
        .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subId);
      await logBillingEvent({
        event: "subscription_cancel_requested",
        environment: data.environment,
        userId: context.userId,
        detail: { subscription: subId, ends_at: endsAt },
      });
      return { endsAt };
    } catch (error) {
      const message = getStripeErrorMessage(error);
      await logBillingEvent({
        event: "subscription_cancel_failed",
        environment: data.environment,
        userId: context.userId,
        ok: false,
        message,
      });
      return { error: message };
    }
  });

/**
 * Reactiva una suscripción que estaba programada para darse de baja.
 */
export const resumeMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<{ ok?: true; error?: string }> => {
    const { data: sub } = await context.supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const subId = sub?.stripe_subscription_id as string | undefined;
    if (!subId) return { error: "No encontramos una suscripción a tu nombre." };
    try {
      const stripe = createStripeClient(data.environment);
      await stripe.subscriptions.update(subId, { cancel_at_period_end: false });
      await context.supabase
        .from("subscriptions")
        .update({ cancel_at_period_end: false, updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subId);
      await logBillingEvent({
        event: "subscription_resumed",
        environment: data.environment,
        userId: context.userId,
        detail: { subscription: subId },
      });
      return { ok: true };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/* ─────────────────── Historial de pagos y cambio de plan ─────────────────── */

export interface InvoiceRow {
  id: string;
  /** `paid`, `open`, `void`, `uncollectible`… tal cual lo reporta Stripe. */
  status: string | null;
  /** Importe pagado en pesos (no centavos). */
  amount: number;
  currency: string;
  /** Fecha del cobro en ISO. */
  date: string | null;
  /** Recibo/factura de Stripe para descargar. */
  hostedUrl: string | null;
  pdfUrl: string | null;
  /** Concepto legible de la primera línea del cobro. */
  concepto: string;
}

/**
 * Historial de cobros del usuario leído directamente de Stripe.
 *
 * Se lee de Stripe y no de la base porque las facturas (recibos, PDF, importes
 * con impuestos y prorrateos) sólo existen allá: la tabla `subscriptions`
 * guarda el estado, no el dinero cobrado.
 */
export const getMyInvoices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<{ invoices: InvoiceRow[]; error?: string }> => {
    try {
      const stripe = createStripeClient(data.environment);
      const { data: { user } } = await context.supabase.auth.getUser();
      const customerId = await resolveOrCreateCustomer(stripe, {
        email: user?.email ?? undefined,
        userId: context.userId,
      });
      const list = await stripe.invoices.list({ customer: customerId, limit: 24 });
      const invoices: InvoiceRow[] = list.data.map((inv) => {
        const line = inv.lines?.data?.[0];
        return {
          id: inv.id ?? "",
          status: inv.status ?? null,
          amount: (inv.amount_paid ?? 0) / 100,
          currency: (inv.currency ?? "mxn").toUpperCase(),
          date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
          hostedUrl: inv.hosted_invoice_url ?? null,
          pdfUrl: inv.invoice_pdf ?? null,
          concepto: line?.description ?? inv.description ?? "Suscripción FlightPath Pro",
        };
      });
      return { invoices };
    } catch (error) {
      return { invoices: [], error: getStripeErrorMessage(error) };
    }
  });

/**
 * Cambio entre plan mensual y anual con prorrateo automático.
 *
 * Stripe calcula el crédito de lo no consumido y cobra la diferencia de
 * inmediato (`always_invoice`), de forma que el usuario nunca paga dos veces
 * el mismo periodo. La inscripción no se vuelve a cobrar: es un pago único
 * que vive fuera de la suscripción.
 */
export const switchMyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv; interval: "month" | "year" }) => {
    if (data.interval !== "month" && data.interval !== "year") throw new Error("Intervalo inválido");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ ok?: true; renewsAt?: string | null; error?: string }> => {
    const { data: sub } = await context.supabase
      .from("subscriptions")
      .select("stripe_subscription_id,price_id,status")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const subId = sub?.stripe_subscription_id as string | undefined;
    if (!subId) return { error: "No encontramos una suscripción activa a tu nombre." };
    if (["canceled", "incomplete_expired"].includes((sub?.status as string) ?? "")) {
      return { error: "Tu suscripción ya no está activa. Vuelve a suscribirte desde Planes." };
    }

    const targetKey = data.interval === "year" ? PRO_ANNUAL_LOOKUP_KEY : PRO_MONTHLY_LOOKUP_KEY;
    if (sub?.price_id === targetKey) return { error: "Ya estás en ese plan." };

    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [targetKey] });
      const target = prices.data[0];
      if (!target) return { error: "El plan solicitado no está disponible por ahora." };

      const current = await stripe.subscriptions.retrieve(subId);
      const item = current.items.data[0];
      if (!item) return { error: "No pudimos leer tu suscripción en Stripe." };

      const updated = await stripe.subscriptions.update(subId, {
        items: [{ id: item.id, price: target.id }],
        proration_behavior: "always_invoice",
        cancel_at_period_end: false,
        metadata: { userId: context.userId },
      });

      const end = updated.items.data[0]?.current_period_end ?? null;
      const renewsAt = end ? new Date(end * 1000).toISOString() : null;

      await context.supabase
        .from("subscriptions")
        .update({
          price_id: targetKey,
          status: updated.status,
          current_period_end: renewsAt,
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subId);

      await logBillingEvent({
        event: "plan_switched",
        environment: data.environment,
        userId: context.userId,
        detail: { subscription: subId, from: sub?.price_id ?? null, to: targetKey, renews_at: renewsAt },
      });

      return { ok: true, renewsAt };
    } catch (error) {
      const message = getStripeErrorMessage(error);
      await logBillingEvent({
        event: "plan_switch_failed",
        environment: data.environment,
        userId: context.userId,
        ok: false,
        message,
        detail: { to: targetKey },
      });
      return { error: message };
    }
  });
