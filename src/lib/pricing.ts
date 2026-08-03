/**
 * Fuente única de verdad de precios de FlightPath.
 *
 * El importe que realmente se cobra vive en Stripe: `createCheckoutSession`
 * resuelve el precio por `lookup_key`, nunca por un número escrito en el
 * código. Este módulo existe para que TODA la UI (landing, FAQ, planes,
 * configuración del panel admin) muestre el mismo valor y para dar un
 * respaldo cuando Stripe no está disponible o la página se prerrenderiza.
 *
 * Regla: ningún componente debe escribir un precio a mano. Si necesitas
 * mostrar uno, impórtalo de aquí o léelo con `getPublicPricing()`.
 */

/** Lookup key del precio mensual de Pro en Stripe (el único comprable hoy). */
export const PRO_MONTHLY_LOOKUP_KEY = "flightpath_pro_monthly";

export interface PlanPrice {
  /** Importe en la unidad mayor de la moneda (pesos, no centavos). */
  amount: number;
  currency: string;
  /** "month" | "year" para precios recurrentes; null si es pago único. */
  interval: "month" | "year" | null;
}

/**
 * Respaldo del precio mensual de Pro.
 *
 * Debe coincidir con el `lookup_key` de arriba en Stripe. Se usa cuando la
 * consulta a Stripe no está disponible (SSR de la landing, entorno sin
 * credenciales, fallo de red). `getPublicPricing()` siempre gana sobre esto.
 */
export const PRO_MONTHLY_FALLBACK: PlanPrice = {
  amount: 3000,
  currency: "MXN",
  interval: "month",
};

/** Formatea un precio para mostrarlo: `$3,000 MXN`. */
export function formatPrice(price: PlanPrice): string {
  return `$${price.amount.toLocaleString("es-MX")} ${price.currency.toUpperCase()}`;
}

/** Formatea con periodicidad: `$3,000 MXN/mes`. */
export function formatPriceWithInterval(price: PlanPrice): string {
  const suffix = price.interval === "month" ? "/mes" : price.interval === "year" ? "/año" : "";
  return `${formatPrice(price)}${suffix}`;
}
