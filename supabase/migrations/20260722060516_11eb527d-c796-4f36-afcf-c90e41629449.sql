
-- ============================================================
-- 1. stripe_events (audit log)
-- ============================================================
CREATE TABLE public.stripe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  type text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('sandbox','live')),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received','processed','ignored','failed')),
  error_message text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_subscription_id text,
  stripe_customer_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
CREATE INDEX idx_stripe_events_received ON public.stripe_events(received_at DESC);
CREATE INDEX idx_stripe_events_status ON public.stripe_events(status);
CREATE INDEX idx_stripe_events_user ON public.stripe_events(user_id);

GRANT SELECT ON public.stripe_events TO authenticated;
GRANT ALL ON public.stripe_events TO service_role;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read stripe events" ON public.stripe_events
  FOR SELECT TO authenticated USING (public.is_admin());

-- ============================================================
-- 2. ai_usage
-- ============================================================
CREATE TABLE public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  model text NOT NULL,
  tokens_in integer NOT NULL DEFAULT 0,
  tokens_out integer NOT NULL DEFAULT 0,
  latency_ms integer NOT NULL DEFAULT 0,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  materia text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_usage_user_created ON public.ai_usage(user_id, created_at DESC);
CREATE INDEX idx_ai_usage_created ON public.ai_usage(created_at DESC);

GRANT SELECT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own ai usage" ON public.ai_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- 3. ai_limits (single row: id=1 is global; other rows are per-user overrides)
-- ============================================================
CREATE TABLE public.ai_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  scope text NOT NULL DEFAULT 'user' CHECK (scope IN ('global','user')),
  daily_token_limit integer NOT NULL DEFAULT 100000,
  daily_call_limit integer NOT NULL DEFAULT 200,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_ai_limits_global ON public.ai_limits(scope) WHERE scope = 'global';

GRANT SELECT ON public.ai_limits TO authenticated;
GRANT ALL ON public.ai_limits TO service_role;
ALTER TABLE public.ai_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read ai limits" ON public.ai_limits
  FOR SELECT TO authenticated USING (scope = 'global' OR auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- 4. ai_config (single row for Yaris system prompt + history)
-- ============================================================
CREATE TABLE public.ai_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_config_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  value jsonb NOT NULL,
  version integer NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_config TO authenticated;
GRANT ALL ON public.ai_config TO service_role;
GRANT SELECT ON public.ai_config_history TO authenticated;
GRANT ALL ON public.ai_config_history TO service_role;
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_config_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read ai config" ON public.ai_config
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins read ai config history" ON public.ai_config_history
  FOR SELECT TO authenticated USING (public.is_admin());

-- ============================================================
-- 5. client_errors
-- ============================================================
CREATE TABLE public.client_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  route text,
  message text NOT NULL,
  stack text,
  user_agent text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_client_errors_created ON public.client_errors(created_at DESC);

GRANT SELECT ON public.client_errors TO authenticated;
GRANT ALL ON public.client_errors TO service_role;
ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read client errors" ON public.client_errors
  FOR SELECT TO authenticated USING (public.is_admin());

-- ============================================================
-- 6. Admin metrics RPCs (SECURITY DEFINER, gated by is_admin)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_mrr(check_env text DEFAULT 'live')
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT count(*) FROM public.subscriptions
      WHERE environment = check_env AND status IN ('active','trialing')) * 500,
    0
  )::numeric
  WHERE public.is_admin();
$$;

CREATE OR REPLACE FUNCTION public.admin_pro_stats(check_env text DEFAULT 'live')
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN public.is_admin() THEN jsonb_build_object(
    'active', (SELECT count(*) FROM public.subscriptions WHERE environment = check_env AND status IN ('active','trialing')),
    'trialing', (SELECT count(*) FROM public.subscriptions WHERE environment = check_env AND status = 'trialing'),
    'past_due', (SELECT count(*) FROM public.subscriptions WHERE environment = check_env AND status = 'past_due'),
    'canceled_last_30d', (SELECT count(*) FROM public.subscriptions
      WHERE environment = check_env AND status = 'canceled' AND updated_at > now() - interval '30 days'),
    'renewing_next_7d', (SELECT count(*) FROM public.subscriptions
      WHERE environment = check_env AND status IN ('active','trialing')
      AND current_period_end BETWEEN now() AND now() + interval '7 days')
  ) ELSE NULL END;
$$;

