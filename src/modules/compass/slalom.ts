/**
 * Motor del módulo Slalom — pursuit tracking a través de puertas (v2).
 *
 * El corredor avanza cada vez más rápido (rampa determinista dentro de la
 * sesión), las puertas llegan con separación variable y cada cierto tramo
 * aparece una chicane: tres puertas cerradas y alternadas que exigen
 * anticipación real. Un viento cruzado lento (seed) empuja el avión incluso en
 * recta. El avión responde con inercia: el input comanda aceleración lateral.
 *
 * Unidades lógicas: x ∈ [-1, 1] es el ancho del corredor; y avanza en
 * "unidades de pista" (1 unidad ≈ separación media entre puertas).
 */
import { deriveSeed, mulberry32 } from "./rng";

export interface SlalomLevelParams {
  /** Unidades de pista por segundo al inicio de la sesión. */
  speed: number;
  /** Medio-ancho base de la puerta (en x lógico). */
  gateHalfWidth: number;
  /** Desplazamiento máximo entre centros de puertas consecutivas. */
  maxShift: number;
  /** Aceleración lateral comandada a input pleno (x/seg²). */
  accel: number;
  /** Amortiguación de la velocidad lateral (1/seg). */
  damping: number;
  /** Velocidad lateral máxima del viento cruzado (x/seg). */
  windAmp: number;
  /** Una chicane aproximadamente cada N puertas (0 = sin chicanes). */
  chicaneEvery: number;
}

export const SLALOM_LEVELS: SlalomLevelParams[] = [
  {
    speed: 0.55,
    gateHalfWidth: 0.165,
    maxShift: 0.62,
    accel: 2.8,
    damping: 1.85,
    windAmp: 0.05,
    chicaneEvery: 0,
  },
  {
    speed: 0.65,
    gateHalfWidth: 0.145,
    maxShift: 0.75,
    accel: 2.8,
    damping: 1.8,
    windAmp: 0.09,
    chicaneEvery: 10,
  },
  {
    speed: 0.78,
    gateHalfWidth: 0.125,
    maxShift: 0.88,
    accel: 2.9,
    damping: 1.75,
    windAmp: 0.13,
    chicaneEvery: 8,
  },
  {
    speed: 0.92,
    gateHalfWidth: 0.108,
    maxShift: 1.0,
    accel: 3.0,
    damping: 1.7,
    windAmp: 0.17,
    chicaneEvery: 7,
  },
  {
    speed: 1.08,
    gateHalfWidth: 0.095,
    maxShift: 1.15,
    accel: 3.1,
    damping: 1.65,
    windAmp: 0.22,
    chicaneEvery: 6,
  },
];

export function slalomLevel(level: number): SlalomLevelParams {
  return SLALOM_LEVELS[Math.min(SLALOM_LEVELS.length, Math.max(1, level)) - 1];
}

/** La velocidad sube ~18% de inicio a fin de sesión (rampa determinista). */
export const SLALOM_SPEED_RAMP = 0.18;

export function slalomSpeedAt(level: number, t: number, durationSec: number): number {
  const p = slalomLevel(level);
  const frac = durationSec > 0 ? Math.min(1, t / durationSec) : 0;
  return p.speed * (1 + SLALOM_SPEED_RAMP * frac);
}

export interface SlalomGate {
  /** Posición y (unidades de pista) a la que está la puerta. */
  y: number;
  /** Centro en x lógico [-1, 1]. */
  center: number;
  /** Medio-ancho propio (las chicanes vienen más cerradas). */
  halfWidth: number;
  /** true si pertenece a una chicane (para pintarla distinta). */
  chicane: boolean;
}

/** Medio-ancho visual/físico del avión en x lógico. */
export const PLANE_HALF_WIDTH = 0.045;

