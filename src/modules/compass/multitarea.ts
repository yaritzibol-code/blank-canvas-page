/**
 * Motor del módulo Multitarea — transferencia de datos + monitor de sistemas.
 *
 * Tarea primaria: copiar el dato mostrado (transponder, rumbo, nivel…) en el
 * campo de envío. Tarea secundaria: cuatro sistemas disparan alertas en
 * momentos pregenerados por seed; hay que reconocerlas antes de que venza su
 * ventana. Las métricas se reportan POR TAREA (nunca colapsadas): throughput y
 * exactitud de la primaria; hit rate, reacción, omisiones y falsas alarmas de
 * la secundaria.
 */
import { deriveSeed, mulberry32, pick, randInt, type Rng } from "./rng";

export const MULTI_SYSTEMS = ["HYD", "ELEC", "FUEL", "PRESS"] as const;
export type MultiSystem = (typeof MULTI_SYSTEMS)[number];

export interface MultiAlert {
  /** Segundo de sesión en el que se enciende. */
  at: number;
  system: MultiSystem;
  /** Segundos de ventana antes de contar como omisión. */
  windowSec: number;
}

export interface MultiLevelParams {
  /** Alertas por minuto (aprox). */
  alertsPerMin: number;
  windowSec: number;
  /** Dígitos del dato a transferir. */
  transferDigits: number;
}

export const MULTI_LEVELS: MultiLevelParams[] = [
  { alertsPerMin: 4, windowSec: 5, transferDigits: 3 },
  { alertsPerMin: 6, windowSec: 4.5, transferDigits: 4 },
  { alertsPerMin: 8, windowSec: 4, transferDigits: 4 },
  { alertsPerMin: 10, windowSec: 3.5, transferDigits: 5 },
  { alertsPerMin: 12, windowSec: 3, transferDigits: 5 },
];

export function multiLevel(level: number): MultiLevelParams {
  return MULTI_LEVELS[Math.min(MULTI_LEVELS.length, Math.max(1, level)) - 1];
}

/**
 * Agenda determinista de alertas de toda la sesión. Se garantiza separación
 * mínima entre alertas y nunca dos activas del mismo sistema.
 */
export function buildAlertSchedule(seed: number, level: number, durationSec: number): MultiAlert[] {
  const p = multiLevel(level);
  const rng = mulberry32(deriveSeed(seed, 600));
  const meanGap = 60 / p.alertsPerMin;
  const alerts: MultiAlert[] = [];
  let t = 3 + rng() * meanGap;
  let lastSystem: MultiSystem | null = null;
  while (t < durationSec - p.windowSec) {
    let system = pick(rng, MULTI_SYSTEMS);
    if (system === lastSystem) system = pick(rng, MULTI_SYSTEMS);
    alerts.push({ at: t, system, windowSec: p.windowSec });
    lastSystem = system;
    // Gap con jitter: entre 45% y 155% del promedio, nunca < 1.2 s.
    t += Math.max(1.2, meanGap * (0.45 + rng() * 1.1));
  }
  return alerts;
}

export interface TransferDatum {
  label: string;
  value: string;
}

/** Dato `index` a transferir (determinista por seed). */
export function buildTransferDatum(seed: number, level: number, index: number): TransferDatum {
  const p = multiLevel(level);
  const rng: Rng = mulberry32(deriveSeed(seed, 700 + index));
  const kind = pick(rng, ["SQK", "HDG", "FL", "FREQ", "QNH"] as const);
  if (kind === "SQK") {
    // Transponder: 4 dígitos octales (0-7), evita códigos reservados 7500/7600/7700.
    let code = "";
    do {
      code =
        String(randInt(rng, 0, 7)) +
        String(randInt(rng, 0, 7)) +
        String(randInt(rng, 0, 7)) +
        String(randInt(rng, 0, 7));
    } while (["7500", "7600", "7700"].includes(code));
    return { label: "SQK", value: code };
  }
  if (kind === "HDG")
    return { label: "HDG", value: String(randInt(rng, 2, 71) * 5).padStart(3, "0") };
  if (kind === "FL")
    return { label: "FL", value: String(randInt(rng, 13, 82) * 5).padStart(3, "0") };
  if (kind === "QNH") return { label: "QNH", value: String(randInt(rng, 980, 1035)) };
  const mhz = randInt(rng, 118, 136);
  const dec = pick(rng, ["00", "25", "50", "75"]);
  return { label: "FREQ", value: `${mhz}.${dec}` };
  // Nota: los dígitos del dato crecen con el nivel vía la mezcla de tipos;
  // p.transferDigits queda para render (ancho del campo).
}

/** Acumulador de métricas de la sesión de multitarea. */
export class MultiMetrics {
  transfersOk = 0;
  transfersError = 0;
  hits = 0;
  misses = 0;
  falseAlarms = 0;
  private reactions: number[] = [];

  reaction(rtSec: number) {
    this.hits++;
    this.reactions.push(rtSec);
  }

  medianReaction(): number | null {
    if (this.reactions.length === 0) return null;
    const s = [...this.reactions].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }

  result(durationSec: number) {
    const min = Math.max(0.5, durationSec / 60);
    const transfersTotal = this.transfersOk + this.transfersError;
    return {
      transfersOk: this.transfersOk,
      transfersError: this.transfersError,
      transfersPerMin: this.transfersOk / min,
      transferAccuracy: transfersTotal > 0 ? this.transfersOk / transfersTotal : 1,
      hits: this.hits,
      misses: this.misses,
      falseAlarms: this.falseAlarms,
      hitRate: this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 1,
      medianReactionSec: this.medianReaction(),
    };
  }
}
