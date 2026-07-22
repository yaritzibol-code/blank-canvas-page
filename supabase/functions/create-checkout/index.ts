// Edge function: crea una sesión de Stripe Checkout (modo suscripción) para el
// usuario autenticado y devuelve la URL de pago.
//
// Secretos requeridos (Lovable Cloud → Settings → Secrets):
//   STRIPE_SECRET_KEY  — clave secreta de Stripe (sk_test_… / sk_live_…)
//   STRIPE_PRICE_ID    — price recurrente por defecto (price_…); opcional si
//                        el cliente manda { priceId } en el body.
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
      return json({ error: "Stripe no está configurado todavía (falta STRIPE_SECRET_KEY)." }, 503);
    }

    // Usuario autenticado (token del header Authorization).
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No autorizado." }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user?.email) return json({ error: "No autorizado." }, 401);

    const body = await req.json().catch(() => ({}));
    const priceId: string | undefined = body?.priceId ?? Deno.env.get("STRIPE_PRICE_ID") ?? undefined;
    if (!priceId) {
      return json({ error: "Falta configurar el precio (STRIPE_PRICE_ID)." }, 503);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Reutiliza el customer si ya existe (por correo).
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") ?? "https://flightpath.lovable.app";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      client_reference_id: user.id,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/dashboard?checkout=cancelled`,
    });

    return json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, 500);
  }
});
