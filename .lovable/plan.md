## Alcance

Nueve entregables. Ejecuto en el orden listado al final para no bloquearme.

### 1. Admins
- Admins autorizados: `rdaniel.guzman@glassway.mx` y `yaritzi.bol@glassway.mx`.
- `admin@flightpath.mx` deja de ser admin.
- Migración:
  - `update profiles set role='student' where email='admin@flightpath.mx';`
  - `update profiles set role='admin' where email in ('rdaniel.guzman@glassway.mx','yaritzi.bol@glassway.mx');`
  - Reescribir `handle_new_user()`: el rol admin sólo se asigna si el correo está en esa lista (o si aún no existe ningún perfil, para bootstrap).

### 2. Módulos "En construcción" para no-admin
Aplica a Learning Paths, Estudiemos Juntos, Flashcards, Clases Grabadas. Admin entra normal.
- Componente `<UnderConstruction />` compartido.
- Gate en `dashboard/materias/$subjectId`, `dashboard/estudiemos`, `dashboard/flashcards`, `dashboard/clases`.
- Pro NO desbloquea estos 4 módulos aún — sólo admin. Documentado.

### 3. Stripe con dos tiers
- Uso **Seamless Stripe payments** (`enable_stripe_payments`). Básica $0 MXN/mes, Pro $500 MXN/mes.
- Nuevo plan default `basica`.
- Gating:
  - Básica: cuestionario y simulador con las mismas 10 preguntas por materia (determinista por seed), máximo 2 intentos totales de por vida; sin Yaris/IA.
  - Pro: cuestionario/simulador ilimitados y Yaris con IA.
- Refactor `gating.ts`: `canStartSimulator`, `canStartQuiz`, `canUseAI`.
- UI `/dashboard/planes` con tarjetas Básica/Pro y CTA Stripe. Botón "Upgrade" en topbar cuando plan=basica.
- Sustituyo las edge functions Stripe existentes por server functions TanStack (`checkout`, `portal`, `refreshSubscription`).

### 4. Yaris con RAG real
- Migración: `create extension vector`; tabla `rag_chunks(id, source_type, source_id, materia, content, embedding vector(3072), metadata jsonb)` + índice HNSW halfvec + RPC `match_rag_chunks(query_embedding, materia_filter, match_count)`.
- Server function `rag-reindex` (admin only): itera `content` (banco de preguntas + explanations) y biblioteca; chunk 800 chars con overlap 100; embed con `google/gemini-embedding-001`; upsert.
- Server function `yaris-chat` (Pro/admin only):
  1. Recibe `{ messages, context: { questionId?, materia? } }`.
  2. Embed última pregunta del usuario + inyecta explanation de la pregunta actual si aplica.
  3. `match_rag_chunks` top 6 (filtrando por materia si viene).
  4. Llama `google/gemini-3-flash-preview` con prompt de instructor CIAAC y cita fuentes por título.
  5. Devuelve `{ reply, sources: [{title, snippet}] }`.
- `YarisChatModal` conectado al endpoint. Si `!canUseAI` → upsell.
- Botón admin "Reindexar RAG".

### 5. Recordatorios reales + webhook WhatsApp (n8n)
- Migración: tabla `reminder_events(id, user_id, reminder_id, scheduled_for, sent_at, status, payload)` + índices + RLS.
- WhatsApp E.164 MX derivado del perfil (`5215510203040`).
- Server function `send-whatsapp-reminder` invocada por pg_cron cada minuto vía `/api/public/cron/reminders`:
  - Busca recordatorios `enabled=true` cuya hora/día toque hoy y no se hayan enviado hoy;
  - POST a `WHATSAPP_WEBHOOK_URL` (n8n) con `{ to: "5215510203040", message: "...", reminderId, userId }`;
  - Registra en `reminder_events`.