/** Genera todas las puertas de la sesión (más margen) de forma determinista. */
export function buildGates(seed: number, level: number, durationSec: number): SlalomGate[] {
  const p = slalomLevel(level);
  const rng = mulberry32(deriveSeed(seed, 200));
  // Sobregenera contando la rampa de velocidad y los gaps cortos.
  const count = Math.ceil(durationSec * p.speed * (1 + SLALOM_SPEED_RAMP) * 1.4) + 6;
  const gates: SlalomGate[] = [];
  let center = 0;
  let y = 1;
  let sinceChicane = 0;
  let i = 0;
  while (i < count) {
    const room = 1 - p.gateHalfWidth - 0.06;
    const startChicane =
      p.chicaneEvery > 0 && sinceChicane >= p.chicaneEvery - 1 + Math.floor(rng() * 3);
    if (startChicane && i + 3 < count) {
      // Chicane: 3 puertas cerradas, gaps cortos y centros alternados amplios.
      const dir = rng() < 0.5 ? -1 : 1;
      const swing = p.maxShift * (0.75 + rng() * 0.25);
      for (let k = 0; k < 3; k++) {
        const sign = k % 2 === 0 ? dir : -dir;
        center = Math.max(-room, Math.min(room, center + sign * swing));
        gates.push({ y, center, halfWidth: p.gateHalfWidth * 0.9, chicane: true });
        y += 0.62 + rng() * 0.1;
        i++;
      }
      sinceChicane = 0;
      continue;
    }
    // Paseo acotado normal con separación variable.
    const shift = (rng() * 2 - 1) * p.maxShift;
    center = Math.max(-room, Math.min(room, center + shift));
    gates.push({ y, center, halfWidth: p.gateHalfWidth, chicane: false });
    y += 0.78 + rng() * 0.57;
    sinceChicane++;
    i++;
  }
  return gates;
}

/**
 * Viento cruzado determinista: velocidad lateral que cambia lentamente.
 * Dos senos lentos con fases por seed; amplitud según nivel.
 */
export interface CrosswindProfile {
  a1: number;
  f1: number;
  p1: number;
  a2: number;
  f2: number;
  p2: number;
}

export function buildCrosswind(seed: number, level: number): CrosswindProfile {
  const p = slalomLevel(level);
  const rng = mulberry32(deriveSeed(seed, 210));
  return {
    a1: p.windAmp * 0.65,
    f1: 0.03 + rng() * 0.03,
    p1: rng() * Math.PI * 2,
    a2: p.windAmp * 0.35,
    f2: 0.07 + rng() * 0.05,
    p2: rng() * Math.PI * 2,
  };
}

/** Velocidad lateral del viento en el instante t (x lógico/seg). */
export function crosswindAt(w: CrosswindProfile, t: number): number {
  return (
    w.a1 * Math.sin(2 * Math.PI * w.f1 * t + w.p1) + w.a2 * Math.sin(2 * Math.PI * w.f2 * t + w.p2)
  );
}

/** Resultado del cruce de una puerta. */
export type GateOutcome = "clean" | "touch" | "miss";

export function gateOutcome(planeX: number, gate: SlalomGate): GateOutcome {
  const off = Math.abs(planeX - gate.center);
  if (off + PLANE_HALF_WIDTH <= gate.halfWidth) return "clean";
  // "touch": el fuselaje clipa el poste pero el centro sigue dentro del vano.
  if (off <= gate.halfWidth) return "touch";
  return "miss";
}

/** Acumulador de métricas del slalom. */
export class SlalomMetrics {
  gatesTotal = 0;
  gatesClean = 0;
  gatesTouch = 0;
  /** Choques contra los muros del corredor. */
  wallHits = 0;
  /** Desviación |x-centro| normalizada al medio-ancho, por puerta cruzada. */
  private devs: number[] = [];
  /** Cambios de signo de la velocidad lateral (oscilación). */
  reversals = 0;
  private lastVelSign = 0;

  crossGate(planeX: number, gate: SlalomGate): GateOutcome {
    const out = gateOutcome(planeX, gate);
    this.gatesTotal++;
    if (out === "clean") this.gatesClean++;
    if (out === "touch") this.gatesTouch++;
    this.devs.push(Math.min(2, Math.abs(planeX - gate.center) / gate.halfWidth));
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
      wallHits: this.wallHits,
      meanDev,
      reversalsPerGate: this.gatesTotal > 0 ? this.reversals / this.gatesTotal : 0,
    };
  }
}
