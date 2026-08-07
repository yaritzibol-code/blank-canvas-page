-- Contexto administrativo: admin firmado O el servidor de la app (service_role).
CREATE OR REPLACE FUNCTION public.is_admin_ctx()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_admin() OR coalesce(auth.role(), '') = 'service_role';
$$;

REVOKE ALL ON FUNCTION public.is_admin_ctx() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_ctx() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_mrr(check_env text DEFAULT 'live'::text)
 RETURNS numeric
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(ROUND(SUM(public.plan_mrr_amount(s.price_id)), 2), 0)::numeric
  FROM public.subscriptions s
  WHERE public.is_admin_ctx()
    AND s.environment = check_env
    AND s.status IN ('active','trialing','past_due');
$function$;

CREATE OR REPLACE FUNCTION public.admin_mrr_daily(check_env text DEFAULT 'live'::text, days_back integer DEFAULT 30)
 RETURNS TABLE(day date, mrr numeric, active_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH days AS (
    SELECT generate_series((CURRENT_DATE - (days_back - 1))::date, CURRENT_DATE, '1 day')::date AS d
  )
  SELECT
    days.d AS day,
    COALESCE(ROUND(SUM(CASE WHEN s.status IN ('active','trialing','past_due')
      THEN public.plan_mrr_amount(s.price_id) ELSE 0 END), 2), 0)::numeric AS mrr,
    COUNT(*) FILTER (WHERE s.status IN ('active','trialing','past_due'))::bigint AS active_count
  FROM days
  LEFT JOIN public.subscriptions s
    ON s.environment = check_env
   AND s.created_at::date <= days.d
   AND (s.current_period_end IS NULL OR s.current_period_end::date >= days.d)
  WHERE public.is_admin_ctx()
  GROUP BY days.d
  ORDER BY days.d;
$function$;

CREATE OR REPLACE FUNCTION public.admin_ai_daily(days_back integer DEFAULT 30)
 RETURNS TABLE(day date, calls bigint, errors bigint, tokens_in bigint, tokens_out bigint, avg_latency_ms integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH days AS (
    SELECT generate_series((CURRENT_DATE - (days_back - 1))::date, CURRENT_DATE, '1 day')::date AS d
  )
  SELECT
    days.d AS day,
    COUNT(u.id)::bigint AS calls,
    COUNT(u.id) FILTER (WHERE u.success = false)::bigint AS errors,
    COALESCE(SUM(u.tokens_in), 0)::bigint AS tokens_in,
    COALESCE(SUM(u.tokens_out), 0)::bigint AS tokens_out,
    COALESCE(AVG(u.latency_ms)::int, 0) AS avg_latency_ms
  FROM days
  LEFT JOIN public.ai_usage u ON u.created_at::date = days.d
  WHERE public.is_admin_ctx()
  GROUP BY days.d
  ORDER BY days.d;
$function$;

CREATE OR REPLACE FUNCTION public.admin_ai_stats(hours_back integer DEFAULT 24)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE WHEN public.is_admin_ctx() THEN jsonb_build_object(
    'calls', (SELECT count(*) FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'errors', (SELECT count(*) FROM public.ai_usage WHERE success = false AND created_at > now() - make_interval(hours => hours_back)),
    'tokens_in', (SELECT COALESCE(sum(tokens_in),0) FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'tokens_out', (SELECT COALESCE(sum(tokens_out),0) FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'latency_p50', (SELECT COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY latency_ms), 0)::int FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'latency_p95', (SELECT COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms), 0)::int FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back))
  ) ELSE NULL END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_pro_stats(check_env text DEFAULT 'live'::text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE WHEN public.is_admin_ctx() THEN jsonb_build_object(
    'active', (SELECT count(*) FROM public.subscriptions WHERE environment = check_env AND status IN ('active','trialing')),
    'trialing', (SELECT count(*) FROM public.subscriptions WHERE environment = check_env AND status = 'trialing'),
    'past_due', (SELECT count(*) FROM public.subscriptions WHERE environment = check_env AND status = 'past_due'),
    'canceled_last_30d', (SELECT count(*) FROM public.subscriptions
      WHERE environment = check_env AND status = 'canceled' AND updated_at > now() - interval '30 days'),
    'renewing_next_7d', (SELECT count(*) FROM public.subscriptions
      WHERE environment = check_env AND status IN ('active','trialing')
      AND current_period_end BETWEEN now() AND now() + interval '7 days')
  ) ELSE NULL END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_stripe_event_stats(hours_back integer DEFAULT 24)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE WHEN public.is_admin_ctx() THEN jsonb_build_object(
    'processed', (SELECT count(*) FROM public.stripe_events WHERE status = 'processed' AND received_at > now() - make_interval(hours => hours_back)),
    'failed', (SELECT count(*) FROM public.stripe_events WHERE status = 'failed' AND received_at > now() - make_interval(hours => hours_back)),
    'ignored', (SELECT count(*) FROM public.stripe_events WHERE status = 'ignored' AND received_at > now() - make_interval(hours => hours_back)),
    'received', (SELECT count(*) FROM public.stripe_events WHERE status = 'received' AND received_at > now() - make_interval(hours => hours_back))
  ) ELSE NULL END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_platform_stats()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE WHEN public.is_admin_ctx() THEN jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'admins', (SELECT count(*) FROM public.profiles WHERE role = 'admin'),
    'reports_open', (SELECT count(*) FROM public.reports WHERE (data->>'estado') IN ('abierto','pendiente','en_proceso')),
    'reminders_last_24h', (SELECT count(*) FROM public.reminder_events WHERE created_at > now() - interval '24 hours'),
    'reminders_failed_24h', (SELECT count(*) FROM public.reminder_events WHERE status = 'failed' AND created_at > now() - interval '24 hours'),
    'rag_chunks', (SELECT count(*) FROM public.rag_chunks)
  ) ELSE NULL END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_plan_drift(check_env text DEFAULT 'live'::text)
 RETURNS TABLE(user_id uuid, email text, profile_plan text, sub_status text, current_period_end timestamp with time zone, kind text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  WHERE public.is_admin_ctx()
    AND (
      (s.status IN ('active','trialing') AND COALESCE(p.data->>'plan','basica') <> 'paga')
      OR ((s.status IS NULL OR s.status NOT IN ('active','trialing') OR s.current_period_end < now())
          AND COALESCE(p.data->>'plan','basica') = 'paga'
          AND COALESCE(p.data->>'accessStatus','activo') <> 'extendido')
    );
$function$;

CREATE OR REPLACE FUNCTION public.admin_resumen()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH students AS (
    SELECT p.id, u.created_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    WHERE p.role <> 'admin'
  ),
  quizzes AS (
    SELECT us.user_id, a
    FROM public.user_state us
    CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(us.data) = 'array' THEN us.data ELSE '[]'::jsonb END) a
    WHERE us.collection = 'quiz_attempts'
  ),
  sims AS (
    SELECT us.user_id, a
    FROM public.user_state us
    CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(us.data) = 'array' THEN us.data ELSE '[]'::jsonb END) a
    WHERE us.collection = 'sim_attempts'
  ),
  mat AS (
    SELECT kv.key AS name,
           SUM((kv.value->>'correct')::numeric) AS correct,
           SUM(NULLIF((kv.value->>'total')::numeric, 0)) AS total
    FROM quizzes q
    CROSS JOIN LATERAL jsonb_each(COALESCE(q.a->'porMateria', '{}'::jsonb)) kv
    WHERE jsonb_typeof(q.a->'porMateria') = 'object'
    GROUP BY kv.key
    HAVING SUM(NULLIF((kv.value->>'total')::numeric, 0)) >= 3
  ),
  scored AS (
    SELECT q.user_id,
           SUM((q.a->>'correct')::numeric) AS correct,
           SUM(NULLIF((q.a->>'total')::numeric, 0)) AS total
    FROM quizzes q
    GROUP BY q.user_id
  )
  SELECT CASE WHEN public.is_admin_ctx() THEN jsonb_build_object(
    'total_students', (SELECT count(*) FROM students),
    'active_students', (SELECT count(DISTINCT user_id) FROM public.user_state WHERE updated_at > now() - interval '7 days'),
    'new_last7', (SELECT count(*) FROM students WHERE created_at > now() - interval '7 days'),
    'quiz_count', (SELECT count(*) FROM quizzes),
    'sim_count', (SELECT count(*) FROM sims),
    'answered', (SELECT COALESCE(SUM((a->>'total')::numeric), 0) FROM quizzes)
                + (SELECT COALESCE(SUM((a->>'total')::numeric), 0) FROM sims),
    'avg_score', (SELECT COALESCE(ROUND(AVG(100 * correct / NULLIF(total, 0))), 0) FROM scored WHERE total > 0),
    'weakest_materias', COALESCE((
      SELECT jsonb_agg(x) FROM (
        SELECT name, ROUND(100 * correct / NULLIF(total, 0)) AS avg
        FROM mat ORDER BY 100 * correct / NULLIF(total, 0) ASC LIMIT 5
      ) x
    ), '[]'::jsonb)
  ) ELSE NULL END;
$function$;

-- Actividad (Activity Ratio): también deben responder al servidor de la app.
CREATE OR REPLACE FUNCTION public.admin_activity_overview(days_back integer DEFAULT 7)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE WHEN public.is_admin_ctx() THEN (
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
$function$;