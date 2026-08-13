/**
 * Constantes ligeras del seed, separadas de los datos.
 *
 * `seed.ts` arrastra ~2 MB de banco de preguntas; estas constantes las
 * necesitan la UI (botones de cuentas demo) y la sincronización, así que
 * viven aquí para que importarlas no meta los datos al chunk de entrada.
 * El seed completo se carga con import() dinámico (ver hooks.ts).
 */

export const SEED_VERSION = 8;

export const DEMO_STUDENT_ID = "usr_maria";
export const DEMO_ADMIN_ID = "usr_admin";
export const DEMO_BASIC_ID = "usr_carlos";
export const DEMO_PASSWORD = "flightpath2026";

/**
 * true si este navegador ya tiene el banco sembrado en la versión vigente.
 * Solo lee el marcador de localStorage: no descarga ni ejecuta nada.
 */
export function isSeededLocally(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("fp_db_seed_version");
    return raw !== null && Number(JSON.parse(raw)) >= SEED_VERSION;
  } catch {
    return false;
  }
}

/**
 * Carga los datos del seed bajo demanda y siembra si hace falta.
 *
 * El chequeo de versión se hace ANTES del import(): un navegador ya sembrado
 * (la inmensa mayoría de las visitas) no descarga el chunk de datos jamás.
 * Lee la misma llave versionada que usa `ensureSeeded` (prefijo de db.ts).
 */
export async function ensureSeededAsync(): Promise<void> {
  if (typeof window === "undefined") return;
  if (isSeededLocally()) return;
  const m = await import("./seed");
  m.ensureSeeded();
}
