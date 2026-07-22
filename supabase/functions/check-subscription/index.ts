// Edge function: consulta en Stripe si el usuario autenticado tiene una
// suscripción activa, actualiza la tabla `subscribers` (service role) y
// devuelve { subscribed, subscription_tier, subscription_end }.
//
// La app la invoca al entrar al dashboard y al volver del checkout; así el
// plan local ("basica"/"paga") refleja el estado real de Stripe sin webhooks.
//
// Secretos requeridos: STRIPE_SECRET_KEY.
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      // Sin Stripe configurado la app sigue operando con el plan local.
      return json({ configured: false, subscribed: false, subscription_tier: null, subscription_end: null });
    }

    // Service role: puede escribir `subscribers` saltando RLS.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No autorizado." }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user?.email) return json({ error: "No autorizado." }, 401);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    let subscribed = false;
    let tier: string | null = null;
    let end: string | null = null;
    let customerId: string | null = null;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
      if (subs.data.length > 0) {
        const sub = subs.data[0];
        subscribed = true;
        end = new Date(sub.current_period_end * 1000).toISOString();
        const price = sub.items.data[0]?.price;
        tier = price?.nickname ?? (price?.recurring?.interval === "year" ? "Plan Anual" : "Plan Mensual");
      }
    }

    await admin.from("subscribers").upsert(
      {
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        subscribed,
        subscription_tier: tier,
        subscription_end: end,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    );

    return json({ configured: true, subscribed, subscription_tier: tier, subscription_end: end });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, 500);
  }
});
