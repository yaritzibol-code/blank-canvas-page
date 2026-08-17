/**
 * Fuente única de la próxima aplicación registrada del examen CIAAC.
 *
 * La consumen /ciaac (countdown), /convocatoria-ciaac-2026 y la
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

/* ─── Convocatoria de línea aérea (ASPA · Aeroméxico Connect) ────────── */

/**
 * Estado de la convocatoria de Primer Oficial Embraer 190.
 *
 * La convocatoria publicada por ASPA de México con Aeroméxico Connect fue
 * cancelada, así que el producto deja de venderse como "prepárate para ESTA
 * convocatoria" y pasa a "prepárate para cuando salga la próxima": el temario
 * publicado sigue siendo la mejor guía de estudio disponible y no cambia de un
 * proceso a otro.
 *
 * Cuando se anuncie una convocatoria nueva basta con poner
 * `LA_CONVOCATORIA_ABIERTA = true` y actualizar los textos de abajo: la landing
 * pública y el módulo del dashboard leen su estado de aquí.
 */
export const LA_CONVOCATORIA_ABIERTA = false;

/** Etiqueta corta de estado (distintivos y cintillos). */
export const LA_CONVOCATORIA_ESTADO = LA_CONVOCATORIA_ABIERTA
  ? "Convocatoria activa"
  : "Convocatoria cancelada";

/** Aviso largo, en una línea, para cintillos y avisos de página. */
export const LA_CONVOCATORIA_AVISO = LA_CONVOCATORIA_ABIERTA
  ? "La convocatoria de Primer Oficial Embraer 190 está abierta: revisa requisitos y fechas en los canales oficiales de ASPA de México."
  : "La convocatoria de Primer Oficial Embraer 190 fue cancelada y por ahora no hay proceso abierto. El temario publicado no cambia, así que la preparación sigue siendo válida para cuando se abra la siguiente.";
