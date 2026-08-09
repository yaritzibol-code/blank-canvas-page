/**
 * Fuente única de la próxima aplicación registrada del examen CIAAC.
 *
 * La consumen la portada (countdown), /convocatoria-ciaac-2026 y la
 * calculadora. Al pasar la fecha, las páginas cambian solas a su estado
 * "aplicación pasada" (ver ciaacYaPaso) — aun así, actualiza estas
 * constantes en cuanto se conozca el siguiente periodo para volver al
 * estado "fecha registrada". Protocolo completo en SEO.md.
 */

export const PROXIMO_CIAAC = "2026-08-17T08:00:00-06:00";
export const PROXIMO_CIAAC_TEXTO = "17 de agosto de 2026";
/** "17 ago" para cajas de fecha compactas. */
export const PROXIMO_CIAAC_CORTO = "17 ago";

/**
 * true cuando la aplicación registrada ya quedó atrás (con 12 h de margen:
 * el propio día del examen la página sigue en modo "es hoy"). Se evalúa por
 * render — con SSR, el servidor decide en cada request, así que el sitio
 * nunca muestra una convocatoria caduca aunque nadie edite el código.
 */
export function ciaacYaPaso(ahora: number = Date.now()): boolean {
  return ahora > new Date(PROXIMO_CIAAC).getTime() + 12 * 3600 * 1000;
}
