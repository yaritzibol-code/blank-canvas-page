/**
 * Motor del módulo Control — seguimiento compensatorio de dos ejes.
 *
 * Modelo clásico de primer orden: el error de cada eje se mueve con una
 * velocidad = perturbación(t) + ráfagas + corrección del usuario (rate
 * control, como un stick). La perturbación es una suma de senos con fases y
 * frecuencias derivadas de la seed — imposible de memorizar, idéntica al
 * repetir la misma seed.
 *
 * La simulación corre con paso fijo (ver use-game-loop): estas funciones son
 * puras respecto al tiempo simulado, por lo que el resultado no depende del
 * refresh del monitor.
 */
import { deriveSeed, mulberry32 } from "./rng";

export interface ControlLevelParams {
  /** Amplitud total de la perturbación (unidades de error/seg). */
  amplitude: number;
  /** Ráfagas: impulso extra cada burstEverySec aprox. */
  burstEverySec: number;
  burstStrength: number;
  /** Tasa máxima de corrección del usuario (unidades/seg). */
  userRate: number;
}

/** Nivel 1-5. El examen usa el nivel 3. */
export const CONTROL_LEVELS: ControlLevelParams[] = [
  { amplitude: 0.22, burstEverySec: 14, burstStrength: 0.5, userRate: 1.1 },
  { amplitude: 0.3, burstEverySec: 12, burstStrength: 0.65, userRate: 1.1 },
  { amplitude: 0.38, burstEverySec: 10, burstStrength: 0.8, userRate: 1.05 },
  { amplitude: 0.47, burstEverySec: 8.5, burstStrength: 0.95, userRate: 1.0 },
  { amplitude: 0.56, burstEverySec: 7, burstStrength: 1.1, userRate: 0.95 },
];

export function controlLevel(level: number): ControlLevelParams {
  return CONTROL_LEVELS[Math.min(CONTROL_LEVELS.length, Math.max(1, level)) - 1];
}

interface SineComponent {
  amp: number;
  freq: number; // Hz
  phase: number;
}

export interface AxisPerturbation {
  sines: SineComponent[];
  /** Momentos (seg) e impulsos de las ráfagas, pregenerados. */
  bursts: { at: number; vel: number }[];
}

/** Banda considerada "centrado" (fracción del medio recorrido). */
export const CONTROL_BAND = 0.15;

/**
 * Genera la perturbación determinista de un eje para toda la sesión.
 * `axis` diferencia X de Y para que no se muevan en espejo.
 */
export function buildAxisPerturbation(
  seed: number,
  axis: 0 | 1,
  level: number,
  durationSec: number,
): AxisPerturbation {
  const p = controlLevel(level);
  const rng = mulberry32(deriveSeed(seed, 100 + axis));
  const sines: SineComponent[] = [];
  // 4 componentes lentas-medias: la dificultad viene de la mezcla, no de picos.
  const freqs = [0.05 + rng() * 0.05, 0.11 + rng() * 0.07, 0.2 + rng() * 0.09, 0.31 + rng() * 0.11];
  const weights = [0.4, 0.28, 0.2, 0.12];
  freqs.forEach((f, i) => {
    sines.push({ amp: p.amplitude * weights[i], freq: f, phase: rng() * Math.PI * 2 });
  });
  const bursts: { at: number; vel: number }[] = [];
  let t = 4 + rng() * p.burstEverySec;
  while (t < durationSec - 3) {
    const sign = rng() < 0.5 ? -1 : 1;
    bursts.push({ at: t, vel: sign * p.burstStrength * (0.75 + rng() * 0.5) });
    t += p.burstEverySec * (0.7 + rng() * 0.6);
  }
  return { sines, bursts };
}

/** Velocidad de deriva del eje en el instante t (sin contar ráfagas). */
export function perturbVelocity(pert: AxisPerturbation, t: number): number {
  let v = 0;
  for (const s of pert.sines) v += s.amp * Math.sin(2 * Math.PI * s.freq * t + s.phase);
  return v;
}

/**
 * Impulso de ráfaga acumulado en la ventana (t0, t1]. Se aplica como cambio
 * instantáneo de velocidad para que el paso fijo no se salte ninguna.
 */
export function burstImpulse(pert: AxisPerturbation, t0: number, t1: number): number {
  let v = 0;
  for (const b of pert.bursts) if (b.at > t0 && b.at <= t1) v += b.vel;
  return v;
}

/** Acumulador de métricas de un eje (se alimenta cada paso de simulación). */
export class AxisMetrics {
  private sumSq = 0;
  private inBand = 0;
  private samples = 0;
  private saturations = 0;
  private saturated = false;
  /** Recuperaciones tras ráfaga: instante de ráfaga → seg hasta volver a banda. */
  private pendingBurstAt: number | null = null;
  private recoveries: number[] = [];

  step(t: number, error: number, dt: number, burstNow: boolean) {
    const abs = Math.abs(error);
    this.sumSq += error * error * dt;
    if (abs <= CONTROL_BAND) this.inBand += dt;
    this.samples += dt;
    // Saturación: tocar el tope del indicador cuenta una sola vez por excursión.
    if (abs >= 0.995) {
      if (!this.saturated) this.saturations++;
      this.saturated = true;
    } else if (abs < 0.9) {
      this.saturated = false;
    }
    if (burstNow) this.pendingBurstAt = t;
    if (this.pendingBurstAt !== null && abs <= CONTROL_BAND && t > this.pendingBurstAt) {
      this.recoveries.push(t - this.pendingBurstAt);
      this.pendingBurstAt = null;
    }
  }

  result() {
    const rms = this.samples > 0 ? Math.sqrt(this.sumSq / this.samples) : 0;
    const inBandPct = this.samples > 0 ? this.inBand / this.samples : 0;
    const meanRecovery =
      this.recoveries.length > 0
        ? this.recoveries.reduce((a, b) => a + b, 0) / this.recoveries.length
        : null;
    return { rms, inBandPct, saturations: this.saturations, meanRecovery };
  }
}
