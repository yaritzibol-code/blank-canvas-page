/**
 * Motor del módulo Memoria — retención de parámetros de vuelo.
 *
 * Cada bloque muestra 2-4 campos aeronáuticos plausibles, opcionalmente mete
 * un distractor aritmético y pide reproducirlos exactos. Los valores se
 * generan con la seed y evitan patrones fáciles (dígitos repetidos, series).
 */
import { deriveSeed, mulberry32, pick, randInt, shuffle, type Rng } from "./rng";

export type MemoryFieldKind = "HDG" | "FL" | "SPD" | "FREQ";

export interface MemoryField {
  kind: MemoryFieldKind;
  /** Etiqueta con unidad, como se muestra ("HDG 245°"). */
  label: string;
  /** Valor esperado tal como debe teclearse ("245", "118.25"). */
  answer: string;
}

export interface MemoryBlock {
  fields: MemoryField[];
  /** Segundos que el bloque permanece visible. */
  exposureSec: number;
  /** Distractor entre memorizar y responder (null = recall inmediato). */
  distractor: { question: string; answer: number; options: number[] } | null;
}

export interface MemoryLevelParams {
  fields: number;
  exposureSec: number;
  withDistractor: boolean;
}

export const MEMORY_LEVELS: MemoryLevelParams[] = [
  { fields: 2, exposureSec: 6, withDistractor: false },
  { fields: 3, exposureSec: 6, withDistractor: false },
  { fields: 3, exposureSec: 5, withDistractor: true },
  { fields: 4, exposureSec: 5, withDistractor: true },
  { fields: 4, exposureSec: 4, withDistractor: true },
];

export function memoryLevel(level: number): MemoryLevelParams {
  return MEMORY_LEVELS[Math.min(MEMORY_LEVELS.length, Math.max(1, level)) - 1];
}

/** true si el número es demasiado fácil de retener (111, 250, 300…). */
function tooEasy(n: number): boolean {
  const s = String(n);
  if (/^(\d)\1+$/.test(s)) return true; // dígitos repetidos
  if (s.endsWith("00")) return true; // redondos
  return false;
}

function genHeading(rng: Rng): MemoryField {
  let v = randInt(rng, 2, 71) * 5;
  while (tooEasy(v)) v = randInt(rng, 2, 71) * 5;
  const s = String(v).padStart(3, "0");
  return { kind: "HDG", label: `HDG ${s}°`, answer: s };
}

function genFlightLevel(rng: Rng): MemoryField {
  let v = randInt(rng, 13, 82) * 5; // FL065–FL410
  while (tooEasy(v)) v = randInt(rng, 13, 82) * 5;
  const s = String(v).padStart(3, "0");
  return { kind: "FL", label: `FL ${s}`, answer: s };
}

function genSpeed(rng: Rng): MemoryField {
  let v = randInt(rng, 25, 68) * 5; // 125–340 kt
  while (tooEasy(v)) v = randInt(rng, 25, 68) * 5;
  return { kind: "SPD", label: `SPD ${v} kt`, answer: String(v) };
}

function genFreq(rng: Rng): MemoryField {
  const mhz = randInt(rng, 118, 136);
  const dec = pick(rng, ["00", "25", "50", "75", "10", "35", "60", "85"]);
  const s = `${mhz}.${dec}`;
  return { kind: "FREQ", label: `FREQ ${s}`, answer: s };
}

const GENERATORS: Record<MemoryFieldKind, (rng: Rng) => MemoryField> = {
  HDG: genHeading,
  FL: genFlightLevel,
  SPD: genSpeed,
  FREQ: genFreq,
};

/** Orden canónico de lectura (como un scan de cabina). */
const FIELD_ORDER: MemoryFieldKind[] = ["HDG", "FL", "SPD", "FREQ"];

function genDistractor(rng: Rng): NonNullable<MemoryBlock["distractor"]> {
  const a = randInt(rng, 12, 49);
  const b = randInt(rng, 12, 49);
  const answer = a + b;
  const opts = new Set<number>([answer]);
  while (opts.size < 3) opts.add(answer + pick(rng, [-10, -2, -1, 1, 2, 10]));
  return {
    question: `${a} + ${b} =`,
    answer,
    options: shuffle(rng, [...opts]),
  };
}

/** Genera el bloque `index` de la sesión (determinista por seed). */
export function buildMemoryBlock(seed: number, level: number, index: number): MemoryBlock {
  const p = memoryLevel(level);
  const rng = mulberry32(deriveSeed(seed, 300 + index));
  const kinds = shuffle(rng, FIELD_ORDER).slice(0, p.fields);
  // Se muestran en orden de scan para entrenar la agrupación consistente.
  kinds.sort((a, b) => FIELD_ORDER.indexOf(a) - FIELD_ORDER.indexOf(b));
  return {
    fields: kinds.map((k) => GENERATORS[k](rng)),
    exposureSec: p.exposureSec,
    distractor: p.withDistractor ? genDistractor(rng) : null,
  };
}

/** Normaliza una respuesta tecleada para compararla ("118,25" → "118.25"). */
export function normalizeMemoryAnswer(kind: MemoryFieldKind, typed: string): string {
  let s = typed.trim().replace(",", ".");
  if (kind !== "FREQ") {
    s = s.replace(/\D/g, "");
    // El cero a la izquierda es opcional al teclear rumbos/niveles ("45" = "045").
    if (s.length > 0 && s.length < 3) s = s.padStart(3, "0");
  }
  return s;
}
