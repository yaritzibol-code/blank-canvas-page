# Flight Points: RTARI y Compass

## Estado

Implementación local preparada para revisión. No se ha aplicado esta migración a la base de producción ni publicado esta versión. La corrección del modal de preguntas es otro commit (`2d20f63`), ya publicado en GitHub `main`.

## Reglas iniciales

| Regla en `fp_rules` |  FP | Límite                                                 |
| ------------------- | --: | ------------------------------------------------------ |
| `learning_path`     |  20 | Una transacción por identificador estable, de por vida |
| `materia_completa`  | 100 | Una transacción por materia, además de los LP          |
| `rtari_completado`  |  50 | Dos entrevistas válidas por día                        |
| `compass_modulo`    |  10 | Cada uno de los siete módulos, una vez por día         |
| `compass_bateria`   |  30 | Una batería completa por día                           |

El motor existente sigue derivando LP y materias mediante la taxonomía actual; no cambió la navegación ni el contenido. Los pagos históricos ya registrados conservan su importe. Las nuevas reglas aparecen automáticamente en Admin → Gamificación, que lee `fp_rules`.

## Día de recompensa y corte histórico

Los nuevos límites usan exclusivamente PostgreSQL y `America/Mexico_City`, según la hora del servidor al confirmar la actividad. No usan el reloj ni la zona del navegador. Las claves son `rtari:<sessionId>`, `compass:<día-México>:<módulo>` y `compass_battery:<día-México>`.

La migración registra un corte persistente en `fp_practice_activation`. Solo se admiten sesiones nuevas registradas en las tablas privadas después de ese corte. Las sesiones históricas locales, `user_state` y `rtari_grabaciones` no crean eventos de práctica. El cron del motor existente tampoco deriva estos eventos. Una sesión sin registro privado nuevo nunca puede reclamar FP.

## Validación RTARI

1. El servidor registra el UUID de sesión después de obtener correctamente la credencial Realtime, con preguntas y duración reservada.
2. La conexión y el cierre explícito se vinculan al mismo UUID. La liquidación de minutos no paga puntos; una salida normal de limpieza marca abandono.
3. Se requieren al menos 60 segundos, dos intervenciones del alumno con al menos tres palabras cada una, veinte palabras del alumno en total y dos intervenciones del entrevistador.
4. El servidor descarga el audio privado de la ruta canónica del usuario y sesión; no acepta una URL del cliente como prueba.
5. Se transcribe con `gpt-4o-transcribe-diarize`, `diarized_json`, `chunking_strategy=auto`. El audio debe tener duración coherente y contener las respuestas. Dos segmentos y ocho segundos de voz del alumno deben corresponder a una voz distinta de la del entrevistador. Se comparan palabras de la transcripción para vincular las respuestas al audio, sin umbral de vocabulario, calificación ni nivel OACI.
6. Se persisten evidencia, cierre verificado, hash del audio, transacción y saldo. Un hash ya usado por ese usuario no se premia con otra sesión. La evaluación OACI se guarda aparte y no condiciona la recompensa.

La transcripción adicional tiene costo y latencia. Si falla la verificación o falta audio persistido, no se conceden puntos. La entrevista y su evaluación siguen disponibles. Los reintentos conservan el UUID; pueden repetir la transcripción antes de confirmar la primera recompensa. Una sesión ya confirmada no vuelve a transcribirse.

