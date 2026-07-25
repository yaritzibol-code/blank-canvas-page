# Auditoría de placeholders, mock data y datos sin fuente de verdad

Fecha: 2026-07-25 · Alcance: `src/`, `supabase/`, `public/`, `tests/` (175 archivos, ~38.6k LOC)

## Arquitectura de datos (contexto)

La app tiene **tres capas** y el problema casi siempre está en la frontera entre ellas:

| Capa | Dónde vive | Rol |
|---|---|---|
| `localStorage` prefijo `fp_db_` | `src/lib/store/db.ts` | Caché de trabajo y fuente de verdad de la UI |
| Supabase (Postgres) | `src/lib/store/sync.ts` | Persistencia real, se hidrata al iniciar sesión |
| Stripe | `src/lib/payments.functions.ts` | Fuente de verdad de cobro (precios por `lookup_key`) |

Los seeds (`seed.ts`, `seed-questions.ts`, `seed-biblioteca.ts`) **no son mock data**: las 2,951 preguntas y los 104 libros son contenido real auditado contra el Excel y el Drive del cliente. Se excluyen de los hallazgos salvo donde se indique.

Verificado: las cifras que promete la landing están respaldadas — 2,951 preguntas (dice "2,800+"), 104 manuales (dice "100+"), 12 materias (`MATERIAS_DEF`).

---

## P0 — Datos fabricados presentados al usuario como reales

### 1. Barra "radar" del dashboard: tres métricas inventadas
`src/routes/dashboard.tsx:312-320` y `src/routes/dashboard.tsx:516-525`

```js
const [radarN, setRadarN] = useState(47);
setInterval(() => setRadarN(n => Math.max(30, Math.min(80, n + Math.floor(Math.random() * 5) - 2))), 4000);
```

Se renderiza junto a un punto verde pulsante (`animation: fp-pulse`) como si fuera telemetría en vivo:

- **`{radarN} pilotos estudiando ahora mismo`** — random walk entre 30 y 80, arranca en 47. No hay ninguna consulta de presencia.
- **`Materia más activa: Meteorología`** — string fijo.
- **`Promedio de sesión: 47 min`** — string fijo.

Es prueba social fabricada mostrada a usuarios de pago. `analytics.ts` ya calcula datos reales de actividad; nada de esto los usa.

### 2. `public/seed-cloud.json` — 2.2 MB del banco de preguntas expuestos públicamente y obsoletos
`public/seed-cloud.json` (2,210,708 bytes)

Contiene `{questions: 2819, materiales: 104, clases: 41, flashcards: 488}` — **incluye `correctIndex` y `explanation` de cada pregunta**.

Dos problemas simultáneos:

- **Está desactualizado y contiene datos que el propio repo documenta como corruptos.** Son las 2,819 preguntas del seed v3. `seed.ts:700-710` explica que v4 corrigió el reparto por materia y reparó 8 filas dañadas (2,819 → 2,951), y que v5 reconstruyó las filas de Meteorología corrompidas en el Excel original (relleno `OMM/la/a` insertado entre palabras). Ese archivo es la versión previa a ambas correcciones.
- **Es públicamente descargable.** Vite sirve `public/` en la raíz, así que está en `https://flightpath.mx/seed-cloud.json`. `robots.txt` no lo excluye. El banco completo con respuestas —el contenido principal del plan Pro de $1,500/mes— se descarga sin cuenta.

No está referenciado en ningún punto del código (`grep seed-cloud` en `src/`, `supabase/`, `tests/`, `vite.config.ts` → 0 resultados). Es un artefacto muerto.

### 3. El reproductor de clases inventa progreso y lo escribe como real
`src/routes/dashboard/clases.tsx:196-197, 253-280`

```js
const playerMode = !vid || vid.videoUrl === "" ? "placeholder" : ...
// Timer simulado (solo placeholder, visual como hoy)
if (playerMode === "placeholder") {
  playIntervalRef.current = setInterval(() => setPlayProgress(p => Math.min(100, p + 0.1)), 100);
}
if (playerMode !== "video") {
  watchIntervalRef.current = setInterval(() => { addWatched(1); ... }, 1000);
}
```

En modo `placeholder` no hay video, pero `addWatched(1)` corre igual cada segundo y `persistProgress()` escribe **datos reales**: `upsertClaseProgress({pctVisto, tiempoVistoSecs, completada})` y, al cruzar `pctMinimoClase` (85%), un `logActivity({kind: "clase"})`.

