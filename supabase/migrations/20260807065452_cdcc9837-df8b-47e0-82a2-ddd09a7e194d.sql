
CREATE OR REPLACE FUNCTION public.plan_mrr_amount(p_price_id text)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN p_price_id ILIKE '%annual%' OR p_price_id ILIKE '%anual%' OR p_price_id ILIKE '%year%'
      THEN 5000::numeric / 12
    ELSE 500::numeric
  END;
$$;

CREATE OR REPLACE FUNCTION public.admin_mrr(check_env text DEFAULT 'live'::text)
RETURNS numeric
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(ROUND(SUM(public.plan_mrr_amount(s.price_id)), 2), 0)::numeric
  FROM public.subscriptions s
  WHERE public.is_admin()
    AND s.environment = check_env
    AND s.status IN ('active','trialing','past_due');
$$;

CREATE OR REPLACE FUNCTION public.admin_mrr_daily(check_env text DEFAULT 'live'::text, days_back integer DEFAULT 30)
RETURNS TABLE(day date, mrr numeric, active_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  WHERE public.is_admin()
  GROUP BY days.d
  ORDER BY days.d;
$$;

CREATE OR REPLACE FUNCTION public.admin_resumen()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  SELECT CASE WHEN public.is_admin() THEN jsonb_build_object(
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
$$;
