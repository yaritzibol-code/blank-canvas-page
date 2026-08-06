# Activity Ratio — tracker de comportamiento y bounce rate

Nueva pantalla en el panel admin (`Operaciones → Activity Ratio`) que responde: cuánta gente rebota, qué pantallas ven, dónde se quedan atoradas, quién completa el onboarding y quién no, y en qué punto exacto se sale cada persona.

## Qué se va a medir

Cada sesión de navegación (autenticada o anónima) registra:

- **Vistas de pantalla**: ruta, título legible, hora de entrada y tiempo real en pantalla (se descuenta el tiempo con la pestaña en segundo plano).
- **Salida de sesión**: última pantalla vista antes de irse, y si la sesión fue "rebote" (una sola pantalla y menos de ~15 segundos de interacción).
- **Onboarding / perfil**: paso alcanzado (nombre, teléfono, escuela, género, tono de Yaris, avatar), si se completó o se abandonó, y en qué paso quedó.
- **Acciones clave**: abrir cuestionario/simulador y no terminarlo, abrir el modal de pago y salirse, abrir Yaris, etc.
- **Contexto**: dispositivo (móvil/tablet/escritorio), origen de entrada (referrer/utm) y plan del usuario.

Todo se manda en segundo plano y nunca bloquea la app; si falla, la app sigue igual.

## La pantalla "Activity Ratio"

Selector de rango (24 h / 7 días / 30 días) y:

1. **Tarjetas superiores**: sesiones, usuarios únicos, bounce rate, duración promedio de sesión, pantallas por sesión, % de onboarding completado.
2. **Bounce rate por pantalla de entrada**: tabla ordenada por peor rebote, con sesiones y tiempo promedio.
3. **Pantallas más vistas y pantallas de salida**: dónde se va la gente (exit rate por pantalla).
4. **Embudo de onboarding/perfil**: cuántos llegan a cada paso y dónde se cae la mayoría.
5. **Abandonos**: sesiones que abrieron cuestionario/simulador/pago sin terminar.
6. **Detalle por usuario**: lista con última actividad, sesiones, tiempo total, si terminó onboarding y su última pantalla; al abrir un usuario, su línea de tiempo de pantallas y eventos.

Todo con la misma estética oscura tipo cabina del resto del admin y adaptado a móvil.

## Detalles técnicos

- **Base de datos** (migración nueva):
  - `activity_sessions`: id, user_id (nullable), session_key, started_at, last_seen_at, ended_at, entry_path, exit_path, screen_count, engaged_ms, is_bounce, device, referrer, utm, plan.
  - `activity_events`: id, session_id, user_id, type (`view` | `view_end` | `milestone` | `abandon`), path, label, step, duration_ms, metadata jsonb, created_at.
  - Índices por `created_at`, `user_id`, `session_id`. RLS activa: el usuario solo escribe/lee lo suyo; admin lee todo vía `is_admin()`. GRANTs explícitos para `authenticated` y `service_role`.
  - RPCs `security definer` para el panel: `admin_activity_overview(days)`, `admin_activity_by_screen(days)`, `admin_activity_funnel(days)`, `admin_activity_users(days, limit)`, `admin_activity_user_timeline(user_id, limit)` — todas verifican `is_admin()`.
- **Cliente**: `src/lib/activity-tracker.ts` con hook montado una sola vez en `src/routes/__root.tsx`. Escucha cambios de ruta del router, `visibilitychange` y `pagehide`, agrupa eventos y los envía por lotes con `navigator.sendBeacon`/server fn (`src/lib/activity.functions.ts`). Los usuarios anónimos usan una clave de sesión en `sessionStorage`.
- **Hitos de onboarding**: se instrumentan los pasos existentes en `dashboard/index.tsx` y `dashboard/perfil.tsx` con una llamada de una línea, sin cambiar su lógica.
- **Pantalla**: `src/routes/admin/activity-ratio.tsx` + entrada "Activity Ratio" en el grupo Operaciones de `AdminShell.tsx`. Gráficas SVG propias, como el resto del admin.
- **Sitemap**: `src/routes/sitemap[.]xml.ts` se actualiza para reflejar las rutas públicas reales (se agregan `/gracias`, `/login` queda fuera por no ser indexable, y se revisan `/cuestionario` y `/simulador`, que requieren sesión y deben salir del sitemap). Sin `lastmod` inventado.

## Nota de privacidad

Se guardan rutas, tiempos y hitos — no contenido de respuestas ni datos sensibles. El registro es solo para el panel admin.
