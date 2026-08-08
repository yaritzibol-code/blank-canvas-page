/**
 * RNG determinista del Pilot Aptitude Trainer.
 *
 * Todos los estímulos (perturbaciones, gates, ítems, alertas) se generan a
 * partir de una seed guardada en la sesión: la misma seed produce exactamente
 * la misma tarea. Eso hace los ejercicios auditables y reproducibles sin
 * necesidad de almacenar los estímulos completos.
 */

/** mulberry32 — rápido, suficiente para estímulos (no criptográfico). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

/** Seed nueva para una sesión (no necesita ser criptográfica). */
export function newSeed(): number {
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}

/** Deriva una sub-seed estable (p. ej. una por eje o por bloque). */
export function deriveSeed(seed: number, salt: number): number {
  return Math.imul(seed ^ (salt + 0x9e3779b9), 0x85ebca6b) >>> 0 || 1;
}

/** Entero uniforme en [min, max] inclusive. */
export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Elemento al azar de un arreglo. */
export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Mezcla Fisher–Yates (copia; no muta el original). */
export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
