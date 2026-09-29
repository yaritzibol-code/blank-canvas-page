/**
 * Meta (Facebook/Instagram) — Pixel del navegador y datos de atribución.
 *
 * Mientras `META_PIXEL_ID` esté vacío, todo aquí es inerte: no se inyecta el
 * pixel ni se dispara nada (mismo patrón que `@/lib/ads`). En cuanto tengas el
 * ID del dataset/pixel (Administrador de eventos → Orígenes de datos), basta
 * con rellenarlo.
 *
 * La compra se reporta dos veces a propósito: aquí desde `/gracias` y desde el
 * webhook de Stripe por la API de Conversiones (`meta-capi.server.ts`). Ambas
 * usan el id de la sesión de checkout como `eventID`, así Meta deduplica y la
 * suscripción queda atribuida al anuncio aunque el navegador bloquee el pixel.
 */

/** ID del pixel / dataset de Meta: sólo dígitos. */
export const META_PIXEL_ID = "";

export function isMetaConfigured(): boolean {
  return /^\d{6,20}$/.test(META_PIXEL_ID);
}

/** Código base del pixel: carga `fbevents.js`, inicializa y registra la primera visita. */
export function metaPixelBootScript(): string {
  return `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`;
}

type FbqFn = (...args: unknown[]) => void;

function fbq(): FbqFn | null {
  if (typeof window === "undefined" || !isMetaConfigured()) return null;
  const w = window as unknown as { fbq?: FbqFn };
  return typeof w.fbq === "function" ? w.fbq : null;
}

/** Evento estándar del pixel. `eventId` sólo hace falta si el servidor también lo envía. */
export function metaTrack(event: string, params?: Record<string, unknown>, eventId?: string): void {
  const f = fbq();
  if (!f) return;
  if (eventId) f("track", event, params ?? {}, { eventID: eventId });
  else f("track", event, params ?? {});
}

/**
 * Compra de la suscripción, una sola vez por sesión de pago (recargar
 * `/gracias` no la duplica). Sin `sessionId` no se envía: sin él no hay forma
 * de deduplicarla contra el evento del servidor.
 */
export function metaTrackSubscription(opts: {
  value: number;
  currency: string;
  sessionId?: string;
}): void {
  if (!opts.sessionId || !fbq()) return;
  const key = `fp_meta_purchase_${opts.sessionId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* almacenamiento bloqueado: preferimos disparar a perder la conversión */
  }
  const params = { value: opts.value, currency: opts.currency, content_name: "FlightPath Pro" };
  metaTrack("Purchase", params, opts.sessionId);
  metaTrack("Subscribe", params, opts.sessionId);
}

/* ───────────────────────── Atribución ───────────────────────── */

const ATTR_KEY = "fp_attr";

/** Parámetros de URL que conservamos del anuncio hasta el checkout. */
const URL_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fb_ad_id",
] as const;

export interface Attribution {
  fbc?: string;
  fbp?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fb_ad_id?: string;
  /** URL donde aterrizó la visita que trae el anuncio. */
  url?: string;
}

function readCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

function readStored(): Attribution {
  try {
    return JSON.parse(localStorage.getItem(ATTR_KEY) || "{}") as Attribution;
  } catch {
    return {};
  }
}

/**
 * Guarda el `fbclid` y los UTM con los que llega una visita. Último clic gana:
 * si la URL trae datos de campaña, reemplazan a los anteriores. Se ejecuta en
 * cada carga para que el registro y el checkout, varias páginas después,
 * todavía sepan de qué anuncio vino la persona.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  const fresh: Attribution = {};
  for (const k of URL_PARAMS) {
    const v = params.get(k);
    if (v) fresh[k] = v.slice(0, 200);
  }
  if (fbclid) fresh.fbc = `fb.1.${Date.now()}.${fbclid}`;
  if (!Object.keys(fresh).length) return;
  fresh.url = window.location.href.slice(0, 500);
  try {
    localStorage.setItem(ATTR_KEY, JSON.stringify(fresh));
  } catch {
    /* sin almacenamiento el pixel aún deja sus cookies */
  }
}

/** Datos de atribución vigentes: las cookies del pixel ganan sobre lo guardado. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const stored = readStored();
  const fbc = readCookie("_fbc") ?? stored.fbc;
  const fbp = readCookie("_fbp");
  return {
    ...stored,
    ...(fbc ? { fbc } : {}),
    ...(fbp ? { fbp } : {}),
  };
}
