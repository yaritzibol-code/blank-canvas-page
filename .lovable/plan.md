## Contexto

Ya existe `/admin` con sidebar (Resumen, Estudiantes, Banco, Contenido, Soporte, WhatsApp, Configuración) y el guard `useRequireAuth("admin")` en `AdminShell.tsx`. Ambos admins (`rdaniel.guzman@glassway.mx`, `yaritzi.bol@glassway.mx`) ya llegan al panel.

Lo que **no existe todavía** y esta propuesta agrega: auditoría de eventos Stripe, una sección de "Operaciones" en el sidebar con el nuevo panel de observabilidad, y controles para revocar suscripciones, límites de IA, y edición de RAG / prompt de Yaris.

---

## Por qué es crítico un panel de observabilidad

Sin él, cualquier incidente ("pagué y no se activó Pro", "Yaris me da respuestas raras", "no llega el WhatsApp") se debuggea a ciegas. Con SaaS de pago + IA + webhooks externos necesitas ver:

- **Ingreso y retención**: MRR, cuentas Pro activas, cancelaciones del mes, tasa de churn, próximas renovaciones. Sin esto no sabes si el negocio va bien.
- **Salud del pago**: eventos de Stripe procesados/fallidos por hora, discrepancias perfil ⇄ suscripción, últimas facturas, disputas.
- **Salud de Yaris/IA**: llamadas por día, tokens/costo por usuario, latencia p50/p95, tasa de error del gateway, hits vs miss de RAG.
- **Salud de WhatsApp**: recordatorios encolados, entregados, fallidos y respuesta del webhook n8n.
- **Uso de la plataforma**: DAU/WAU, tiempo de estudio total, cuestionarios/simuladores completados hoy, top materias.
- **Errores del cliente**: last N errores capturados por `error-capture.ts` con stack + userId + ruta.
- **Estado del sistema**: última corrida de pg_cron, edad de la última fila de `subscriptions`/`reminder_events`, cuentas huérfanas (subscription activa sin profile.plan="paga" o viceversa).

---

## Cambios

### 1. Auditoría de eventos Stripe

**Tabla nueva** `stripe_events` (migración):
- `stripe_event_id` (unique), `type`, `env` (sandbox/live), `status` (`processed`/`ignored`/`failed`), `error_message`, `user_id`, `subscription_id`, `payload` (jsonb con lo mínimo: id, customer, status, current_period_end, price lookup), `received_at`.
- RLS: solo admins leen; `service_role` escribe.

**Webhook** `src/routes/api/public/payments/webhook.ts`:
- Antes de procesar, `insert` con `status='received'`.
- Al terminar el `switch`, `update` con `status='processed'` (o `'ignored'` para eventos no manejados).
- En el `catch`, `update` con `status='failed'` + `error_message`.
- Idempotencia: si el `stripe_event_id` ya existe con `status='processed'`, saltar reprocesado.

**Función SQL** `detect_plan_drift()` (SECURITY DEFINER, solo admin) que devuelve usuarios donde `subscriptions.status='active'` pero `profiles.data->>'plan' != 'paga'` o al revés — para el widget "Discrepancias".

### 2. Nueva página `/admin/operaciones` (observabilidad)

Añadir en `AdminShell` un grupo **"Operaciones"** con dos items nuevos:
- `Panel de control` → `/admin/operaciones`
- `Eventos de Stripe` → `/admin/operaciones/stripe`

Layout del panel de control (tarjetas responsivas):

```text
┌─────────────────────────────────────────────────────────┐
│  MRR $X · Pro activos N · Churn 30d M% · Trial N        │
├──────────────────────┬──────────────────────────────────┤
│ Eventos Stripe (24h) │ Discrepancias perfil↔suscripción │
│ ✓ 42 · ✗ 1 · ⏭ 8    │ 2 usuarios afectados → [Ver]      │
├──────────────────────┼──────────────────────────────────┤
│ Yaris IA (24h)       │ WhatsApp (24h)                   │
│ 128 calls · 0.4% err │ 34 enviados · 2 fallidos          │
│ p95 2.1s · $1.23     │ último cron: hace 12 min          │
├──────────────────────┼──────────────────────────────────┤
│ Uso plataforma       │ Errores cliente (últimos 20)     │
│ DAU 47 · WAU 189     │ stack + userId + ruta + hora     │
│ 92 quizzes hoy       │                                  │
└──────────────────────┴──────────────────────────────────┘
```

### 3. Nueva página `/admin/operaciones/stripe` (audit log)

