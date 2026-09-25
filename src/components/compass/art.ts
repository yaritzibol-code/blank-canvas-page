/**
 * Arte ilustrado de COMPASS. Todo es opcional: sin una entrada, la prueba usa
 * su fondo vectorial y la tarjeta del hub su escena dibujada (ModuleCover).
 */
import type { CompassModuleId } from "@/modules/compass/types";

const NUBES = "/flightdeck/foto-mar-de-nubes.jpg";
const CIELO = "/flightdeck/cielo-vialactea-16x9.jpg";

/**
 * Fondo del escenario de cada prueba, atenuado bajo un velo: mar de nubes en
 * las pruebas de vuelo y cielo nocturno en las de razonamiento.
 */
export const COMPASS_STAGE_ART: Partial<Record<CompassModuleId, string>> = {
  control: NUBES,
  slalom: NUBES,
  orientacion: NUBES,
  multitarea: NUBES,
  memoria: CIELO,
  calculo: CIELO,
  logica: CIELO,
};

/** Portada ilustrada de la tarjeta de cada prueba (reemplaza la escena vectorial). */
export const COMPASS_COVER_ART: Partial<Record<CompassModuleId, string>> = {};
