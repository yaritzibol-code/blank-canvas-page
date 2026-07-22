/**
 * Webhook de Stripe — actualiza `subscriptions`, espeja el plan en `profiles.data`
 * y bitacoriza cada evento en `stripe_events` para auditoría desde el panel admin.
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

/** Payload mínimo persistido para diagnóstico (no toda la carga de Stripe). */
function minimalPayload(obj: any) {
  const item = obj?.items?.data?.[0];
  return {
    id: obj?.id,
    customer: obj?.customer,
    status: obj?.status,
    current_period_end: item?.current_period_end ?? obj?.current_period_end ?? null,
    cancel_at_period_end: obj?.cancel_at_period_end ?? null,
    price: priceLookup(item),
    metadata: obj?.metadata ?? {},
  };
}

async function syncProfileFromSubscription(userId: string, status: string, periodEndISO: string | null) {
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
  await supabase.from("profiles").update({ data: nextData as never }).eq("id", userId);
}

async function handleSubscriptionUpsert(sub: any, env: StripeEnv) {
  const userId = sub.metadata?.userId;
  if (!userId) throw new Error("subscription without userId metadata");
  const item = sub.items?.data?.[0];
  const periodEnd = item?.current_period_end ?? sub.current_period_end;
  const periodEndISO = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
  const periodStart = item?.current_period_start ?? sub.current_period_start;

  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: sub.customer,
      product_id: item?.price?.product ?? "",
      price_id: priceLookup(item),
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
    const item = sub.items?.data?.[0];
    const periodEnd = item?.current_period_end ?? sub.current_period_end;
    const periodEndISO = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
    await syncProfileFromSubscription(userId, "canceled", periodEndISO);
  }
}

/** Procesa un evento Stripe (reutilizable por reprocesado manual desde admin). */
export async function processStripeEvent(event: { type: string; data: { object: any } }, env: StripeEnv) {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpsert(event.data.object, env);
      return "processed" as const;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object, env);
      return "processed" as const;
    default:
      return "ignored" as const;
  }
}

async function logEvent(
  event: any,
  env: StripeEnv,
  status: "processed" | "ignored" | "failed",
  errorMessage: string | null,
) {
  const obj = event?.data?.object ?? {};
  await getSupabase().from("stripe_events").upsert(
    {
      stripe_event_id: event?.id ?? `unknown_${Date.now()}`,
      type: event?.type ?? "unknown",
      environment: env,
      status,
      error_message: errorMessage,
      user_id: obj?.metadata?.userId ?? null,
      stripe_subscription_id: obj?.id?.startsWith?.("sub_") ? obj.id : null,
      stripe_customer_id: typeof obj?.customer === "string" ? obj.customer : null,
      payload: minimalPayload(obj) as never,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "stripe_event_id" },
  );
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
        let event: any = null;
        try {
          event = await verifyWebhook(request, env);
          const outcome = await processStripeEvent(event, env);
          await logEvent(event, env, outcome, null);
          return Response.json({ received: true });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("webhook error", msg);
          if (event) {
            try {
              await logEvent(event, env, "failed", msg);
            } catch (logErr) {
              console.error("failed to log stripe event", logErr);
            }
          }
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
