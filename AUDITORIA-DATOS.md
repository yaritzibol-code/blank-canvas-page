# Auditoría de placeholders, mock data y datos sin fuente de verdad

Fecha: 2026-07-25 · Alcance: `src/`, `supabase/`, `public/`, `tests/` (175 archivos, ~38.6k LOC)
Estado: **corregido** — este documento deja constancia de qué se encontró, qué se cambió y qué queda como decisión de negocio.

## Arquitectura de datos (contexto)

| Capa | Dónde vive | Rol |
|---|---|---|
| `localStorage` prefijo `fp_db_` | `src/lib/store/db.ts` | Caché de trabajo y fuente de verdad de la UI |
| Supabase (Postgres) | `src/lib/store/sync.ts` | Persistencia real, se hidrata al iniciar sesión |
| Stripe | `src/lib/payments.functions.ts` | Fuente de verdad de cobro (precios por `lookup_key`) |

Los seeds (`seed.ts`, `seed-questions.ts`, `seed-biblioteca.ts`) **no son mock data**: las 2,951 preguntas y los 104 libros son contenido real auditado contra el Excel y el Drive del cliente. Verificado que las cifras de la landing están respaldadas — 2,951 preguntas ("2,800+"), 104 manuales ("100+"), 12 materias (`MATERIAS_DEF`).

---

## P0 — Datos fabricados presentados como reales

### 1. Barra "radar" del dashboard: tres métricas inventadas ✅ corregido
`src/routes/dashboard.tsx`

Se mostraba junto a un punto verde pulsante, como telemetría en vivo:

- `{radarN} pilotos estudiando ahora mismo` — `Math.random()` en random walk entre 30 y 80, arrancando en 47
- `Materia más activa: Meteorología` — string fijo
- `Promedio de sesión: 47 min` — string fijo

**Corrección.** La franja ahora muestra datos propios reales del estudiante: su racha, su materia más practicada y su promedio de sesión, vía `studySnapshot()` (nuevo en `analytics.ts`), calculados sobre sus intentos y actividad registrados. Los bloques se ocultan mientras no haya datos en lugar de inventar un valor.

El contador global de "pilotos estudiando" no se sustituyó por un equivalente real y se eliminó: no puede calcularse en el cliente, porque las políticas RLS sólo devuelven al estudiante su propio perfil. Requeriría una tabla de presencia y un endpoint agregado.

### 2. `public/seed-cloud.json` — 2.2 MB del banco expuestos y obsoletos ✅ corregido

2,819 preguntas **con `correctIndex` y `explanation`**, servidas públicamente en la raíz del sitio (`robots.txt` no lo excluía) y sin una sola referencia en el código. Era la versión previa a las correcciones que el propio `seed.ts` documenta: v4 reparó 8 filas dañadas y redistribuyó materias (2,819 → 2,951), v5 reconstruyó las filas de Meteorología corrompidas.

**Corrección.** Archivo eliminado. Verificado que ya no aparece en `.output/public/` tras `vite build`.

### 3. El reproductor de clases inventaba progreso y lo guardaba como real ✅ corregido
`src/routes/dashboard/clases.tsx`

En modo `placeholder` no hay video, pero un temporizador simulado avanzaba la barra 0.1% cada 100 ms y `addWatched(1)` corría cada segundo, de modo que `persistProgress()` escribía datos reales: `upsertClaseProgress({pctVisto, tiempoVistoSecs, completada})` y un `logActivity({kind: "clase"})` al cruzar el 85%. Como las 41 clases sembradas tienen `videoUrl: ""`, *todas* caían ahí: dejar la pestaña abierta completaba clases sin contenido y contaminaba `courseProgress()`, la actividad, la racha y el panel admin.

**Corrección.** Sin video no se registra nada: el temporizador simulado desapareció, `togglePlay()` no hace nada en modo placeholder y el panel dice que la clase aún no tiene video. Sólo `iframe` y `<video>` acumulan tiempo, y `<video>` sigue descartando saltos grandes (seeks) como antes.

