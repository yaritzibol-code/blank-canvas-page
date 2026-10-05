/**
 * Pixel de OpenAI (ChatGPT Ads) — medición del navegador.
 *
 * Convive con el pixel de Meta sin conflicto: usa su propia global `oaiq`
 * y carga un SDK distinto (`oaiq.min.js`). Mismo patrón que `@/lib/meta`:
 * el código base se inyecta una sola vez desde `__root.tsx` (bandera
 * `__fpOaiqBoot`) y los eventos se disparan con `oaiqMeasure`.
 */

/** ID del pixel de OpenAI (cuenta publicitaria FlightPath). */
export const OAIQ_PIXEL_ID = "32og7nnehjCbeJXJv9tBF2";

export function isOaiqConfigured(): boolean {
  return OAIQ_PIXEL_ID.length > 0;
}

/** Código base del pixel: carga `oaiq.min.js` e inicializa una sola vez. */
export function oaiqBootScript(): string {
  return `if(!window.__fpOaiqBoot){window.__fpOaiqBoot=1;!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,'script','https://bzrcdn.openai.com/sdk/oaiq.min.js');oaiq('init',{pixelId:'${OAIQ_PIXEL_ID}',debug:true});}`;
}

type OaiqFn = (...args: unknown[]) => void;

function oaiq(): OaiqFn | null {
  if (typeof window === "undefined" || !isOaiqConfigured()) return null;
  const w = window as unknown as { oaiq?: OaiqFn };
  return typeof w.oaiq === "function" ? w.oaiq : null;
}

/** Evento de medición del pixel de OpenAI. */
export function oaiqMeasure(event: string, params?: Record<string, unknown>): void {
  const f = oaiq();
  if (!f) return;
  f("measure", event, params ?? {});
}
