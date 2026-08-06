-- ─────────────────────────── Sesiones de navegación ───────────────────────────
CREATE TABLE public.activity_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_key TEXT NOT NULL UNIQUE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  entry_path TEXT NOT NULL DEFAULT '/',
  entry_label TEXT,
  exit_path TEXT,
  exit_label TEXT,
  screen_count INTEGER NOT NULL DEFAULT 1,
  engaged_ms INTEGER NOT NULL DEFAULT 0,
  is_bounce BOOLEAN NOT NULL DEFAULT true,
  device TEXT NOT NULL DEFAULT 'desconocido',
  referrer TEXT,
  utm JSONB NOT NULL DEFAULT '{}'::jsonb,
  plan TEXT,
  onboarding_step TEXT,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.activity_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.activity_sessions TO anon;
GRANT ALL ON public.activity_sessions TO service_role;

ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_sessions_insert_own"
  ON public.activity_sessions FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "activity_sessions_update_own"
  ON public.activity_sessions FOR UPDATE
  USING (user_id IS NULL OR user_id = auth.uid())
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "activity_sessions_select_own_or_admin"
  ON public.activity_sessions FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE INDEX activity_sessions_started_idx ON public.activity_sessions (started_at DESC);
CREATE INDEX activity_sessions_user_idx ON public.activity_sessions (user_id, started_at DESC);

