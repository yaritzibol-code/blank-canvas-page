# Usuarios activos en tiempo real (panel admin)

Nueva pantalla en el panel admin que muestra, en vivo, quién está dentro de la plataforma en este momento, desde cuándo y qué está haciendo.

## Qué verá la admin

Nueva entrada de menú **"Usuarios activos"** (en el grupo de Operaciones), con:

- Contador grande de personas conectadas ahora mismo.
- Lista en vivo, una fila por persona: nombre, correo, plan (Básica/Pro), rol, avatar.
- **Dónde está**: nombre legible de la pantalla actual (Dashboard, Cuestionario CIAAC, Simulador, Estudiemos juntos, Facturación, etc.), no la ruta técnica.
- **Qué está haciendo**: etiqueta de contexto cuando aplica — "Contestando cuestionario ATP cap. 3", "En simulador potenciado", "Chateando con Yaris", "En checkout".
- Tiempo conectado y minutos de inactividad (si no toca nada, se marca "inactivo" a los 5 min y desaparece al cerrar la pestaña).
- Filtro rápido: solo activos / incluir inactivos, y buscador por nombre o correo.
- Enlace directo a "Abrir perfil" de cada estudiante.

La lista se actualiza sola, sin recargar.

## Cómo funciona (técnico)

- Canal de **Realtime Presence** de la base (`fp:presencia`). Cada sesión autenticada se une al canal desde un hook global montado en el layout del dashboard y publica: `userId`, nombre, email, plan, rol, ruta actual, actividad, `desde` y `ultimaInteraccion`.
- La ruta se toma del router (`useRouterState`) y la actividad de un pequeño registro en memoria (`setPresenceActivity(...)`) que los módulos ya existentes llaman en puntos clave: inicio de cuestionario/simulador, apertura del chat de Yaris, checkout. Sin actividad explícita se muestra solo la pantalla.
- La inactividad se calcula con eventos de teclado/puntero/visibilidad, actualizando el estado del canal como máximo cada 30 s (sin tráfico innecesario).
- La pantalla admin (`/admin/usuarios-activos`) se suscribe al mismo canal en modo observador y renderiza el estado de presencia agregado por usuario (varias pestañas = una sola fila, con contador de pestañas).
- No hace falta tabla nueva ni migración: la presencia es efímera y vive en Realtime. El histórico de actividad ya existente (bitácora y `recentActivity`) se mantiene igual.
- La ruta se coloca bajo el panel admin existente y usa `AdminShell`, con verificación de rol admin igual que el resto de pantallas administrativas.

## Archivos

- Nuevo: `src/lib/presence.ts` (canal, tipos, `setPresenceActivity`, mapeo ruta → nombre legible).
- Nuevo: `src/hooks/use-presence.ts` (publica la presencia de la sesión actual).
- Nuevo: `src/routes/admin/usuarios-activos.tsx` (pantalla admin en vivo).
- Editar: `src/components/admin/AdminShell.tsx` (entrada de menú), `src/routes/dashboard.tsx` (montar el hook), y llamadas puntuales a `setPresenceActivity` en cuestionario, simulador y chat de Yaris.
