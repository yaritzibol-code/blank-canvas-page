/**
 * Motor del módulo Control — seguimiento compensatorio de dos ejes (v2).
 *
 * El error de cada eje deriva con una perturbación suma-de-senos + ráfagas
 * (todo por seed). La corrección del usuario ya NO es tasa directa: comanda la
 * aceleración de una tasa propia del mando (dinámica de primer orden con
 * inercia), de modo que soltar tarde produce sobrecorrección real. En niveles
 * altos se suma acoplamiento cruzado: parte de la corrección de un eje se
 * filtra al otro, como el alabeo induce guiñada.
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
  /** Aceleración de la tasa de corrección a deflexión plena (u/seg²). */
  authority: number;
  /**
   * Amortiguación de la tasa de corrección (1/seg). Baja = el mando "sigue
   * empujando" al soltar (más inercia); alta = respuesta casi directa.
   */
  damping: number;
  /** Fracción de la corrección de un eje que contamina al otro (0-1). */
  crossCoupling: number;
  /** Medio-ancho de la banda "centrado" para este nivel. */
  band: number;
}

/** Nivel 1-5. El examen usa el nivel 3. */
export const CONTROL_LEVELS: ControlLevelParams[] = [
  {
    amplitude: 0.3,
    burstEverySec: 10,
    burstStrength: 0.7,
    authority: 2.2,
    damping: 6.0,
    crossCoupling: 0,
    band: 0.16,
  },
  {
    amplitude: 0.42,
    burstEverySec: 8,
    burstStrength: 0.9,
    authority: 2.4,
    damping: 3.6,
    crossCoupling: 0,
    band: 0.145,
  },
  {
    amplitude: 0.55,
    burstEverySec: 6.5,
    burstStrength: 1.1,
    authority: 2.6,
    damping: 2.6,
    crossCoupling: 0.1,
    band: 0.13,
  },
  {
    amplitude: 0.68,
    burstEverySec: 5.5,
    burstStrength: 1.3,
    authority: 2.8,
    damping: 2.0,
    crossCoupling: 0.18,
    band: 0.115,
  },
  {
    amplitude: 0.82,
    burstEverySec: 4.5,
    burstStrength: 1.5,
    authority: 3.0,
    damping: 1.6,
    crossCoupling: 0.26,
    band: 0.1,
  },
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
  // 4 componentes lentas-medias + 1 rápida pequeña: la dificultad viene de la
  // mezcla (imposible de predecir), no de un pico aislado.
  const freqs = [
    0.05 + rng() * 0.05,
    0.11 + rng() * 0.07,
    0.2 + rng() * 0.09,
    0.31 + rng() * 0.11,
    0.5 + rng() * 0.25,
  ];
  const weights = [0.36, 0.26, 0.18, 0.12, 0.08];
  freqs.forEach((f, i) => {
    sines.push({ amp: p.amplitude * weights[i], freq: f, phase: rng() * Math.PI * 2 });
  });
  const bursts: { at: number; vel: number }[] = [];
  let t = 3 + rng() * p.burstEverySec;
  while (t < durationSec - 3) {
    const sign = rng() < 0.5 ? -1 : 1;
    bursts.push({ at: t, vel: sign * p.burstStrength * (0.75 + rng() * 0.5) });
    t += p.burstEverySec * (0.6 + rng() * 0.8);
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

/**
 * Estado de la dinámica de control de un eje (v2).
 *
 * `uVel` es la tasa de corrección efectiva del mando: persigue a la deflexión
 * comandada con inercia. Estado estacionario = u * authority / damping.
 */
export interface ControlAxisState {
  pos: number;
  burstVel: number;
  uVel: number;
}

export function newAxisState(): ControlAxisState {
  return { pos: 0, burstVel: 0, uVel: 0 };
}

/**
 * Avanza un paso la dinámica de un eje. `uOwn` es la deflexión comandada del
 * eje; `uVelOther` la tasa efectiva del eje contrario (para el acoplamiento).
 * Devuelve true si hubo ráfaga en esta ventana (para métricas de recovery).
 */
export function stepAxis(
  s: ControlAxisState,
  pert: AxisPerturbation,
  p: ControlLevelParams,
  uOwn: number,
  uVelOther: number,
  t: number,
  dt: number,
): boolean {
  const imp = burstImpulse(pert, t - dt, t);
  if (imp !== 0) s.burstVel += imp;
  s.burstVel *= Math.exp(-dt / 0.9);

  // Mando con inercia: la tasa persigue a la deflexión comandada.
  s.uVel += (uOwn * p.authority - s.uVel * p.damping) * dt;

  const correction = s.uVel + p.crossCoupling * uVelOther;
  s.pos += (perturbVelocity(pert, t) + s.burstVel - correction) * dt;
  s.pos = Math.max(-1, Math.min(1, s.pos));
  return imp !== 0;
}

/** Acumulador de métricas de un eje (se alimenta cada paso de simulación). */
export class AxisMetrics {
  /** Medio-ancho de la banda "centrado" usada para esta sesión. */
  constructor(private band: number) {}

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
    if (abs <= this.band) this.inBand += dt;
    this.samples += dt;
    // Saturación: tocar el tope del indicador cuenta una sola vez por excursión.
    if (abs >= 0.995) {
      if (!this.saturated) this.saturations++;
      this.saturated = true;
    } else if (abs < 0.9) {
      this.saturated = false;
    }
    if (burstNow) this.pendingBurstAt = t;
    if (this.pendingBurstAt !== null && abs <= this.band && t > this.pendingBurstAt) {
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