**Las 41 clases sembradas tienen `videoUrl: ""`** (`seed.ts:328`), así que *todas* caen en este modo. Dejar la pestaña abierta marca clases como completadas sin contenido que ver, y eso contamina `courseProgress()`, el panel admin, la racha y `estimatedReadiness()`.

---

## P1 — Precios: cuatro cifras contradictorias, ninguna leída de Stripe

El importe real vive en Stripe: `planes.tsx:21` define `PRO_PRICE_ID = "flightpath_pro_monthly"` y `payments.functions.ts:62` lo resuelve con `stripe.prices.list({lookup_keys})`. **Ningún precio mostrado se lee de ahí.** Todos están escritos a mano:

| Ubicación | Mensual | Anual |
|---|---|---|
| `src/routes/dashboard/planes.tsx:183` | **$500 MXN/mes** | — |
| `src/routes/index.tsx:1217,1222` | **$1,500 MXN/mes** | $12,000 tachado → $10,000 |
| `src/routes/faq.tsx:43` | **$1,500 MXN/mes** | $12,000/año, lanzamiento $10,000 |
| `src/lib/store/domain.ts:399` (`DEFAULT_CONFIG.precioPlanAnual`) | — | $10,000 MXN |

La página de planes —**la que ejecuta el checkout**— anuncia $500/mes; la landing y el FAQ anuncian $1,500/mes. Un usuario ve $500, pulsa "Actualizar a Pro" y Stripe le cobra lo que tenga configurado el `lookup_key`.

Además `DEFAULT_CONFIG.precioPlanAnual` es editable desde `admin/configuracion.tsx`, pero **ninguna vista lo consume**: cambiarlo en el panel no altera nada de lo que ve el usuario.

La oferta "Precio de lanzamiento · solo por 15 días" (`index.tsx:1224`) no tiene fecha de inicio ni lógica de expiración: es permanente.

---

## P1 — "Yaris IA" es un guion determinista en 4 de las 5 superficies

Existe una IA real: `src/lib/yaris-ai.functions.ts` llama al gateway de Lovable (`google/gemini-2.5-flash`) con autorización por plan. **Solo la usa `YarisChatModal`** (`YarisChatModal.tsx:84`).

Las otras cuatro superficies usan `yarisReply()` de `src/lib/store/yaris.ts`, un motor determinista de 4 respuestas fijas indexadas por número de turno:

| Superficie | Línea | Motor |
|---|---|---|
| `components/shared/YarisChatModal.tsx` | 84 | **IA real** (fallback a guion si falla) |
| `routes/cuestionario.tsx` ("Explícamelo Yaris") | 263, 280 | Guion |
| `routes/dashboard/biblioteca.tsx` | 170 | Guion |
| `routes/dashboard/estudiemos.tsx` | 731 | Guion |
| `routes/dashboard/bitacora.tsx` | 291 | Guion |

Agravantes:

- **Se simula que "está escribiendo"**: `cuestionario.tsx:254-267` encadena `setTimeout` de 700ms + 200ms + 900ms con `setYarisTyping(true/false)` para imitar latencia de un modelo que no se está invocando.
- **Se repite en bucle**: `yarisReply` hace `seq[Math.min(turn, seq.length - 1)]`, así que a partir del 4.º mensaje devuelve siempre el mismo texto sin importar lo que escriba el usuario.
- **`estudiemos.tsx:731`** pasa el texto del usuario como nombre de materia: `yarisReply(turn, { materiaName: t }, t)`. Si el alumno escribe "no entiendo nada", Yaris responde "¿Quieres que te haga una pregunta de repaso de no entiendo nada?".
- **`planes.tsx:190`** vende "Yaris con IA (**RAG del curso**)". No hay RAG en el repo: `yaris-ai.functions.ts` inyecta en el prompt la explicación de la pregunta activa, sin recuperación sobre la biblioteca ni embeddings (`grep -i rag src/` → 0 resultados).

---

## P2 — Estado paralelo fuera de la fuente de verdad

### 6. La fecha de examen vive en dos sitios que divergen

`user.fechaCiaac` está en el store y se sincroniza a Supabase. En paralelo se escribe una clave cruda `fp_exam_date`, fuera del prefijo `fp_db_`, que **nunca se sincroniza ni se migra**:

