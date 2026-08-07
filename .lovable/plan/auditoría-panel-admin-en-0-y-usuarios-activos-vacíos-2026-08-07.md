# Auditoría: panel admin en 0 y usuarios activos vacíos

Los tres problemas tienen dos causas confirmadas. Los datos sí existen en la base (23 perfiles, 4 suscripciones activas **live**: 1 anual + 3 mensuales, 62 sesiones de actividad, 161 llamadas de IA). Lo que falla es cómo se leen.

## Causa 1 — Las funciones de métricas se auto-bloquean (afecta Resumen y Panel de control)

Todas las funciones de base (`admin_resumen`, `admin_platform_stats`, `admin_mrr`, `admin_mrr_daily`, `admin_ai_stats`, `admin_pro_stats`, etc.) terminan con un candado interno del tipo `CASE WHEN is_admin() THEN … ELSE NULL END`, y `is_admin()` depende del usuario firmado.

El servidor las llama con la llave de servicio (sin usuario firmado), así que `is_admin()` siempre da falso: la función devuelve nulo o cero filas y la pantalla pinta 0 en todo. No es que no haya datos; es que la consulta se niega a devolverlos.

**Arreglo:** quitar el candado interno de esas funciones y cerrarlas por permisos (solo la llave de servicio puede ejecutarlas). La validación de rol admin ya ocurre antes, en el servidor de la app, que sí verifica al usuario firmado. Resultado: mismas garantías de seguridad, datos reales en pantalla.

Con esto el MRR deja de ser 0 y pasa a reflejar los cobros reales (3 mensuales + 1 anual prorrateado).

## Causa 2 — Usuarios activos escucha un canal duplicado

Cada pestaña publica su presencia desde el arranque de la app. La pantalla "Usuarios activos" abre **otro** canal con el mismo nombre (`fp:presencia`) sobre la misma conexión, algo que la nube no admite: la segunda suscripción no recibe el estado y la lista queda vacía, aunque el indicador diga "Escuchando".

**Arreglo:** un único canal compartido para toda la app. La pantalla admin se engancha a ese mismo canal y lee la lista en vivo (sync/join/leave), en lugar de crear uno propio. Se agrega también un indicador honesto de estado de conexión y un refresco de respaldo por si el canal se cae.

## Verificación antes de dar por cerrado

- Consultar las funciones ya corregidas y comparar contra los conteos reales de la base.
- Abrir el panel con sesión admin en el navegador y confirmar que Resumen, Operaciones (live) y Usuarios activos muestran cifras y personas reales.
- Confirmar que un usuario no admin sigue sin poder leer nada de esas funciones.

## Detalle técnico

- Migración: `CREATE OR REPLACE` de las funciones admin sin el gate `is_admin()`, más `REVOKE EXECUTE … FROM anon, authenticated` y `GRANT EXECUTE … TO service_role`.
- `src/lib/admin.functions.ts`: sin cambios de contrato; se mantiene `assertAdmin()` con el cliente del usuario. Se agrega propagación del `error` real de cada RPC para que la UI no confunda "falló" con "cero".
- `src/lib/presence.ts`: canal singleton (`getCanalPresencia()`) con suscriptores múltiples y `presenceState()` compartido.
- `src/hooks/use-presence.ts` y `src/routes/admin/usuarios-activos.tsx`: consumen el singleton en vez de `crearCanalPresencia`.
- `src/routes/admin/index.tsx`: mostrar aviso cuando `adminResumen` devuelva error, en vez de caer silenciosamente al store local (que siempre da 0).
