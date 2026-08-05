# Análisis real de Pathy con IA

Hoy, al terminar un cuestionario o el simulador, Pathy muestra un texto de plantilla ("Tu punto más débil fue X") calculado solo con el porcentaje por materia. En Línea Aérea eso casi no dice nada: las preguntas de ATP, Jeppesen o PHAK se agrupan por manual, no por materia CIAAC, así que el capítulo que realmente costó nunca aparece. Además ese análisis se pierde: no se guarda en ningún lado y `/dashboard/analisis` lo recalcula con promedios generales.

La meta: que Pathy lea las preguntas que fallaste de verdad, diga qué materia y qué capítulo fueron los que más costaron, y que ese análisis quede guardado y visible en Análisis.

## Qué se construye

**1. Guardar el detalle de cada sesión**

Los cuestionarios hoy solo guardan aciertos por materia. Se añade el detalle por pregunta (igual que ya hace el simulador): qué reactivo fue, de qué manual y capítulo venía, qué opción eligió la estudiante y cuál era la correcta. Sin esto no hay forma de saber qué capítulo costó.

**2. Ranking real, calculado con datos**

Antes de llamar a la IA se calcula, con las respuestas de la sesión (y del historial reciente en Análisis):

- Materia CIAAC con peor porcentaje y con cuántas preguntas se midió.
- Manual + capítulo con peor porcentaje (ATP cap. 5, Jeppesen cap. 3, PHAK cap. 11…), con su título real.
- Los reactivos fallados agrupados por tema/sección.

Estos números salen del store, no de la IA: siempre son reales y verificables. Un capítulo con muy pocas preguntas se marca como "muestra corta" en lugar de declararlo el más débil.

**3. Pathy usa la misma IA que Yaris**

Se agrega una función de servidor que reutiliza exactamente la misma tubería de Yaris (misma llave de OpenAI, mismo control de límites por usuario, misma bitácora de uso en el panel admin). Recibe el resumen de errores —enunciado recortado, opción elegida vs. correcta, materia, manual, capítulo, sección— y devuelve:

- Un diagnóstico en una frase (qué fue lo que más costó y por qué, viendo el patrón de los errores, no solo el porcentaje).
- 2–4 puntos concretos de confusión detectados (por ejemplo, "confundes viento cruzado con componente de frente" en vez de "reforzar Meteorología").
- 3 acciones sugeridas con enlace directo al capítulo o materia correspondiente.

El diagnóstico va acompañado siempre del número calculado en el paso 2, para que la IA no invente cifras.

**4. Se guarda y aparece en Análisis**

Cada análisis se guarda con la sesión que lo originó (fecha, tipo, calificación) y se sincroniza a la nube como el resto del progreso, así que se ve desde cualquier dispositivo. En `/dashboard/analisis` se añade un bloque "Lectura de Pathy" con el último análisis y el historial de los anteriores, para poder comparar si el punto débil se repite o ya se corrigió.

**5. Casos límite**

- Sesión perfecta (0 errores): Pathy lo dice y sugiere subir dificultad; no se gasta llamada de IA innecesaria si no hay nada que analizar.
- Sin plan Pro: se muestra el ranking real calculado (materia y capítulo más flojos) sin la narrativa de IA, con invitación a Pro.
- Falla de la IA o límite de uso alcanzado: se muestra el mismo ranking real y un aviso discreto; nunca una pantalla vacía ni texto inventado.

## Detalles técnicos

- `QuizAttempt` gana un campo `answers` (mismo shape que `SimAttempt.answers`, más `fuente`, `capitulo`, `capituloTitulo`, `seccion`). `src/routes/cuestionario.tsx` lo llena al guardar el intento; el simulador ya lo tiene y solo se enriquece con manual/capítulo.
- Nuevo `src/lib/store/pathy-errors.ts`: agrega los `answers` de uno o varios intentos y devuelve el ranking por materia y por manual/capítulo, con tamaño de muestra.
- Nuevo `src/lib/pathy-ai.functions.ts`: `createServerFn` con `requireSupabaseAuth`, que importa los mismos helpers de `src/lib/yaris-openai.server.ts` (`callOpenAI`, `checkUserRateLimit`, `fitInputBudget`, `logAiUsage`, `loadAdminPrompt`) y un prompt propio de informe, con salida en JSON estricto (diagnóstico, confusiones, acciones).
- Nueva colección sincronizada `pathy_reports` añadida a `USER_ARRAY_KEYS` en `src/lib/store/sync.ts`; se guarda en `user_state` como el resto del progreso, sin migración de base de datos.
- Pantallas de resultado de `cuestionario.tsx` y `simulador.tsx`: sustituyen el bloque "Pathy recomienda" por el informe real (con estado de carga mientras responde la IA).
- `src/routes/dashboard/analisis.tsx` y `PathyAnalysis.tsx`: nuevo bloque con el último informe guardado y su historial.
- Los enunciados solo viajan del servidor a OpenAI dentro de la función protegida; el banco sigue sin exponerse al cliente.
