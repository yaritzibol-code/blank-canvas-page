/** The first reviewed CIAAC module is the only CIAAC content enabled in this preview. */
export const CIAAC_MODULE_ONE_IDS = [
  "ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/aeronave-en-vuelo-1",
  "ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/definicion-de-fluido-2",
  "ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/capa-limite-flujo-laminar-y-turbulento-3",
  "ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/presion-estatica-dinamica-y-total-4",
  "ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/densidad-del-aire-y-factores-que-la-afectan-5",
] as const;

const ready = new Set<string>(CIAAC_MODULE_ONE_IDS);

export function isLearningPathAvailable(id: string): boolean {
  return !id.startsWith("ciaac/") || ready.has(id);
}

export function hasAvailableCiaacContent(id: string): boolean {
  return !id.startsWith("ciaac") || CIAAC_MODULE_ONE_IDS.some((lp) => lp.startsWith(`${id}/`));
}