---

## P1 — Precios

### 4. Cuatro cifras contradictorias, ninguna leída de Stripe ✅ corregido

| Ubicación | Decía |
|---|---|
| `dashboard/planes.tsx` — la página que ejecuta el checkout | $500 MXN/mes |
| `index.tsx` | $1,500 MXN/mes + anual $12,000 → $10,000 |
| `faq.tsx` | $1,500 MXN/mes + anual $12,000, lanzamiento $10,000 |
| `domain.ts` (`DEFAULT_CONFIG.precioPlanAnual`) | $10,000 MXN |

**Corrección.** Nuevo módulo `src/lib/pricing.ts` como fuente única, y nueva server function `getPublicPricing()` que lee el importe real de Stripe por `lookup_key`:

- `dashboard/planes.tsx` y el panel admin muestran el precio **vivo de Stripe** (el mismo `lookup_key` que resuelve el checkout, así que no pueden divergir).
- Landing y FAQ usan la constante compartida `PRO_MONTHLY_FALLBACK` — **$500 MXN/mes**, confirmado como el precio correcto.
- `precioPlanAnual` se eliminó de `InternalConfig`: ninguna vista lo consumía y divergía de lo cobrado. En el panel admin el precio pasó a ser de sólo lectura, con nota de que se edita en Stripe.

**Decisión de negocio pendiente:** se retiró el plan anual de la landing y el FAQ. No existe `lookup_key` anual en Stripe —era literalmente imposible comprarlo— y $10,000/año contradecía $500/mes ($6,000/año). Para reponerlo hay que crear el precio anual en Stripe y añadir su lookup key a `pricing.ts`. La oferta "precio de lanzamiento · solo por 15 días" tampoco tenía fecha de inicio ni lógica de expiración: era permanente.

### 5. "Yaris IA" era un guion determinista en 4 de 5 superficies ✅ corregido

Existía IA real (`yaris-ai.functions.ts` → Gemini vía gateway de Lovable), pero sólo la usaba `YarisChatModal`. Cuestionario, biblioteca, estudiemos y bitácora llamaban a `yarisReply()`: cuatro respuestas fijas indexadas por turno, servidas tras `setTimeout` encadenados que simulaban latencia, y que se repetían en bucle desde el 4.º mensaje (`seq[Math.min(turn, seq.length - 1)]`). En `estudiemos.tsx` además se pasaba el texto del usuario como nombre de materia, así que escribir "no entiendo nada" producía "¿repaso de no entiendo nada?".

**Corrección.** Nuevo `src/lib/yaris-ask.ts` con `useYarisAsk()`, punto único de entrada que usan las cinco superficies:

- **Pro / admin** → modelo real. La espera que ve el usuario es la de la petición, no un `setTimeout`.
- **Plan básica** → sin IA (es la regla de `canUseAI`): se entrega la explicación oficial del banco, contenido real del curso, diciendo explícitamente que es eso, más la invitación a Pro.
- **Fallo de red** → explicación oficial, nunca un guion disfrazado de IA.

`yarisReply()` y su motor se eliminaron de `store/yaris.ts`. Se añadió `resourceTitle` al contexto del modelo para las dudas nacidas en la biblioteca. En `planes.tsx`, "Yaris con IA (RAG del curso)" pasó a "Yaris con IA, con el contexto del curso": no hay RAG en el repo, sólo inyección del contexto de la pregunta activa.

---

## P2 — Integridad de datos

### 6. Estado paralelo fuera de la fuente de verdad ✅ corregido

