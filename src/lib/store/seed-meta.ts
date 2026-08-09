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
 * Carga los datos del seed bajo demanda y siembra si hace falta.
 *
 * El chequeo de versión se hace ANTES del import(): un navegador ya sembrado
 * (la inmensa mayoría de las visitas) no descarga el chunk de datos jamás.
 * Lee la misma llave versionada que usa `ensureSeeded` (prefijo de db.ts).
 */
export async function ensureSeededAsync(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("fp_db_seed_version");
    if (raw !== null && Number(JSON.parse(raw)) >= SEED_VERSION) return;
  } catch {
    /* localStorage bloqueado o valor corrupto: el seed decide */
  }
  const m = await import("./seed");
  m.ensureSeeded();
}