- Secret `WHATSAPP_WEBHOOK_URL` (n8n) — lo pido en un turno aparte.
- `pg_cron` + `pg_net` con `apikey` del anon key.
- UI Recordatorios: crear/editar/borrar filas en `reminders`, validar WhatsApp del perfil, botón "Enviar prueba ahora".

### 6. Configuración funcional
- Persistir prefs (tema, tamaño texto, toggles) → `profiles.data.prefs`.
- Cambiar contraseña.
- Cambiar WhatsApp con validación E.164 MX.
- Desactivar cuenta (`deactivatedAt` ya modelado).

### 7. Ayuda/Soporte con back-link correcto
- `/faq`, `/legal`, `/blog`: si `getSessionUser()` existe → link "Volver al dashboard"; si no → "Volver al login". Nunca fuerza al home.

### 8. Métricas reales por perfil
Reemplazar hardcodes en `dashboard/index.tsx` y `dashboard/analisis.tsx`:
- Racha diaria desde `study_days` (días consecutivos con >0s).
- Materia más activa: agregación por `activity` filtrada por `userId`.
- Promedio de sesión: media de `activity.durationMin` últimos 30 días.
- Progreso por materia: `tema_progress` completados / total temas por materia.
- Simuladores: totales/aprobados/promedio desde `sim_attempts`.
- Cuestionarios: agregaciones desde `quiz_attempts`.
- Uso las funciones que ya viven en `analytics.ts`; completo lo que falte.

### 9. Ordenamiento
- Consolidar edge functions Stripe → server functions.
- Eliminar código muerto de billing local.

## Detalles técnicos

**Migraciones**
```sql
-- 1. Admins
update profiles set role='student' where email='admin@flightpath.mx';
update profiles set role='admin'
  where email in ('rdaniel.guzman@glassway.mx','yaritzi.bol@glassway.mx');
-- + handle_new_user() reescrita con lista de admins autorizados

-- 2. pgvector + RAG (extensión, tabla, índice HNSW halfvec, RPC, RLS, GRANTs)
-- 3. reminder_events (tabla, RLS, GRANTs)
-- 4. pg_cron.schedule('reminders-tick', '* * * * *', ...)
-- 5. subscribers (email pk, subscribed, tier, current_period_end, stripe_customer_id, RLS, GRANTs)
```

**Server functions nuevas** (todas en `src/lib/*.functions.ts`):
- `checkout.functions.ts` — `startCheckout({tier})`, `openPortal()`, `refreshSubscription()`
- `yaris.functions.ts` — `chat({messages, context})`
- `rag.functions.ts` — `reindex()` admin-only
- `reminders.functions.ts` — `sendTest({reminderId})`

**Rutas públicas**:
- `src/routes/api/public/cron/reminders.ts` — POST protegido por anon key.
- `src/routes/api/public/webhooks/stripe.ts` — opcional, para downgrade automático.

**Secretos**:
- Stripe → `enable_stripe_payments`.
- `WHATSAPP_WEBHOOK_URL` → `add_secret` en turno aparte.

## Orden de ejecución

1. Migración admins + fix `handle_new_user`.
2. Enable Stripe payments.
3. Server functions checkout/plan + gating básica/pro (10 preguntas, 2 intentos, sin IA).
4. Under-construction gates de los 4 módulos.
5. Migración pgvector + RAG; server function `rag-reindex`; Yaris chat + UI.
6. Secret `WHATSAPP_WEBHOOK_URL` + `reminder_events` + endpoint cron + pg_cron + UI recordatorios.
7. Configuración funcional + back-links FAQ/legal/blog.
8. Métricas reales dashboard/análisis.

## Fuera de alcance

- Los 4 módulos quedan bloqueados aun para Pro (sólo admin) hasta nueva instrucción.
- Sin webhook Stripe entrante para downgrade inmediato — bajas se detectan al siguiente `refreshSubscription`. Puedo añadirlo si lo pides.
- El proveedor WhatsApp queda como `WHATSAPP_WEBHOOK_URL` genérico para n8n; añado headers custom si n8n los requiere.
