-- Notificaciones del equipo admin a las alumnas (las "transmisiones de radio").
--
--   * notifications       — cada transmisión: a todas las alumnas (audience
--                           'all') o a una lista de alumnas (audience 'users' +
--                           recipients). La app la muestra como pop-up mientras
--                           está vigente: starts_at <= ahora < ends_at (ends_at
--                           null = sin fecha de fin). La respuesta a un reporte
--                           de pregunta lleva su report_id.
--   * notification_reads  — quién ya tocó "Recibido": una fila por alumna y
--                           transmisión. Con eso no se le vuelve a mostrar y la
--                           admin ve cuántas la recibieron.
--
-- RLS: sólo la admin crea, cambia o borra transmisiones, y ve todas. Cada
-- alumna lee las generales y las que la incluyen, nunca las de otra alumna.
-- Cada quien registra su propio "Recibido" (de una transmisión que puede ver);
-- la admin los lee todos.

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  audience text NOT NULL CHECK (audience IN ('all', 'users')),
  recipients uuid[] NOT NULL DEFAULT '{}',
  kind text NOT NULL DEFAULT 'aviso' CHECK (kind IN ('aviso', 'importante', 'logro', 'reporte')),
  title text NOT NULL DEFAULT '',
  body text NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  report_id text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT notifications_recipients_chk CHECK (audience = 'all' OR cardinality(recipients) > 0),
  CONSTRAINT notifications_body_chk CHECK (length(btrim(body)) > 0)
);

CREATE INDEX IF NOT EXISTS notifications_recipients_idx ON public.notifications USING gin (recipients);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON public.notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_report_idx ON public.notifications (report_id)
  WHERE report_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.notification_reads (
  notification_id uuid NOT NULL REFERENCES public.notifications (id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_id, user_id)
);

REVOKE ALL ON public.notifications, public.notification_reads FROM anon;
GRANT ALL ON public.notifications, public.notification_reads TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT ON public.notification_reads TO authenticated;
-- Supabase da ALL por omisión a authenticated en las tablas nuevas: se deja
-- sólo lo que la app usa (la RLS decide sobre qué filas). El borrado en
-- cascada de los "Recibido" lo hace la llave foránea, no necesita DELETE.
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.notifications FROM authenticated;
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.notification_reads FROM authenticated;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;
CREATE POLICY "notifications_admin_all" ON public.notifications
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notifications_select_recipient" ON public.notifications;
CREATE POLICY "notifications_select_recipient" ON public.notifications
  FOR SELECT TO authenticated
  USING (audience = 'all' OR auth.uid() = ANY (recipients));

DROP POLICY IF EXISTS "notification_reads_insert_own" ON public.notification_reads;
CREATE POLICY "notification_reads_insert_own" ON public.notification_reads
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    -- La subconsulta pasa por la RLS de notifications: sólo cuenta una
    -- transmisión que esta alumna puede ver.
    AND EXISTS (SELECT 1 FROM public.notifications n WHERE n.id = notification_id)
  );

DROP POLICY IF EXISTS "notification_reads_select_own_or_admin" ON public.notification_reads;
CREATE POLICY "notification_reads_select_own_or_admin" ON public.notification_reads
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
