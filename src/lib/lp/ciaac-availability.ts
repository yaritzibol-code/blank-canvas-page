import { CIAAC_REVIEWED_AIRCRAFT_ENGINES_IDS } from "./ciaac-aircraft-engines-ids";
import { APPROVED_AIRCRAFT_READY_IDS } from "./ciaac-aircraft-approved/content";
import { APPROVED_TRANSIT_READY_IDS } from "./ciaac-transit-approved/content";
import { CIAAC_REVIEWED_AERODYNAMICS_IDS } from "./ciaac-aerodynamics-ids";
/** Original reviewed introductory module; keep its stable IDs for migrations. */
export const CIAAC_MODULE_ONE_IDS = [
  "ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/aeronave-en-vuelo-1",
  "ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/definicion-de-fluido-2",
  "ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/capa-limite-flujo-laminar-y-turbulento-3",
  "ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/presion-estatica-dinamica-y-total-4",
  "ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/densidad-del-aire-y-factores-que-la-afectan-5",
] as const;

export const CIAAC_AVAILABLE_IDS = [
  ...CIAAC_MODULE_ONE_IDS,
  ...CIAAC_REVIEWED_AERODYNAMICS_IDS,
  ...CIAAC_REVIEWED_AIRCRAFT_ENGINES_IDS,
  ...APPROVED_AIRCRAFT_READY_IDS,
  ...APPROVED_TRANSIT_READY_IDS,
];
const ready = new Set<string>(CIAAC_AVAILABLE_IDS);

export function isLearningPathAvailable(id: string): boolean {
  return !id.startsWith("ciaac/") || ready.has(id);
}

export function hasAvailableCiaacContent(id: string): boolean {
  return !id.startsWith("ciaac") || CIAAC_AVAILABLE_IDS.some((lp) => lp.startsWith(`${id}/`));
}