CREATE OR REPLACE FUNCTION public.admin_stripe_event_stats(hours_back integer DEFAULT 24)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN public.is_admin() THEN jsonb_build_object(
    'processed', (SELECT count(*) FROM public.stripe_events WHERE status = 'processed' AND received_at > now() - make_interval(hours => hours_back)),
    'failed', (SELECT count(*) FROM public.stripe_events WHERE status = 'failed' AND received_at > now() - make_interval(hours => hours_back)),
    'ignored', (SELECT count(*) FROM public.stripe_events WHERE status = 'ignored' AND received_at > now() - make_interval(hours => hours_back)),
    'received', (SELECT count(*) FROM public.stripe_events WHERE status = 'received' AND received_at > now() - make_interval(hours => hours_back))
  ) ELSE NULL END;
$$;

CREATE OR REPLACE FUNCTION public.admin_ai_stats(hours_back integer DEFAULT 24)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN public.is_admin() THEN jsonb_build_object(
    'calls', (SELECT count(*) FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'errors', (SELECT count(*) FROM public.ai_usage WHERE success = false AND created_at > now() - make_interval(hours => hours_back)),
    'tokens_in', (SELECT COALESCE(sum(tokens_in),0) FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'tokens_out', (SELECT COALESCE(sum(tokens_out),0) FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'latency_p50', (SELECT COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY latency_ms), 0)::int FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'latency_p95', (SELECT COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms), 0)::int FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back))
  ) ELSE NULL END;
$$;

CREATE OR REPLACE FUNCTION public.admin_platform_stats()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN public.is_admin() THEN jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'admins', (SELECT count(*) FROM public.profiles WHERE role = 'admin'),
    'reports_open', (SELECT count(*) FROM public.reports WHERE (data->>'estado') = 'abierto'),
    'reminders_last_24h', (SELECT count(*) FROM public.reminder_events WHERE created_at > now() - interval '24 hours'),
    'reminders_failed_24h', (SELECT count(*) FROM public.reminder_events WHERE status = 'failed' AND created_at > now() - interval '24 hours'),
    'rag_chunks', (SELECT count(*) FROM public.rag_chunks)
  ) ELSE NULL END;
$$;

CREATE OR REPLACE FUNCTION public.admin_plan_drift(check_env text DEFAULT 'live')
RETURNS TABLE(user_id uuid, email text, profile_plan text, sub_status text, current_period_end timestamptz, kind text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.email, (p.data->>'plan')::text,
         s.status, s.current_period_end,
         CASE
           WHEN s.status IN ('active','trialing') AND COALESCE(p.data->>'plan','basica') <> 'paga' THEN 'active_sub_basica_profile'
           WHEN (s.status NOT IN ('active','trialing') OR s.current_period_end < now())
                AND COALESCE(p.data->>'plan','basica') = 'paga'
                AND COALESCE(p.data->>'accessStatus','activo') <> 'extendido' THEN 'no_sub_paga_profile'
           ELSE NULL
         END AS kind
  FROM public.profiles p
  LEFT JOIN LATERAL (
    SELECT status, current_period_end FROM public.subscriptions
    WHERE user_id = p.id AND environment = check_env
    ORDER BY created_at DESC LIMIT 1
  ) s ON true
  WHERE public.is_admin()
    AND (
      (s.status IN ('active','trialing') AND COALESCE(p.data->>'plan','basica') <> 'paga')
      OR ((s.status IS NULL OR s.status NOT IN ('active','trialing') OR s.current_period_end < now())
          AND COALESCE(p.data->>'plan','basica') = 'paga'
          AND COALESCE(p.data->>'accessStatus','activo') <> 'extendido')
    );
$$;

-- ============================================================
-- 7. Seed default AI config and global limit
-- ============================================================
INSERT INTO public.ai_config (key, value, version)
VALUES (
  'yaris_system_prompt',
  jsonb_build_object(
    'prompt', 'Eres Yaris, tutora académica de FlightPath. Ayudas a estudiantes que preparan el examen CIAAC de piloto comercial en México. Responde SIEMPRE en español, con un tono cálido pero técnico. Usa el contexto del curso (fragmentos de libros y explicaciones) como fuente principal; si no hay contexto suficiente, dilo. Cita la materia y el tema cuando sea posible. No inventes reglamentos ni cifras.',
    'notes', 'Prompt inicial. Editable desde el panel admin.'
  ),
  1
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.ai_limits (scope, daily_token_limit, daily_call_limit)
VALUES ('global', 500000, 1000)
ON CONFLICT DO NOTHING;