- `components/shared/OnboardingModal.tsx:38` — escribe **ambos** (correcto)
- `routes/dashboard/estudiemos.tsx:344` — escribe **solo** `fp_exam_date`
- `routes/dashboard/recordatorios.tsx:197` — escribe **solo** `fp_exam_date`

La lectura prefiere el store (`estudiemos.tsx:900`: `user.fechaCiaac ?? localStorage.getItem("fp_exam_date")`), así que una fecha cambiada desde Estudiemos o Recordatorios **no llega al perfil, ni a la nube, ni a la cuenta regresiva del dashboard** (`dashboard/index.tsx:39`, que usa `user.fechaCiaac`). El usuario ve dos fechas distintas para su examen según la pantalla, y al cambiar de dispositivo pierde la de localStorage.

Mismo patrón sin sincronizar: `fp_tiempo_disponible`, `fp_tiempo_custom_h`, `fp_tiempo_custom_m`, `fp_onboarding_done` (`estudiemos.tsx:347-348, 1014, 1109-1111`).

### 7. "Avance del curso" se calcula sobre 2 de las 12 materias

`src/modules/data/registry.ts` — `SUBJECT_TEMAS` solo tiene contenido para dos materias:

- `aerodinamica`: 7 temas
- `meteorologia`: 1 tema
- las otras **10 materias: 0 temas**

`analytics.ts:78-83` (`courseProgress`) pondera los temas al 50% dividiendo entre `Object.values(SUBJECT_TEMAS).flat().length` = **8**. `materiaProgressPct` devuelve `0` fijo para las 10 materias sin temas (`analytics.ts:128-130`).

Consecuencia: completar 8 temas de un temario de 12 materias marca el bloque de temas al 100%. Ese número alimenta el "% del curso" del alumno, `adminSummary.avgCourseProgress` y el logro "Listo pa' volar — 100% del curso".

Mientras tanto la landing (`index.tsx:1229`) y el FAQ (`faq.tsx:51`) venden "Las 12 materias con Learning Paths **completos**".

---

## P2 — Placeholders visibles

| # | Ubicación | Detalle |
|---|---|---|
| 8 | `routes/dashboard/clases.tsx:72` | `FALLBACK_MATERIAS` — comentado como *"Mock visual del grid deshabilitado"*, con conteos inventados ("8 clases · 2h 14min", "9 clases · 2h 48min"…) que no corresponden a ninguna clase real |
| 9 | `lib/store/seed.ts:328` | Las 41 clases sembradas: `videoUrl: ""` y `status: "borrador"` |
| 10 | `lib/store/seed.ts:352` | Materiales con `pages: 0` |
| 11 | `routes/blog.tsx:24-29` | 4 artículos "Próximamente", cero contenido. La ruta está en el sitemap y en `llms.txt` |
| 12 | `components/shared/UnderConstruction.tsx` | 5 módulos bloqueados con 🚧 para no-admins: Clases, Estudiemos juntos, Flashcards, Learning Paths, Learning Path (detalle) — todos vendidos como incluidos en Pro |
| 13 | `routes/admin/configuracion.tsx:104` | `proveedorWhatsApp` con `placeholder="Pendiente de integración"` |
| 14 | `lib/store/domain.ts:395` | `whatsappSoporte: "+52 55 1234 5678"` — es el mismo número ficticio de la usuaria demo María (`seed.ts:60`) |

### 15. Los recordatorios de WhatsApp no envían nada y el panel muestra envíos falsos
`ultimoEnvio` solo se escribe en el seed (`seed.ts:592, 607, 622`). No existe código que envíe un recordatorio ni que actualice ese campo (`grep` sobre todo `src/`). La columna "Último envío" de `admin/whatsapp.tsx` muestra timestamps sembrados que nunca cambian.

`admin/perfil.tsx:159-164` (`doWa`) sí es honesto: registra el mensaje y avisa *"el envío se activará con el proveedor de WhatsApp"*.

---

## P3 — Inconsistencias menores