-- ────────────────────────────── Eventos puntuales ─────────────────────────────
CREATE TABLE public.activity_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.activity_sessions(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'view',
  path TEXT,
  label TEXT,
  step TEXT,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.activity_events TO authenticated;
GRANT SELECT, INSERT ON public.activity_events TO anon;
GRANT ALL ON public.activity_events TO service_role;

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_events_insert_own"
  ON public.activity_events FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "activity_events_select_own_or_admin"
  ON public.activity_events FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE INDEX activity_events_created_idx ON public.activity_events (created_at DESC);
CREATE INDEX activity_events_session_idx ON public.activity_events (session_id, created_at);
CREATE INDEX activity_events_user_idx ON public.activity_events (user_id, created_at DESC);
CREATE INDEX activity_events_type_idx ON public.activity_events (type, created_at DESC);

-- updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER activity_sessions_touch
  BEFORE UPDATE ON public.activity_sessions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ───────────────────────────── Reportes para admin ────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_activity_overview(days_back integer DEFAULT 7)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE WHEN public.is_admin() THEN (
    SELECT jsonb_build_object(
      'sessions', count(*),
      'users', count(DISTINCT s.user_id),
      'anon_sessions', count(*) FILTER (WHERE s.user_id IS NULL),
      'bounces', count(*) FILTER (WHERE s.is_bounce),
      'bounce_rate', CASE WHEN count(*) = 0 THEN 0
        ELSE round((count(*) FILTER (WHERE s.is_bounce))::numeric * 100 / count(*), 1) END,
      'avg_engaged_ms', COALESCE(round(avg(s.engaged_ms))::int, 0),
      'avg_screens', COALESCE(round(avg(s.screen_count), 2), 0),
      'onboarding_done', count(*) FILTER (WHERE s.onboarding_done),
      'onboarding_started', count(*) FILTER (WHERE s.onboarding_step IS NOT NULL)
    )
    FROM public.activity_sessions s
    WHERE s.started_at > now() - make_interval(days => days_back)
  ) ELSE NULL END;
$$;

CREATE OR REPLACE FUNCTION public.admin_activity_by_screen(days_back integer DEFAULT 7)
RETURNS TABLE(path text, label text, entries bigint, bounces bigint, bounce_rate numeric, exits bigint, views bigint, avg_ms integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH win AS (SELECT now() - make_interval(days => days_back) AS t0),
  ent AS (
    SELECT s.entry_path AS p, count(*) AS entries, count(*) FILTER (WHERE s.is_bounce) AS bounces
    FROM public.activity_sessions s, win WHERE s.started_at > win.t0 GROUP BY 1
  ),
  ex AS (
    SELECT s.exit_path AS p, count(*) AS exits
    FROM public.activity_sessions s, win WHERE s.started_at > win.t0 AND s.exit_path IS NOT NULL GROUP BY 1
  ),
  vw AS (
    SELECT e.path AS p, max(e.label) AS label, count(*) AS views, COALESCE(round(avg(NULLIF(e.duration_ms,0)))::int,0) AS avg_ms
    FROM public.activity_events e, win
    WHERE e.created_at > win.t0 AND e.type = 'view' AND e.path IS NOT NULL GROUP BY 1
  )
  SELECT COALESCE(vw.p, ent.p, ex.p) AS path,
         COALESCE(vw.label, COALESCE(vw.p, ent.p, ex.p)) AS label,
         COALESCE(ent.entries, 0) AS entries,
         COALESCE(ent.bounces, 0) AS bounces,
         CASE WHEN COALESCE(ent.entries,0) = 0 THEN 0
              ELSE round(ent.bounces::numeric * 100 / ent.entries, 1) END AS bounce_rate,
         COALESCE(ex.exits, 0) AS exits,
         COALESCE(vw.views, 0) AS views,
         COALESCE(vw.avg_ms, 0) AS avg_ms
  FROM vw
  FULL JOIN ent ON ent.p = vw.p
  FULL JOIN ex ON ex.p = COALESCE(vw.p, ent.p)
  WHERE public.is_admin()
  ORDER BY COALESCE(vw.views, 0) DESC, entries DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_activity_funnel(days_back integer DEFAULT 7)
RETURNS TABLE(step text, people bigint, sessions bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.step,
         count(DISTINCT COALESCE(e.user_id::text, e.session_key)) AS people,
         count(*) AS sessions
  FROM public.activity_events e
  WHERE public.is_admin()
    AND e.created_at > now() - make_interval(days => days_back)
    AND e.type IN ('milestone','abandon')
    AND e.step IS NOT NULL
  GROUP BY e.step
  ORDER BY people DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_activity_users(days_back integer DEFAULT 7, max_rows integer DEFAULT 100)
RETURNS TABLE(user_id uuid, email text, nombre text, plan text, sessions bigint, engaged_ms bigint, screens bigint, bounces bigint, onboarding_done boolean, last_seen timestamp with time zone, last_path text, last_label text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.user_id,
         p.email,
         COALESCE(p.data->>'nombre', '') AS nombre,
         COALESCE(p.data->>'plan', 'basica') AS plan,
         count(*) AS sessions,
         COALESCE(sum(s.engaged_ms), 0)::bigint AS engaged_ms,
         COALESCE(sum(s.screen_count), 0)::bigint AS screens,
         count(*) FILTER (WHERE s.is_bounce) AS bounces,
         bool_or(s.onboarding_done) AS onboarding_done,
         max(s.last_seen_at) AS last_seen,
         (array_agg(COALESCE(s.exit_path, s.entry_path) ORDER BY s.last_seen_at DESC))[1] AS last_path,
         (array_agg(COALESCE(s.exit_label, s.entry_label) ORDER BY s.last_seen_at DESC))[1] AS last_label
  FROM public.activity_sessions s
  LEFT JOIN public.profiles p ON p.id = s.user_id
  WHERE public.is_admin()
    AND s.user_id IS NOT NULL
    AND s.started_at > now() - make_interval(days => days_back)
  GROUP BY s.user_id, p.email, p.data
  ORDER BY max(s.last_seen_at) DESC
  LIMIT LEAST(COALESCE(max_rows, 100), 500);
$$;

CREATE OR REPLACE FUNCTION public.admin_activity_user_timeline(target_user uuid, max_rows integer DEFAULT 200)
RETURNS TABLE(created_at timestamp with time zone, type text, path text, label text, step text, duration_ms integer, metadata jsonb)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.created_at, e.type, e.path, e.label, e.step, e.duration_ms, e.metadata
  FROM public.activity_events e
  WHERE public.is_admin() AND e.user_id = target_user
  ORDER BY e.created_at DESC
  LIMIT LEAST(COALESCE(max_rows, 200), 1000);
$$;