Tabla paginada de `stripe_events` con filtros por tipo, status, env, usuario y rango de fechas. Cada fila expande el payload JSON. Botones:
- **Reprocesar** (llama server fn que re-ejecuta el handler con el payload guardado).
- **Sincronizar plan** (llama `syncMyPlan` para ese `user_id`).
- **Ver usuario** → `/admin/estudiantes?u=<id>`.

### 4. Controles operativos (nuevas server functions `admin.functions.ts`)

Todas con `requireSupabaseAuth` + verificación `is_admin()` server-side antes de cargar `supabaseAdmin`:

- `adminRevokeSubscription({ userId })` → llama `stripe.subscriptions.cancel(id, { prorate: false })` + `syncProfileFromSubscription`. Deja registro en `stripe_events` con `type='admin.revoked'`.
- `adminGrantPro({ userId, days })` → escribe `profiles.data` con `plan='paga'`, `accessStatus='extendido'`, `accessEnd=now()+days` sin crear suscripción real (para becas / acceso manual).
- `adminSetAILimit({ userId?, globalDailyTokens?, perUserDailyTokens? })` → guarda en tabla nueva `ai_limits` (global + per-user override).
- `adminUpdateYarisPrompt({ prompt })` → guarda en tabla `ai_config` (fila única) el system prompt actual + versión + editor.
- `adminReindexRAG({ materia? })` → dispara re-embedding del contenido en `rag_chunks` para una materia o todo.
- `adminQuery({ sql })` → **NO se implementa** — demasiado peligroso, en su lugar exponer vistas prefabricadas.

### 5. Página `/admin/operaciones/yaris`

- Editor de textarea para el system prompt de Yaris (con preview + historial de versiones).
- Tabla `rag_chunks` con contadores por materia y botón "Reindexar materia".
- Uploader para agregar nuevos documentos base (usa `supabase.storage` — hay que crear el bucket `rag-sources`).
- Slider de límites de IA (tokens/día global y por usuario del plan Pro).

### 6. Métricas: cómo se calculan

- Todo desde SQL con vistas materializadas o funciones RPC `admin_*` (SECURITY DEFINER, gate por `is_admin()`):
  - `admin_mrr()`, `admin_active_pro_count()`, `admin_churn_30d()`.
  - `admin_stripe_event_stats(hours int)`.
  - `admin_ai_usage_stats(hours int)` (requiere que Yaris registre cada call — hay que agregar tabla `ai_usage`).
  - `admin_platform_usage(hours int)` (ya se puede derivar de `activity` en `content` collection).
  - `admin_plan_drift()`.
- El front hace un solo fetch paralelo al montar `/admin/operaciones`.

### 7. Captura de errores del cliente

- `src/lib/error-capture.ts` ya existe. Extenderlo para hacer `POST /api/public/client-errors` (server route público con rate-limit por IP) que inserta en tabla `client_errors` (RLS: solo admin lee).

---

## Detalles técnicos

**Tablas nuevas** (una migración):
- `stripe_events` (audit log; unique `stripe_event_id`).
- `ai_usage` (`user_id`, `tokens_in`, `tokens_out`, `latency_ms`, `success`, `error`, `created_at`).
- `ai_limits` (fila única global + override por `user_id`).
- `ai_config` (fila única con prompt Yaris + versión).
- `client_errors` (`user_id?`, `route`, `message`, `stack`, `user_agent`, `created_at`).

Todas con GRANT `authenticated` acotado (solo lectura del propio `ai_usage` para diagnóstico), `service_role` full, RLS admin-only donde aplica vía `public.is_admin()`.

**Sidebar admin** — en `AdminShell.tsx` añadir grupo "Operaciones" con los dos items nuevos. Todo permanece detrás de `useRequireAuth("admin")` — los dos admins configurados en `handle_new_user()` heredan acceso.

**Yaris integración** — la server function que llama al AI Gateway debe leer el prompt desde `ai_config`, chequear cuota contra `ai_limits`, y registrar la llamada en `ai_usage`. Sin eso el panel de IA queda ciego.

**Reprocesar evento Stripe** — el handler actual se refactoriza para exportar `processStripeEvent(event, env)` puro; el webhook lo llama, y `adminReprocessStripeEvent(eventId)` también.

**Seguridad** — ningún endpoint admin confía en `data.userId` del cliente sin validar rol server-side; todos usan `context.userId` + `has_role('admin')` RPC antes de tocar `supabaseAdmin`. Cumple el patrón de `authenticated-owner-rls`.

**Fuera de alcance en este plan** — cambiar la lógica del webhook de Stripe más allá de la audit log; construir alertas por email/Slack (queda como TODO); implementar el reindexado RAG real (se deja el botón + server fn stub que loguea).
