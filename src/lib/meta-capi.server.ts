/**
 * API de Conversiones de Meta — server-only.
 *
 * Reporta cada suscripción pagada desde el webhook de Stripe, donde el cobro
 * ya está confirmado. Con el `fbc`/`fbp` que el checkout guardó en la metadata
 * de la sesión, Meta atribuye la compra al anuncio que trajo a la persona
 * aunque el pixel del navegador esté bloqueado o `/gracias` nunca cargue.
 *
 * `event_id` = id de la sesión de checkout, el mismo `eventID` que manda el
 * pixel en `/gracias`: Meta deduplica y cuenta una sola compra.
 *
 * Inerte sin `META_PIXEL_ID` (en `@/lib/meta`) o sin el secreto
 * `META_CAPI_ACCESS_TOKEN`. En sandbox sólo envía si hay
 * `META_TEST_EVENT_CODE`, y lo hace como evento de prueba.
 *
 * Nunca lanza: un fallo de Meta jamás debe romper el webhook de cobro.
 */
import type { StripeEnv } from "@/lib/stripe.server";
import { META_PIXEL_ID, isMetaConfigured } from "@/lib/meta";

const GRAPH_VERSION = "v23.0";

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Normaliza (minúsculas, sin espacios) y hashea; `undefined` si no hay valor. */
async function hashed(
  value: string | null | undefined,
  strip = /\s+/g,
): Promise<string | undefined> {
  const v = value?.toLowerCase().replace(strip, "").trim();
  return v ? sha256(v) : undefined;
}

/** Lo que se lee de la sesión de checkout de Stripe (evento `checkout.session.completed`). */
interface CheckoutSessionLike {
  id?: string;
  mode?: string;
  amount_total?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  metadata?: Record<string, string> | null;
  customer_details?: {
    email?: string | null;
    phone?: string | null;
    name?: string | null;
    address?: { city?: string | null; postal_code?: string | null; country?: string | null } | null;
  } | null;
}

export async function sendMetaSubscriptionEvents(
  session: CheckoutSessionLike | null | undefined,
  env: StripeEnv,
): Promise<void> {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const testCode = process.env.META_TEST_EVENT_CODE;
  if (!isMetaConfigured() || !token) return;
  if (env === "sandbox" && !testCode) return;
  if (session?.mode !== "subscription" || !session?.id) return;

  try {
    const md = session.metadata ?? {};
    const details = session.customer_details ?? {};
    const [first, ...rest] = String(details.name ?? "")
      .trim()
      .split(/\s+/);

    const user_data = Object.fromEntries(
      Object.entries({
        em: await hashed(details.email ?? session.customer_email),
        ph: await hashed(details.phone, /\D+/g),
        fn: await hashed(first),
        ln: await hashed(rest.join(" ")),
        ct: await hashed(details.address?.city),
        zp: await hashed(details.address?.postal_code),
        country: await hashed(details.address?.country),
        external_id: await hashed(md.userId),
        fbc: md.fb_fbc,
        fbp: md.fb_fbp,
        client_ip_address: md.fb_ip,
        client_user_agent: md.fb_ua,
      }).filter(([, v]) => !!v),
    );

    const custom_data = {
      value: (session.amount_total ?? 0) / 100,
      currency: String(session.currency ?? "mxn").toUpperCase(),
      content_name: "FlightPath Pro",
      content_ids: [md.priceLookupKey].filter(Boolean),
    };

    const base = {
      event_time: Math.floor(Date.now() / 1000),
      event_id: String(session.id),
      action_source: "website",
      event_source_url: md.fb_url || "https://flightpath.mx/dashboard/planes",
      user_data,
      custom_data,
    };

    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${META_PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          { ...base, event_name: "Purchase" },
          { ...base, event_name: "Subscribe" },
        ],
        access_token: token,
        ...(env === "sandbox" && testCode ? { test_event_code: testCode } : {}),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("meta capi rejected", res.status, await res.text());
  } catch (e) {
    console.error("meta capi failed", e);
  }
}
