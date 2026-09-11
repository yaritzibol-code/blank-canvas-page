# FlightPoints y Comunidad

Sistema central de puntos (FP) conectado a la actividad real que FlightPath ya registra, más una nueva sección Comunidad dentro del Dashboard actual. No se reconstruye nada existente: Learning Paths, cuestionarios, flashcards, logros, racha, perfil, Admin y B737 se reutilizan tal cual.

## Decisiones acordadas

- Quien elija no mostrar su nombre aparece con un **folio FlightPath** corto y fijo (ej. `FP-4A7C2`), generado una sola vez por alumno.
- Entrega completa en una sola pasada.
- Racha y logros alimentan sus rankings desde el primer día, pero se guardan como **dato de cuenta en el servidor**: el navegador ya no decide el valor publicado, lo recalcula el servidor a partir de la actividad sincronizada.

## Cómo se ganan los puntos

El navegador nunca dice cuántos puntos dar. Solo avisa "terminé esta actividad". El servidor:

1. Busca la actividad en los datos que la cuenta ya tiene guardados (intentos de cuestionario, Learning Paths completados, sesiones de flashcards, sesiones de Pathy, días de estudio, logros).
2. Confirma que realmente está completada.
3. Identifica el programa: CIAAC, Línea Aérea o General. Si no hay clasificación clara, la actividad no entra a los rankings por programa. B737 queda fuera de Comunidad por completo.
4. Aplica la regla vigente y verifica que ese mismo evento no haya sido premiado antes.
5. Crea la transacción, actualiza el total y devuelve el resultado.
6. Solo entonces el alumno ve la celebración.

Si algo falla, no hay celebración y el reintento no duplica puntos.

## Reglas iniciales (todas editables desde Admin)

| Actividad | FP |
|---|---|
| Material completado | 5 |
| Learning Path completado | 100 |
| Materia completada | 1000 |
| Cuestionario 1–9 preguntas | 0 |
| 10–19 / 20–29 / 30–39 / 40–49 / 50–99 / 100+ | 5 / 10 / 15 / 20 / 25 / 30 |
| Bonus 90%+ | 20 |
| Bonus 100% | 30 |
| Sesión válida de Flashcards | 10 |
| 50 flashcards en una sesión | 15 |
| Sesión válida de Estudia con Pathy | 20 |
| 30 minutos reales de estudio | 15 |
| Racha de 3 días / 7 días | 30 / 75 |
| Logros | valor por logro, configurable |

Los bonus se otorgan por **mejor resultado nuevo**: repetir un cuestionario ya dominado no vuelve a pagar. Hay tope máximo configurable por cuestionario.

## Comunidad

Nueva entrada en el menú **Mi progreso**, justo debajo de Recordatorios, dentro del Dashboard de siempre.

- Encabezado: "Aquí reconocemos a quienes están dando lo mejor de sí" + "Los Tops de esta semana".
- Dos pestañas: **Rankings** y **Yo**.
- Un solo selector de periodo: Esta semana / Este mes / Histórico.
- Cinco rankings: Top General, Top CIAAC, Top Línea Aérea, Racha más larga, Más logros. Solo Top 5 visible.
- El alumno ve su propia posición y unas pocas posiciones alrededor, con "Te faltan X FP para alcanzar al #N". Nunca se expone quién va al final.
- Empates: se resuelven por actividades válidas, luego por quién llegó antes al total; siempre el mismo resultado al recargar.
- Pestaña **Yo**: posición, total de FP, próximo objetivo, posición en los cinco rankings y desglose de dónde vienen los puntos.
- Acceso permanente "¿Cómo funcionan los FlightPoints?".

### Tutorial de primera vez

Guía por pasos (Siguiente → Entendido) que explica qué son los FP, cómo se ganan y cómo funcionan los rankings y los periodos. Se puede cerrar con ✕ en cualquier momento. A partir de la segunda vez aparece además la casilla "No volver a mostrar", que sí guarda la preferencia en la cuenta. Cerrar con ✕ no equivale a desactivarlo.

Al final del primer ingreso se pregunta cómo quiere aparecer: con su nombre y foto, o solo con su folio FlightPath. La preferencia se guarda en la cuenta y se puede cambiar después desde Configuración.

## Perfil

Debajo de Logros aparece **FlightPoints**: total, desglose por categoría, actividad reciente (últimas 10, con nombre humano de la actividad y fecha) y "Ver historial completo" con filtro Todo / CIAAC / Línea Aérea. Nunca se muestran nombres de reglas ni identificadores internos.

## Celebración

Aviso discreto en pantalla, sin cambiar de página ni bloquear lo que el alumno está haciendo. Se cierra solo o con un clic. Si una misma acción genera varias recompensas, se agrupan en una sola celebración con el total y el nuevo saldo. Los ajustes hechos por Admin no generan celebración.

## Admin — Gamificación

Nueva sección dentro del panel actual con cinco vistas:

- **FlightPoints**: editar todas las reglas, con confirmación antes de guardar.
- **Economía**: FP de la semana, del mes, históricos, promedio por alumno, reparto por tipo de actividad y por programa, todo con datos reales.
- **Historial**: cada cambio de regla con valor anterior, valor nuevo, quién y cuándo.
- **Ajustes manuales**: sumar o restar FP a un alumno con motivo obligatorio, registrado como transacción propia. Incluye reversión de una recompensa mal dada, creando una transacción contraria ligada a la original (nunca se borra nada).
- **Alertas**: actividad sospechosa marcada para revisión (muchos FP en poco tiempo, repeticiones, eventos duplicados). No se sanciona a nadie automáticamente.

Cambiar una regla nunca recalcula el pasado: cada transacción conserva el monto y la regla con la que se generó.

## Recálculo histórico

Proceso que revisa la actividad real ya existente de cada alumno y otorga los FP que le corresponden. Solo cuando hay información suficiente: si no existe registro de tiempo de estudio, no se inventa. Se puede ejecutar varias veces sin duplicar nada.

## Detalles técnicos

- Tablas nuevas: `fp_transactions` (con clave única de evento, estado pendiente/procesada/rechazada/revertida y referencia a la transacción revertida), `fp_balances` (agregados reconciliables), `fp_rules` + `fp_rules_history`, `fp_community_profiles` (folio, privacidad, preferencia de tutorial, racha y logros publicados), `fp_alerts`. RLS: cada alumno lee lo suyo; los rankings se sirven por funciones `security definer` que exponen solo folio/nombre, avatar, FP y posición.
- Concesión de puntos en `createServerFn` autenticadas (`src/lib/fp/fp.functions.ts`), con validación server-side contra `user_state` (la copia sincronizada de la actividad del alumno). Idempotencia por índice único `(user_id, event_key)`.
- Reglas centralizadas en una sola fuente (`fp_rules`), leídas por el motor; el frontend no contiene montos.
- Fechas: una sola utilidad temporal (zona horaria de México) para semana, mes, transacciones y racha, usada por rankings, perfil y Admin.
- Rutas nuevas: `/dashboard/comunidad` y `/admin/gamificacion` (más subvistas), reutilizando Dashboard Shell y AdminShell.
- B737 se excluye por clasificación de programa, sin tocar su contenido ni su lógica.

## Criterios de cierre

Typecheck y build limpios; Comunidad y perfil funcionando con datos reales; sin duplicados al refrescar, doble clic o reintentar; cuestionarios de menos de 10 preguntas en 0 FP; bonus no repetibles; FP que nunca bajan por inactividad; Admin capaz de editar reglas, ver economía, alertas, ajustes y reversiones.
