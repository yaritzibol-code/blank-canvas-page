/**
 * Interruptores temporales de funciones (feature flags).
 *
 * Cambia el valor a `false` y la función vuelve a estar disponible tal cual
 * estaba: nada se borra, sólo se bloquea la entrada desde la interfaz.
 *
 * Las cuentas de administración siguen entrando para poder seguir trabajando
 * dentro del módulo mientras está en mantenimiento.
 */
export const learningPathsMaintenance = true;
export const studyTogetherMaintenance = true;