| # | Ubicación | Detalle |
|---|---|---|
| 16 | `routes/dashboard/perfil.tsx:45` | Logro **"Flashmaster / 50 flashcards"** se desbloquea con `stats.flashDominadas < 10` → umbral real 10, etiqueta 50 |
| 17 | `routes/dashboard/perfil.tsx:49` | Logro **"Listo pa' volar / 100% del curso"** se desbloquea con `readiness >= 80`, no con 100% |
| 18 | `routes/dashboard/banco.tsx:50` y `routes/dashboard/bitacora.tsx:31` | `MATERIAS` duplicado a mano en vez de usar `MATERIAS_DEF`. Las etiquetas divergen: "Aeronaves" vs "Aeronaves y Motores", "Tránsito Aéreo" vs "Servicios de Tránsito Aéreo" |
| 19 | `routes/dashboard/bitacora.tsx:234-238` | Como la bitácora guarda *etiquetas* y no slugs, cruzarlas con el rendimiento requiere el heurístico `matches()` (`includes` + comparación de primera palabra). Con las etiquetas divergentes de #18 el cruce falla en silencio |
| 20 | `routes/cuestionario.tsx:445` | Un límite de plan se muestra con `<UnderConstruction>` — el usuario ve 🚧 "en construcción" cuando en realidad topó con el paywall |
| 21 | `routes/index.tsx:457` | Cuenta regresiva fijada a `2026-08-17`. Pasada esa fecha muestra `00:00:00:00` permanentemente |
| 22 | `routes/index.tsx:579, 776-777, 896` | Mockups de producto en la landing con datos ficticios ("María", racha 14 días, 68%, "Piloto élite"). Es uso legítimo de demo visual, pero conviene que no se confundan con métricas reales |
| 23 | `lib/store/seed.ts:38-40` | Cuentas demo sembradas en cada navegador: María, Carlos y la admin `admin@flightpath.mx`, todas con `DEMO_PASSWORD = "flightpath2026"`. En producción `cloudEnabled()` es `true` y el login va por Supabase Auth, así que **no son un bypass**; pero contaminan el panel admin y `adminSummary` hasta que `hydrate()` sobreescribe `users` con los perfiles de la nube |

---

## Resumen por prioridad

**P0 — arreglar antes del siguiente release**
1. Barra radar del dashboard: 3 métricas inventadas presentadas como telemetría en vivo
2. `public/seed-cloud.json`: 2.2 MB con el banco de preguntas y respuestas, público y en versión con datos corruptos conocidos
3. Reproductor de clases: escribe progreso y completitud reales sin video

**P1 — inconsistencia de negocio**
4. Cuatro precios contradictorios, ninguno leído de Stripe ($500 vs $1,500/mes)
5. "Yaris IA" es un guion fijo en 4 de 5 superficies, con latencia simulada; "RAG del curso" no existe

**P2 — integridad de datos**
6. `fp_exam_date` diverge de `user.fechaCiaac` y no sincroniza
7. "% del curso" calculado sobre 8 temas de 2 materias, vendido como 12 completas
8–15. Placeholders visibles y recordatorios de WhatsApp sin backend

**P3 — corregibles en un pase**
16–23. Umbrales de logros mal etiquetados, listas de materias duplicadas, countdown fijo, cuentas demo

## Lo que sí está bien conectado

Para dejar constancia de lo auditado y descartado:

- `admin/index.tsx`, `admin/banco.tsx`, `admin/estudiantes.tsx`, `admin/soporte.tsx`, `admin/whatsapp.tsx` — todos derivan de `adminSummary()` / `getUsers()` / `getReports()`, sin cifras cosidas a mano
- `admin/operaciones/*` — KPIs, MRR y uso de IA vienen de server functions contra Supabase y Stripe (`admin.functions.ts`)
- `analisis.tsx` — los deltas "vs semana pasada" se calculan comparando periodos reales (`analisis.tsx:183-192`); no son placeholders
- `estimatedReadiness()`, `courseProgress()`, `getStreak()` — cálculos reales sobre intentos registrados (el problema de #7 es la cobertura del temario, no la fórmula)
- `pathyAnalysisMessage()` — interpretativo pero derivado de datos, con descargo explícito de que no garantiza el resultado del examen
- Los seeds de preguntas (2,951) y biblioteca (104 libros) — contenido real auditado contra las fuentes del cliente
- `sync.ts` — pagina correctamente con `.range()` para sortear el corte de 1,000 filas de PostgREST
- `PaymentTestModeBanner`, `DataSyncBanner`, `doWa()` — placeholders honestos que se declaran como tales