Corrección de la primera lectura de esta auditoría: `recordatorios.tsx` y `estudiemos.tsx` **sí** escribían `user.fechaCiaac`, salvo el caso "sin fecha". El problema real era otro y seguía siendo un problema: `fp_exam_date`, `fp_tiempo_disponible`, `fp_tiempo_custom_h/m` y `fp_onboarding_done` eran claves **globales del navegador**, no namespaced por usuario y nunca sincronizadas. Dos cuentas en el mismo equipo compartían plan de estudio y fecha de examen; al cambiar de dispositivo se perdían.

**Corrección.** Todas eliminadas. La fecha vive sólo en `user.fechaCiaac` ("sin fecha" es `null`, no el centinela `"sin_fecha"`), y el plan de estudio pasó a `user.prefs.planEstudio`, que viaja al perfil y a la nube como el resto de preferencias.

### 7. "Avance del curso" se calculaba sobre 2 de las 12 materias ✅ mitigado

`SUBJECT_TEMAS` sólo tiene contenido para `aerodinamica` (7 temas) y `meteorologia` (1). `courseProgress()` pondera los temas al 50% dividiendo entre 8, y `materiaProgressPct()` devuelve `0` fijo para las otras 10 materias. Completar 8 temas de un temario de 12 materias marcaba ese bloque al 100%.

**Corrección.** No se tocó la fórmula (cambiarla alteraría el progreso de usuarios existentes). Se añadió `contenidoDisponible()` y la tarjeta de Análisis ahora se llama "Avance del contenido disponible" y precisa "Learning Paths en N de 12 materias". El número deja de leerse como avance del temario completo.

Sigue pendiente **cargar los temas de las 10 materias restantes**: es contenido, no código.

### 8–13. Placeholders visibles ✅ corregidos

| Ubicación | Antes | Ahora |
|---|---|---|
| `clases.tsx` | `FALLBACK_MATERIAS`, mock con conteos inventados ("8 clases · 2h 14min") | Se derivan de las clases reales en borrador; si no hay ninguna, estado vacío honesto |
| `biblioteca.tsx` | Visor simulado (`ScannedPage`) con texto inventado bajo membrete de SCT/DGAC/CIAAC | Eliminado; si falta el PDF se dice que falta |
| `biblioteca.tsx` | "El material más consultado por los estudiantes FlightPath" (elección fija, sin telemetría) | "Un buen punto de partida de la biblioteca" |
| `seed.ts` | Recordatorios con `ultimoEnvio` sembrado, aunque no existe código de envío | `ultimoEnvio: null` |
| `domain.ts` | `whatsappSoporte: "+52 55 1234 5678"` — el mismo teléfono ficticio de la usuaria demo | `""`, lo captura la admin |
| `index.tsx` | Cuenta regresiva fija a `2026-08-17`; pasada la fecha mostraría `00:00:00:00` para siempre | Constante `PROXIMO_CIAAC` documentada; el componente se oculta solo al expirar |

### 14. Cuentas demo sembradas en cada navegador ✅ corregido
`seed.ts` sembraba María, Carlos y la admin `admin@flightpath.mx` (`DEMO_PASSWORD = "flightpath2026"`) con historial inventado, en todos los navegadores. Con nube activa el login va por Supabase Auth, así que **no eran un bypass de autenticación**, pero contaminaban el panel admin y `adminSummary` con estudiantes inexistentes hasta que la hidratación los reemplazaba.

**Corrección.** Las cuentas demo y su historial sólo se siembran con `!cloudEnabled()`, es decir en desarrollo local sin backend. El contenido real del curso (banco, flashcards, clases, biblioteca) se sigue sembrando siempre.

---

## P3 — Inconsistencias menores ✅ corregidas

