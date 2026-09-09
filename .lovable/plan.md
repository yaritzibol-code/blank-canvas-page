# Estudiemos Juntos — sesión adaptativa guiada por Pathy

Rediseño del bloque existente (`/dashboard/estudiemos`). No se crean herramientas nuevas:
Pathy solo organiza y conecta lo que ya existe en FlightPath.

## Cómo queda la experiencia

1. **Acceso**: solo alumnas con suscripción de paga activa. Quien no la tenga ve la pantalla
   con candado y un CTA claro para actualizar; además la generación de sesión se rechaza en el
   servidor, no solo en pantalla.
2. **Flujo de entrada (5 pasos, uno por pantalla, limpio)**
   - ¿Para qué estás estudiando? → CIAAC · Línea Aérea
   - ¿Qué quieres estudiar hoy? → campo libre ("Escribe un tema, materia o concepto…") + botón
     visible "Nada en específico"
   - ¿Cómo te sientes para estudiar hoy? → 😫 Cero ganas · 😐 Normal · 🙂 Con ganas · 🔥 A tope
   - ¿Qué tan urgente es? → 🟢 · 🟡 · 🟠 · 🔴 (sin fecha de examen, sin calendario)
   - ¿Cuánto tiempo quieres estudiar? → campo libre en minutos + atajos 15 / 25 / 45 / 60 / 120
3. **Pathy arma la sesión** con el progreso real: temas pendientes, lo que está en curso, materias
   con bajo desempeño, preguntas falladas antes, flashcards por repasar y recursos incompletos.
   Si la alumna escribió un tema, se filtra por ese tema; si eligió "Nada en específico", se
   prioriza por progreso (nunca al azar).
4. **Agenda simple**: lista de actividades con icono, nombre del recurso real y `~min`, con la
   leyenda "Los tiempos son aproximados. Estudia a tu ritmo." La actividad actual va marcada.
5. **Nube de Pathy flotante**: muestra `quedan 32:14`. Al tocarla se expande con tiempo restante,
   `23 / 45 min`, actividad actual, siguiente y "Terminar sesión" (con confirmación).
   Durante un break la misma nube cambia a `☕ Break · 04:59`.
6. **Cada actividad abre el recurso real** (Learning Path, flashcards, cuestionario con sus
   filtros de materia/manual/capítulo, banco, simulador, Ponme a Prueba). La nube sigue viva
   entre rutas: un solo timer para toda la sesión, nunca se reinicia.
7. **Breaks**: se calculan por duración (15 sin break, 25 opcional, 45–60 uno, 90+ varios) y
   nunca cortan una actividad: el break arranca cuando la alumna termina o pasa a la siguiente.
   Ningún mensaje sobre velocidad o retraso.
8. **Resumen final** con lo que realmente completó (learning paths, flashcards, preguntas,
   aciertos), lo que conviene reforzar y el siguiente paso sugerido.

## Cómo se construye (técnico)

- `src/lib/estudiemos/types.ts` — `StudyIntake`, `PlanActivity`, `StudySessionState`.
- `src/lib/estudiemos/catalog.ts` — inventario de recursos **reales** por track, leído de
  `SUBJECT_TEMAS`/`TEMA_REGISTRY`, `MATERIAS_DEF`, `LINEA_AEREA_QUIZZES`/`AERONAVE_QUIZZES` y los
  capítulos de `linea-aerea-meta.ts`; cada recurso trae su `to`/`search` de navegación
  (`/cuestionario?banco=la&fuente=ATP&caps=3&qty=15`, `/dashboard/materias/$subjectId`, etc.).
- `src/lib/estudiemos/planner.ts` — selección determinista con señales reales
  (`getTemaProgress`, `getQuizAttempts` + `answers` fallados, `getFlashStates`,
  `materiaPerformance`, `materiaProgressPct`, `getSimAttempts`), más ánimo, urgencia y minutos;
  reparte tiempos aproximados e inserta breaks.
- `src/lib/estudiemos.functions.ts` — server fn opcional con `requireSupabaseAuth` que verifica la
  suscripción y usa la misma tubería de OpenAI (`callOpenAI`, `logAiUsage`) para **ordenar y
  redactar** los mensajes de Pathy a partir del catálogo que se le entrega. Solo puede elegir IDs
  existentes; si falla o no hay llave, se usa el plan determinista sin degradar la experiencia.
- `src/contexts/StudySessionContext.tsx` — estado único de la sesión (timer global, actividad
  actual, breaks, actividades completadas), persistido para sobrevivir recargas y navegación;
  se monta junto al provider actual sin tocar el timer Pomodoro existente.
- `src/components/estudiemos/` — `IntakeWizard.tsx`, `SessionAgenda.tsx`, `PathyCloud.tsx`
  (nube flotante + panel expandido + confirmación), `BreakCard.tsx`, `SessionSummary.tsx`,
  `LockedState.tsx`.
- `src/routes/dashboard/estudiemos.tsx` se reescribe como orquestador de esas piezas; se quita el
  onboarding de fecha de examen y el plan viejo por fases. "Ponme a Prueba" se conserva tal cual
  y solo se usa como recurso.
- Estética actual: mismos colores, tipografías e iconos; sin dashboards nuevos.

## Nota importante

Hoy Learning Paths, Flashcards y Clases Grabadas están marcados como "en construcción" para todas
las cuentas menos admin. Pathy solo incluirá en la sesión los recursos que la alumna realmente
puede abrir; cuando esos módulos se liberen entrarán automáticamente al catálogo.
