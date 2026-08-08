/**
 * Motor del módulo Slalom — pursuit tracking a través de puertas.
 *
 * El mundo es un corredor vertical que avanza a velocidad constante por nivel;
 * las puertas se generan con un paseo aleatorio acotado (seed) y su ancho se
 * reduce con el nivel. El avión responde con inercia: el input comanda
 * aceleración lateral, no posición — la métrica captura anticipación, no
 * reflejos de cursor.
 *
 * Unidades lógicas: x ∈ [-1, 1] es el ancho del corredor; y avanza en
 * "unidades de pista" (1 unidad ≈ separación entre puertas).
 */
import { deriveSeed, mulberry32 } from "./rng";

export interface SlalomLevelParams {
  /** Unidades de pista por segundo (velocidad de aproximación). */
  speed: number;
  /** Medio-ancho de la puerta (en x lógico). */
  gateHalfWidth: number;
  /** Desplazamiento máximo entre centros de puertas consecutivas. */
  maxShift: number;
  /** Aceleración lateral comandada a input pleno (x/seg²). */
  accel: number;
  /** Amortiguación de la velocidad lateral (1/seg). */
  damping: number;
}

export const SLALOM_LEVELS: SlalomLevelParams[] = [
  { speed: 0.42, gateHalfWidth: 0.2, maxShift: 0.5, accel: 2.6, damping: 1.9 },
  { speed: 0.5, gateHalfWidth: 0.175, maxShift: 0.62, accel: 2.6, damping: 1.9 },
  { speed: 0.58, gateHalfWidth: 0.15, maxShift: 0.74, accel: 2.6, damping: 1.85 },
  { speed: 0.66, gateHalfWidth: 0.13, maxShift: 0.86, accel: 2.6, damping: 1.8 },
  { speed: 0.75, gateHalfWidth: 0.115, maxShift: 1.0, accel: 2.6, damping: 1.75 },
];

export function slalomLevel(level: number): SlalomLevelParams {
  return SLALOM_LEVELS[Math.min(SLALOM_LEVELS.length, Math.max(1, level)) - 1];
}

export interface SlalomGate {
  /** Posición y (unidades de pista) a la que está la puerta. */
  y: number;
  /** Centro en x lógico [-1, 1]. */
  center: number;
}

/** Medio-ancho visual/físico del avión en x lógico. */
export const PLANE_HALF_WIDTH = 0.045;

/** Genera todas las puertas de la sesión (más margen) de forma determinista. */
export function buildGates(seed: number, level: number, durationSec: number): SlalomGate[] {
  const p = slalomLevel(level);
  const rng = mulberry32(deriveSeed(seed, 200));
  const count = Math.ceil(durationSec * p.speed) + 4;
  const gates: SlalomGate[] = [];
  let center = 0;
  for (let i = 0; i < count; i++) {
    // Paseo acotado: el centro siguiente se aleja como máximo maxShift y
    // nunca deja la puerta pegada al muro.
    const room = 1 - p.gateHalfWidth - 0.06;
    const shift = (rng() * 2 - 1) * p.maxShift;
    center = Math.max(-room, Math.min(room, center + shift));
    gates.push({ y: (i + 1) * 1, center });
  }
  return gates;
}

/** Resultado del cruce de una puerta. */
export type GateOutcome = "clean" | "touch" | "miss";

export function gateOutcome(planeX: number, gate: SlalomGate, level: number): GateOutcome {
  const p = slalomLevel(level);
  const off = Math.abs(planeX - gate.center);
  if (off + PLANE_HALF_WIDTH <= p.gateHalfWidth) return "clean";
  // "touch": el fuselaje clipa el poste pero el centro sigue dentro del vano.
  if (off <= p.gateHalfWidth) return "touch";
  return "miss";
}

/** Acumulador de métricas del slalom. */
export class SlalomMetrics {
  gatesTotal = 0;
  gatesClean = 0;
  gatesTouch = 0;
  /** Desviación |x-centro| normalizada al medio-ancho, por puerta cruzada. */
  private devs: number[] = [];
  /** Cambios de signo de la velocidad lateral (oscilación). */
  reversals = 0;
  private lastVelSign = 0;

  crossGate(planeX: number, gate: SlalomGate, level: number): GateOutcome {
    const p = slalomLevel(level);
    const out = gateOutcome(planeX, gate, level);
    this.gatesTotal++;
    if (out === "clean") this.gatesClean++;
    if (out === "touch") this.gatesTouch++;
    this.devs.push(Math.min(2, Math.abs(planeX - gate.center) / p.gateHalfWidth));
    return out;
  }

  stepVelocity(vel: number) {
    const sign = vel > 0.02 ? 1 : vel < -0.02 ? -1 : 0;
    if (sign !== 0 && this.lastVelSign !== 0 && sign !== this.lastVelSign) this.reversals++;
    if (sign !== 0) this.lastVelSign = sign;
  }

  result() {
    const meanDev =
      this.devs.length > 0 ? this.devs.reduce((a, b) => a + b, 0) / this.devs.length : 0;
    return {
      gatesTotal: this.gatesTotal,
      gatesClean: this.gatesClean,
      gatesTouch: this.gatesTouch,
      gatesMiss: this.gatesTotal - this.gatesClean - this.gatesTouch,
      meanDev,
      reversalsPerGate: this.gatesTotal > 0 ? this.reversals / this.gatesTotal : 0,
    };
  }
}