Referencia técnica: [guía oficial de transcripción y diarización](https://developers.openai.com/api/docs/guides/speech-to-text).

## Validación Compass

El servidor genera el UUID, semilla y configuración con el generador actual. Vincula módulo, modo, nivel y versiones al registro privado. El resultado debe tener duración coherente con el tiempo transcurrido en servidor, métricas finitas, conteos consistentes, entrada real registrada e interrupciones válidas. Los módulos continuos deben cumplir su tiempo y los de ejercicios deben completar los elementos previstos; un examen por tiempo puede incluir omisiones legítimas, con participación. Una puntuación de cero puede ser válida.

Las señales de ejecución provienen del navegador y se validan en servidor. Esto impide reclamar montos o límites arbitrarios y rechaza resultados incoherentes, pero no constituye una prueba criptográfica de cada interacción: un cliente sofisticado podría fabricar métricas plausibles tras esperar el tiempo requerido. No se presenta esta solución como protección absoluta contra bots.

Las baterías tienen UUID generado en servidor y deben contener los siete módulos, en el orden existente y bajo el mismo UUID. Iniciar otra ejecución mientras una sigue activa invalida la anterior para recompensas; salir invalida la batería pendiente. Menos de siete módulos no paga bonus. Una segunda batería del día puede completarse, sin otro bonus ni pagos repetidos de módulos.

## Persistencia, concurrencia e historial

Las tablas de práctica tienen RLS sin permisos de navegador. Las funciones de concesión solo son ejecutables por `service_role`. No se recibe un importe del cliente: se lee la regla activa en `fp_rules`.

Se reutiliza `fp_transactions`, su índice único `(user_id,event_key)`, `fp_balances`, historial y las notificaciones existentes. La concesión utiliza una transacción SQL y bloqueo por usuario; el límite se comprueba dentro del mismo bloqueo que inserta el movimiento. La conciliación del motor anterior comparte ese bloqueo para evitar sobrescribir un saldo recién actualizado. También se ajustó la notificación del motor anterior para anunciar únicamente filas realmente insertadas en caso de solicitudes concurrentes. No cambiaron los importes de otras reglas.

Los reintentos de red del cliente hacen tres solicitudes con el mismo UUID. No hay una cola duradera para fallos prolongados: un resultado sin confirmación del servidor no anuncia puntos. Reabrir resultados no solicita nuevas recompensas. Un movimiento revertido conserva su clave y consume el cupo original, evitando volver a farmearlo.

## Verificación realizada

- `tests/fp-practice-rewards.cjs`: aplica la migración real en PostgreSQL aislado (PGlite), comprueba importes, claves únicas, 50+50+0 RTARI, módulos distintos, dos baterías, límites, abandono, histórico, audio repetido, medianoche de México, permisos y saldo igual al historial.
- `tests/fp-practice-validation.cjs`: prueba los siete módulos con puntuación cero, resultados incompletos, ausencia de interacción y evidencias RTARI de una o dos voces.
- `tests/fp-practice-server.cjs`: usa la taxonomía real para probar materia completa y el servidor real con almacenamiento/transcripción simulados para probar audio canónico, abandono, duplicados y reintentos confirmados.
- TypeScript y compilación de producción del cliente y servidor.

PGlite usa una sola conexión; las solicitudes simultáneas de esas pruebas no sustituyen una prueba de contención con varias conexiones en producción. Las restricciones únicas y bloqueos se revisaron en SQL. No se hicieron llamadas pagadas reales a OpenAI ni una entrevista completa contra la base desplegada.

Para ejecutar las pruebas, `FP_QA_DEPS` debe apuntar a una instalación de prueba externa de `@electric-sql/pglite`; el empaquetador se toma de la dependencia Vite actual. No se cambió el manifiesto ni los paquetes de producción para añadir esta herramienta.

## Activación pendiente

1. Revisar el commit específico de Flight Points antes de publicarlo.
2. Aplicar `supabase/migrations/20260926010000_fp_practice_rewards.sql` mediante el canal de migraciones autorizado del proyecto. El archivo SQL no se aplica por el simple hecho de subirlo a GitHub. Requiere acceso administrativo a la base; no hay credencial privilegiada disponible en este entorno.
3. Desplegar el código con la migración ya aplicada. El motor existente ahora necesita `fp_reconcile_balance`; desplegar el código primero interrumpiría la conciliación hasta aplicar SQL.
4. Verificar una entrevista real grabada y una batería completa en el entorno conectado, y dos reclamaciones concurrentes con conexiones independientes, antes de considerar activa y verificada la actualización en FlightPath.mx.

La fecha de corte permanece en base de datos. No se reinicia con despliegues o refrescos. La aplicación de la migración no concede recompensas de RTARI/Compass por sí sola.
