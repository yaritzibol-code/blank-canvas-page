/**
 * Reporte de errores del navegador hacia `/api/public/client-errors`.
 *
 * El endpoint y la tabla `client_errors` (con su vista en el panel admin)
 * existían, pero nada del cliente los alimentaba: en producción los crashes
 * de los usuarios eran invisibles. Este módulo captura errores globales
 * (window.onerror y promesas no manejadas) y los envía con throttling y
 * deduplicación para no spamear el rate-limit del endpoint (20/min por IP).
 */
import { getSessionUserId } from "@/lib/store";

const MAX_PER_SESSION = 8;
const sent = new Set<string>();
let count = 0;
let installed = false;

/** Ruido conocido que no vale la pena registrar. */
const IGNORE = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i, // errores opacos de scripts cross-origin
  /AbortError/i,
  /Loading chunk .* failed/i, // deploys: el usuario recarga y se resuelve
];

function shouldSkip(message: string): boolean {
  if (count >= MAX_PER_SESSION) return true;
  if (IGNORE.some((re) => re.test(message))) return true;
  const key = message.slice(0, 200);
  if (sent.has(key)) return true;
  sent.add(key);
  return false;
}

/** Envía un error al backend. Silencioso: jamás debe romper la app. */
export function reportClientError(error: unknown, source?: string) {
  try {
    if (typeof window === "undefined") return;
    // En desarrollo el endpoint no tiene service key y sólo generaría ruido.
    if (import.meta.env.DEV) return;
    const err = error instanceof Error ? error : null;
    const message = (err?.message ?? String(error ?? "Error desconocido")).slice(0, 1900);
    if (!message || shouldSkip(message)) return;
    count++;
    const body = JSON.stringify({
      message: source ? `[${source}] ${message}`.slice(0, 2000) : message,
      stack: err?.stack?.slice(0, 8000) ?? null,
      route: (window.location.pathname + window.location.search).slice(0, 500),
      userId: getSessionUserId(),
    });
    fetch("/api/public/client-errors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* nunca propagar */
  }
}

/** Instala los listeners globales una sola vez. */
export function installClientErrorReporter() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (event) => {
    // Los fallos de carga de recursos (img/script) llegan sin `error`; se omiten.
    if (!event.error && event.target !== window && !(event as ErrorEvent).message) return;
    reportClientError((event as ErrorEvent).error ?? (event as ErrorEvent).message);
  });
  window.addEventListener("unhandledrejection", (event) => {
    reportClientError((event as PromiseRejectionEvent).reason, "unhandledrejection");
  });
}
