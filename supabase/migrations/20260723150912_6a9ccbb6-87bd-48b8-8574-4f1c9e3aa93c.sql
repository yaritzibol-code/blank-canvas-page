
-- 1. Tabla separada para notas internas de reports (solo admin)
CREATE TABLE IF NOT EXISTS public.report_admin_notes (
  report_id text PRIMARY KEY,
  notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT ALL ON public.report_admin_notes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_admin_notes TO authenticated;

ALTER TABLE public.report_admin_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "report_admin_notes_admin_all" ON public.report_admin_notes;
CREATE POLICY "report_admin_notes_admin_all" ON public.report_admin_notes
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. Trigger que impide que notasInternas se guarde en reports.data (defensa en profundidad)
CREATE OR REPLACE FUNCTION public.strip_report_internal_notes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.data IS NOT NULL AND jsonb_typeof(NEW.data) = 'object' AND NEW.data ? 'notasInternas' THEN
    NEW.data := NEW.data - 'notasInternas';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS strip_report_internal_notes_trg ON public.reports;
CREATE TRIGGER strip_report_internal_notes_trg
BEFORE INSERT OR UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.strip_report_internal_notes();

-- 3. Restringir EXECUTE en funciones SECURITY DEFINER
-- Revocar de PUBLIC y anon en todas las funciones custom
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_data_sync_status(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.match_rag_chunks(vector, text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.seed_content(text, jsonb) FROM PUBLIC, anon;

-- Admin-only: revocar también de authenticated (ahora se invocan vía supabaseAdmin)
REVOKE EXECUTE ON FUNCTION public.admin_mrr(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_platform_stats() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_pro_stats(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_stripe_event_stats(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_ai_stats(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_mrr_daily(text, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_ai_daily(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_plan_drift(text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.admin_mrr(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_platform_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_pro_stats(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_stripe_event_stats(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_ai_stats(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_mrr_daily(text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_ai_daily(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_plan_drift(text) TO service_role;

-- Funciones trigger: solo servicio (los triggers usan el owner de la tabla, no requieren EXECUTE del cliente)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_profile_fields() FROM PUBLIC, anon, authenticated;