| Ubicación | Antes | Ahora |
|---|---|---|
| `dashboard/perfil.tsx` | "Flashmaster / 50 flashcards" se desbloqueaba con 10 | Umbrales en constantes y etiquetas derivadas de ellas: no pueden divergir |
| `dashboard/perfil.tsx` | "Listo pa' volar / 100% del curso" se desbloqueaba con readiness ≥ 80 | "80% de preparación estimada" |
| `dashboard/banco.tsx`, `dashboard/bitacora.tsx` | `MATERIAS` duplicado a mano, con etiquetas divergentes ("Aeronaves" vs "Aeronaves y Motores") | Derivados de `MATERIAS_DEF`. Importa porque la bitácora guarda etiquetas y las cruza con el rendimiento vía el heurístico `matches()`, que fallaba en silencio |
| `cuestionario.tsx` | Un límite de plan se mostraba con el cartel 🚧 de `UnderConstruction` | Nuevo `PlanLimitNotice`, que además lleva a la página de planes |

---

## Lo que se auditó y ya estaba bien

- `admin/index.tsx`, `admin/banco.tsx`, `admin/estudiantes.tsx`, `admin/soporte.tsx`, `admin/whatsapp.tsx` — derivan de `adminSummary()` / `getUsers()` / `getReports()`, sin cifras cosidas a mano
- `admin/operaciones/*` — KPIs, MRR y uso de IA vienen de server functions contra Supabase y Stripe
- `analisis.tsx` — los deltas "vs semana pasada" comparan periodos reales
- `estimatedReadiness()`, `getStreak()` — cálculos reales sobre intentos registrados
- `pathyAnalysisMessage()` — interpretativo pero derivado de datos, con descargo explícito
- Seeds de preguntas (2,951) y biblioteca (104 libros) — contenido real verificado contra las fuentes del cliente
- `sync.ts` — pagina con `.range()` para sortear el corte de 1,000 filas de PostgREST
- `PaymentTestModeBanner`, `DataSyncBanner`, `doWa()` — placeholders honestos, declarados como tales
- Los `Math.random()` restantes son legítimos: barajado de preguntas y flashcards, y decoración (`PlaneField`)

## Verificación

- `npx tsc --noEmit` — sin errores
- `npx vite build` — build correcto
- `npx eslint` sobre los archivos nuevos — limpio

El lint del repositorio ya fallaba antes de estos cambios (6,215 problemas en `main`, prácticamente todos de formato `prettier/prettier`, porque el código usa objetos de estilo en línea muy largos). No se reformatearon los archivos existentes: habría producido un diff enorme e ilegible sin relación con la auditoría.

## Lo que queda pendiente, y es decisión de negocio

1. **Plan anual**: crear el precio en Stripe y añadir su lookup key a `pricing.ts` si se quiere volver a ofrecer.
2. **Learning Paths**: cargar los temas de las 10 materias restantes; la landing y el FAQ los prometen completos (se dejó ese copy tal cual, por indicación).
3. **Módulos bloqueados**: Clases, Flashcards, Learning Paths y Estudiemos siguen con el cartel 🚧 para no-admins, mientras el marketing los vende como incluidos en Pro.
4. **Envío de recordatorios por WhatsApp**: no existe integración; `proveedorWhatsApp` sigue vacío.

---

## Ronda 2 (2026-08-03) — Preguntas corruptas del banco recreadas

La v5 del seed decía haber reconstruido las filas de Meteorología dañadas, pero
el relleno seguía en `seed-questions.ts` y, además, la corrupción del Excel había
**descolocado las explicaciones** de casi toda la hoja de Meteorología (una
pregunta de litometeoros explicaba frentes cálidos, etc.). Se auditaron las 2,951
preguntas y se corrigieron **381 filas** (sólo datos; `correctIndex` se conservó
salvo donde se indica). Verificado contra fuentes OACI/OMM/FAA; las cifras clave
se corroboraron con búsqueda (ISA 1013.25 hPa/15 °C, SPECI 60°/10 kt, AIRMET
< FL150, turbonada 16→22 kt, tormenta tropical 34 kt, base de nube = espread/2.5,
evitar CB por 20 NM, decodificación de vientos en altura, etc.).

