CREATE TABLE public.rtari_grabaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  local_session_id text,
  storage_path text,
  duration_sec integer not null default 0,
  model text,
  nivel text,
  voice text,
  nivel_global integer,
  cost_usd numeric,
  preguntas integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, session_id)
);

GRANT SELECT, INSERT, UPDATE ON public.rtari_grabaciones TO authenticated;
GRANT ALL ON public.rtari_grabaciones TO service_role;

ALTER TABLE public.rtari_grabaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rtari_grab_own_select" ON public.rtari_grabaciones
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "rtari_grab_own_insert" ON public.rtari_grabaciones
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "rtari_grab_own_update" ON public.rtari_grabaciones
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX rtari_grabaciones_user_idx ON public.rtari_grabaciones (user_id, created_at DESC);

CREATE POLICY "rtari_audio_own_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'rtari-audio' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));
CREATE POLICY "rtari_audio_own_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'rtari-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE OR REPLACE FUNCTION public.admin_rtari_stats(days_back integer DEFAULT 30)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE WHEN public.is_admin_ctx() THEN jsonb_build_object(
    'sesiones', (SELECT count(*) FROM public.rtari_grabaciones WHERE created_at > now() - make_interval(days => days_back)),
    'minutos', (SELECT COALESCE(round(sum(duration_sec)::numeric / 60, 1), 0) FROM public.rtari_grabaciones WHERE created_at > now() - make_interval(days => days_back)),
    'con_audio', (SELECT count(*) FROM public.rtari_grabaciones WHERE storage_path IS NOT NULL AND created_at > now() - make_interval(days => days_back)),
    'costo_real_usd', (SELECT COALESCE(sum(cost_usd), 0) FROM public.ai_usage WHERE materia = 'rtari' AND cost_usd IS NOT NULL AND created_at > now() - make_interval(days => days_back)),
    'llamadas', (SELECT count(*) FROM public.ai_usage WHERE materia = 'rtari' AND created_at > now() - make_interval(days => days_back)),
    'minutos_ia', (SELECT COALESCE(round(sum(latency_ms)::numeric / 60000, 1), 0) FROM public.ai_usage WHERE materia = 'rtari' AND created_at > now() - make_interval(days => days_back))
  ) ELSE NULL END;
$function$;