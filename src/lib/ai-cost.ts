/**
 * Costo de la IA.
 *
 * Hay dos formas de saber cuánto costó una llamada, y se usan en este orden:
 *
 *  1. `ai_usage.cost_usd` — el costo que calculó quien hizo la llamada, con la
 *     tarifa del modelo que realmente usó. Es lo correcto y es lo que escriben
 *     las llamadas nuevas (empezando por la voz de RTARI).
 *  2. `estimateAiCost(tokensIn, tokensOut)` — el estimado histórico con la
 *     tarifa de texto. Sigue aquí para los renglones anteriores a `cost_usd`,
 *     que sólo guardaron tokens.
 *
 * Por qué importa la distinción: un token de audio cuesta del orden de 25
 * veces más que uno de texto. Aplicarle la tarifa de texto a una entrevista de
 * voz reporta una fracción del gasto real.
 */

/** USD por 1,000,000 de tokens de texto (modelo de chat del proyecto). */
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
    (tokensIn / 1_000_000) * AI_RATE_IN_USD_PER_MTOK +
    (tokensOut / 1_000_000) * AI_RATE_OUT_USD_PER_MTOK;
  return { usd, mxn: usd * USD_MXN };
}

export function fmtUsd(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
}

export function fmtMxn(n: number): string {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}

/* ───────────────────────── Voz (API Realtime) ───────────────────────── */

/** Tarifas en USD por 1,000,000 de tokens. */
export interface RealtimeRates {
  audioIn: number;
  /** Audio ya visto que se relee desde la caché de contexto: ~99% más barato. */
  audioCached: number;
  audioOut: number;
  textIn: number;
  textCached: number;
  textOut: number;
}

/**
 * Tarifas publicadas de los modelos de voz.
 *
 * Ojo: OpenAI las ha movido (el modelo grande bajó 20% al salir de preview).
 * Si el costo del panel no cuadra con la factura, es lo primero que hay que
 * revisar contra el tarifario vigente.
 */
export const REALTIME_RATES: Record<string, RealtimeRates> = {
  "gpt-realtime": {
    audioIn: 32,
    audioCached: 0.4,
    audioOut: 64,
    textIn: 4,
    textCached: 0.4,
    textOut: 16,
  },
  "gpt-realtime-mini": {
    audioIn: 10,
    audioCached: 0.3,
    audioOut: 20,
    textIn: 0.6,
    textCached: 0.06,
    textOut: 2.4,
  },
};

/** Si el modelo no está en la tabla se cobra como el grande: nunca subestimar. */
export function realtimeRates(model: string): RealtimeRates {
  return REALTIME_RATES[model] ?? REALTIME_RATES["gpt-realtime"]!;
}

/**
 * Consumo de una sesión de voz, tal como lo reporta la API en sus eventos
 * `response.done` (acumulado a lo largo de la entrevista).
 */
export interface RealtimeUsage {
  audioIn: number;
  audioCached: number;
  audioOut: number;
  textIn: number;
  textCached: number;
  textOut: number;
}

export const EMPTY_REALTIME_USAGE: RealtimeUsage = {
  audioIn: 0,
  audioCached: 0,
  audioOut: 0,
  textIn: 0,
  textCached: 0,
  textOut: 0,
};

export function realtimeCost(model: string, usage: RealtimeUsage): AiCost {
  const r = realtimeRates(model);
  const usd =
    (usage.audioIn / 1_000_000) * r.audioIn +
    (usage.audioCached / 1_000_000) * r.audioCached +
    (usage.audioOut / 1_000_000) * r.audioOut +
    (usage.textIn / 1_000_000) * r.textIn +
    (usage.textCached / 1_000_000) * r.textCached +
    (usage.textOut / 1_000_000) * r.textOut;
  return { usd, mxn: usd * USD_MXN };
}

/** Totales que van a `ai_usage.tokens_in` / `tokens_out`. */
export function realtimeTotals(usage: RealtimeUsage): { tokensIn: number; tokensOut: number } {
  return {
    tokensIn: usage.audioIn + usage.audioCached + usage.textIn + usage.textCached,
    tokensOut: usage.audioOut + usage.textOut,
  };
}
