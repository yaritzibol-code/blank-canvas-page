/**
 * Google Ads — etiqueta global y evento de conversión de compra.
 *
 * Mientras `GOOGLE_ADS_ID` esté vacío, todo aquí es inerte: no se inyecta
 * script ni se dispara nada. En cuanto tengas el ID (`AW-XXXXXXXXX`) y la
 * etiqueta de conversión (`AW-XXXXXXXXX/abcDEF...`), basta con rellenarlos.
 */

/** ID de la cuenta de Google Ads, formato `AW-XXXXXXXXX`. */
export const GOOGLE_ADS_ID = "";

/** Etiqueta `send_to` de la conversión de compra: `AW-XXXXXXXXX/etiqueta`. */
export const GOOGLE_ADS_PURCHASE_LABEL = "";

export function isAdsConfigured(): boolean {
  return GOOGLE_ADS_ID.startsWith("AW-");
}

type GtagFn = (...args: unknown[]) => void;

function gtag(): GtagFn | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { gtag?: GtagFn };
  return typeof w.gtag === "function" ? w.gtag : null;
}

/**
 * Registra la compra una sola vez por sesión de pago. Si el usuario recarga
 * `/gracias`, `sessionStorage` evita duplicar la conversión.
 */
export function trackPurchase(opts: { value: number; currency?: string; transactionId?: string }): void {
  if (!isAdsConfigured() || !GOOGLE_ADS_PURCHASE_LABEL) return;
  const g = gtag();
  if (!g) return;

  const key = `fp_ads_purchase_${opts.transactionId ?? "sin-sesion"}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* almacenamiento bloqueado: preferimos disparar a perder la conversión */
  }

  g("event", "conversion", {
    send_to: GOOGLE_ADS_PURCHASE_LABEL,
    value: opts.value,
    currency: opts.currency ?? "MXN",
    ...(opts.transactionId ? { transaction_id: opts.transactionId } : {}),
  });
}
