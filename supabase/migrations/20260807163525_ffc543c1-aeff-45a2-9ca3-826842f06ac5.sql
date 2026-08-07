CREATE TABLE IF NOT EXISTS public.health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_key text NOT NULL,
  ok boolean NOT NULL DEFAULT true,
  environment text NOT NULL DEFAULT 'live',
  message text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  duration_ms integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.health_checks TO authenticated;
GRANT ALL ON public.health_checks TO service_role;

ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS health_checks_admin_read ON public.health_checks;
CREATE POLICY health_checks_admin_read ON public.health_checks
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS health_checks_created_idx ON public.health_checks (created_at DESC);
CREATE INDEX IF NOT EXISTS health_checks_key_idx ON public.health_checks (check_key, created_at DESC);

-- Presencia de respaldo: quién estuvo activo según `activity_sessions`.
CREATE OR REPLACE FUNCTION public.admin_presencia_reciente(minutes_back integer DEFAULT 15)
RETURNS TABLE(user_id uuid, email text, nombre text, plan text, role text, last_seen timestamptz, started_at timestamptz, path text, label text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT s.user_id,
         p.email,
         COALESCE(p.data->>'nombre', '') AS nombre,
         COALESCE(p.data->>'plan', 'basica') AS plan,
         COALESCE(p.role, 'student') AS role,
         max(s.last_seen_at) AS last_seen,
         min(s.started_at) AS started_at,
         (array_agg(COALESCE(s.exit_path, s.entry_path) ORDER BY s.last_seen_at DESC))[1] AS path,
         (array_agg(COALESCE(s.exit_label, s.entry_label) ORDER BY s.last_seen_at DESC))[1] AS label
  FROM public.activity_sessions s
  LEFT JOIN public.profiles p ON p.id = s.user_id
  WHERE public.is_admin_ctx()
    AND s.user_id IS NOT NULL
    AND s.last_seen_at > now() - make_interval(mins => GREATEST(LEAST(minutes_back, 240), 1))
  GROUP BY s.user_id, p.email, p.data, p.role
  ORDER BY max(s.last_seen_at) DESC
  LIMIT 200;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_presencia_reciente(integer) FROM anon;