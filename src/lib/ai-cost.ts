/**
 * Estimación de costo de la IA (Yaris + Pathy).
 *
 * No hay una API de facturación de OpenAI conectada, así que el costo se
 * calcula a partir de los tokens que ya bitacoriza `ai_usage`, con las tarifas
 * publicadas del modelo. Es un estimado: sirve para vigilar la tendencia y el
 * costo por estudiante, no para conciliar la factura al centavo.
 */

/** USD por 1,000,000 de tokens. */
export const AI_RATE_IN_USD_PER_MTOK = 1.25;
export const AI_RATE_OUT_USD_PER_MTOK = 10;

/** Tipo de cambio de referencia para mostrar el estimado en pesos. */
export const USD_MXN = 18;

export interface AiCost {
  usd: number;
  mxn: number;
}

export function estimateAiCost(tokensIn: number, tokensOut: number): AiCost {
  const usd =
    (tokensIn / 1_000_000) * AI_RATE_IN_USD_PER_MTOK + (tokensOut / 1_000_000) * AI_RATE_OUT_USD_PER_MTOK;
  return { usd, mxn: usd * USD_MXN };
}

export function fmtUsd(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
}

export function fmtMxn(n: number): string {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}