| Tipo de daño | Filas | Corrección |
|---|---|---|
| Relleno "OMM/la/a" insertado entre palabras (texto, opciones y/o explicación ilegibles) | 79 | Pregunta reconstruida completa (Meteorología: 77 + 2 detectadas después) |
| Explicación descolocada (pertenecía a otra pregunta, prosa limpia pero de otro tema) | 260 | Explicación reescrita para justificar la respuesta correcta ya marcada |
| Explicación-plantilla contradictoria ("Esta afirmación es falsa" en pregunta que no es V/F) | 25 | Explicación reescrita al concepto correcto |
| Opciones duplicadas (un distractor colapsado sobre otro) | 10 | Se restauró el distractor faltante |
| Mojibake (`1984.Â`) | 1 | Carácter corregido |
| Errores tipográficos evidentes (`de de`, `eléctrica eléctrica`, `delimita delimita`, …) | 6 | Corregidos |

**Verificación:** las 2,951 filas parsean como objetos válidos; 0 relleno OMM
residual, 0 explicaciones contradictorias, 0 `correctIndex` fuera de rango, 0
opciones duplicadas. (El `vite build` no corre en este entorno: `node_modules`
está vacío — falta `@lovable.dev/vite-tanstack-config` —; el cambio es sólo de
datos y es sintácticamente válido.)

**Claves de respuesta a revisar contra la fuente oficial CIAAC** (se reescribió la
explicación al concepto correcto sin cambiar la clave, porque puede diferir del
banco oficial): efectos de CG adelantado vs. atrasado en `operaciones` (consumo,
resistencia y velocidad de crucero — L2843/L2846/L2852 apuntan a "aft" donde la
teoría estándar diría "forward"); "velocidad para abortar el despegue" marcada
como VR cuando el estándar es V1 (L2758); descriptor de Vx (L2790); y la pregunta
de IMC "cuando el piloto lo solicite" (L2032), que parece mal planteada de origen.

### Hallazgos del flujo de nuevo usuario (UX/UI/fricción)

1. **Módulos anunciados que muestran 🚧 a todos los estudiantes.** Learning Paths,
   Flashcards, Clases grabadas y Estudiemos Juntos están envueltos en `adminOnly`:
   cualquier estudiante —incluido un Pro de pago— ve "en construcción". La landing
   y el bloque de precios los venden como incluidos en Pro, y el sidebar los marca
   `locked` (que sugiere "mejora a Pro para desbloquear"), pero Pro **no** los
   desbloquea. Es la fricción #1 y una promesa incumplida.
2. **Bug: preguntas gratis sólo de una materia.** En `cuestionario.tsx` el pool
   gratis concatena 10 preguntas por materia y luego hace `slice(0, 10)` del total,
   así que un usuario gratis con "Todas las materias" (la opción por defecto) sólo
   ve ~10 preguntas de Aerodinámica, siempre. La selección multi-materia no
   funciona en plan gratis. Contradice el comentario `BASICA_QUESTIONS_PER_MATERIA = 10`.
3. **"Empieza gratis" = 2 intentos de por vida.** Un usuario nuevo es `plan: basica`
   con máximo 2 intentos totales (cuestionario + simulador combinados) antes del
   paywall. Muy restrictivo para la promesa "sin tarjeta, empieza gratis" (decisión
   de negocio, pero fricción fuerte).
4. **Perk de registro exagerado.** El registro promete "Accede a la biblioteca
   completa del CIAAC" gratis, pero un usuario gratis sólo puede abrir **8 de 104**
   libros (`muestraGratis`). El resto pide upgrade.
5. **Opciones no barajadas por render.** `toLocalQ` mantiene el orden de opciones;
   sólo se baraja el pool de preguntas. Con 10 preguntas fijas para el plan gratis,
   la respuesta correcta queda siempre en la misma posición: se memoriza el lugar,
   no el concepto.
6. **Onboarding pide WhatsApp para recordatorios** que no existen: no hay
   integración de envío, así que el opt-in no dispara nada (ver pendiente #4).
