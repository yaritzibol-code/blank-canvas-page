
-- Serie diaria de MRR estimado (basada en subs activas creadas hasta ese día)
CREATE OR REPLACE FUNCTION public.admin_mrr_daily(check_env text DEFAULT 'live', days_back integer DEFAULT 30)
RETURNS TABLE(day date, mrr numeric, active_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH days AS (
    SELECT generate_series((CURRENT_DATE - (days_back - 1))::date, CURRENT_DATE, '1 day')::date AS d
  )
  SELECT
    days.d AS day,
    COALESCE(SUM(CASE WHEN s.status IN ('active','trialing') THEN 500 ELSE 0 END), 0)::numeric AS mrr,
    COUNT(*) FILTER (WHERE s.status IN ('active','trialing'))::bigint AS active_count
  FROM days
  LEFT JOIN public.subscriptions s
    ON s.environment = check_env
   AND s.created_at::date <= days.d
   AND (s.current_period_end IS NULL OR s.current_period_end >= days.d)
  WHERE public.is_admin()
  GROUP BY days.d
  ORDER BY days.d;
$$;

-- Serie diaria de uso real de Yaris (última 30 días)
CREATE OR REPLACE FUNCTION public.admin_ai_daily(days_back integer DEFAULT 30)
RETURNS TABLE(day date, calls bigint, errors bigint, tokens_in bigint, tokens_out bigint, avg_latency_ms integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
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
  LEFT JOIN public.ai_usage u
    ON u.created_at::date = days.d
  WHERE public.is_admin()
  GROUP BY days.d
  ORDER BY days.d;
$$;

-- Chequeo de sincronización para el usuario en sesión (no requiere admin).
CREATE OR REPLACE FUNCTION public.user_data_sync_status(check_env text DEFAULT 'live')
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
declare
  v_user uuid := auth.uid();
  v_profile_plan text;
  v_access_status text;
  v_sub_status text;
  v_sub_end timestamptz;
  v_has_events boolean;
  v_has_progress boolean;
  v_drift text := null;
begin
  if v_user is null then return jsonb_build_object('authenticated', false); end if;

  select coalesce(data->>'plan','basica'), coalesce(data->>'accessStatus','activo')
    into v_profile_plan, v_access_status
  from public.profiles where id = v_user;

  select status, current_period_end into v_sub_status, v_sub_end
  from public.subscriptions
  where user_id = v_user and environment = check_env
  order by created_at desc limit 1;

  select exists(
    select 1 from public.user_state where user_id = v_user and collection in ('quiz_attempts','sim_attempts','activity')
  ) into v_has_events;

  select exists(
    select 1 from public.user_state where user_id = v_user and collection in ('tema_progress','clase_progress')
  ) into v_has_progress;

  if v_sub_status in ('active','trialing') and v_profile_plan <> 'paga' then
    v_drift := 'sub_active_but_profile_basica';
  elsif (v_sub_status is null or v_sub_status not in ('active','trialing')
         or (v_sub_end is not null and v_sub_end < now()))
    and v_profile_plan = 'paga' and v_access_status <> 'extendido' then
    v_drift := 'profile_pro_but_no_active_sub';
  end if;

  return jsonb_build_object(
    'authenticated', true,
    'profile_plan', v_profile_plan,
    'access_status', v_access_status,
    'sub_status', v_sub_status,
    'sub_end', v_sub_end,
    'has_events', coalesce(v_has_events, false),
    'has_progress', coalesce(v_has_progress, false),
    'drift', v_drift
  );
end;
$$;

REVOKE ALL ON FUNCTION public.admin_mrr_daily(text, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_ai_daily(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_mrr_daily(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_ai_daily(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_data_sync_status(text) TO authenticated;
