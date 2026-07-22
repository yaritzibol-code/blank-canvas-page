/**
 * Webhook de Stripe — actualiza la tabla `subscriptions` con el estado real
 * y espeja el plan Pro / básica en `profiles.data` para que el gating de la
 * app se desbloquee de inmediato en cuanto Stripe confirma el pago.
 * La ruta debe permanecer exactamente en /api/public/payments/webhook.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );
  }
  return _supabase;
}

function priceLookup(item: any): string {
  return item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id || item?.price?.id || "";
}

/** Refleja el estado de la suscripción en `profiles.data` (plan/access). */
async function syncProfileFromSubscription(
  userId: string,
  status: string,
  periodEndISO: string | null,
) {
  const now = Date.now();
  const periodEndMs = periodEndISO ? new Date(periodEndISO).getTime() : null;
  const inWindow = periodEndMs === null || periodEndMs > now;
  const subscribed =
    (["active", "trialing", "past_due"].includes(status) && inWindow) ||
    (status === "canceled" && periodEndMs !== null && periodEndMs > now);

  const supabase = getSupabase();
  const { data: prof } = await supabase.from("profiles").select("data").eq("id", userId).maybeSingle();
  const prevData = ((prof?.data ?? {}) as Record<string, unknown>) || {};

  const nextData: Record<string, unknown> = {
    ...prevData,
    plan: subscribed ? "paga" : "basica",
    planNombre: subscribed ? "FlightPath Pro" : (prevData.planNombre ?? "Suscripción básica"),
    accessStatus: subscribed ? "activo" : periodEndMs && !inWindow ? "expirado" : (prevData.accessStatus ?? "activo"),
    accessEnd: periodEndISO,
  };
  if (subscribed && prevData.plan !== "paga") {
    nextData.accessStart = new Date().toISOString();
  }
  await supabase.from("profiles").update({ data: nextData }).eq("id", userId);
}

async function handleSubscriptionUpsert(sub: any, env: StripeEnv) {
  const userId = sub.metadata?.userId;
  if (!userId) {
    console.error("subscription without userId metadata", sub.id);
    return;
  }
  const item = sub.items?.data?.[0];
  const priceId = priceLookup(item);
  const productId = item?.price?.product ?? "";
  const periodStart = item?.current_period_start ?? sub.current_period_start;
  const periodEnd = item?.current_period_end ?? sub.current_period_end;
  const periodEndISO = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;

  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: sub.customer,
      product_id: productId,
      price_id: priceId,
      status: sub.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEndISO,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  await syncProfileFromSubscription(userId, sub.status, periodEndISO);
}

async function handleSubscriptionDeleted(sub: any, env: StripeEnv) {
  const userId = sub.metadata?.userId;
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", sub.id)
    .eq("environment", env);
  if (userId) {
    const periodEnd = sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end;
    const periodEndISO = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
    await syncProfileFromSubscription(userId, "canceled", periodEndISO);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
              await handleSubscriptionUpsert(event.data.object, env);
              break;
            case "customer.subscription.deleted":
              await handleSubscriptionDeleted(event.data.object, env);
              break;
            default:
              console.log("unhandled stripe event", event.type);
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error("webhook error", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
