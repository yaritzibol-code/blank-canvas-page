-- ══════════════════ FlightPoints: sistema central de gamificación ══════════════════

-- Reglas configurables (fuente única de los montos de FP)
CREATE TABLE public.fp_rules (
  key text PRIMARY KEY,
  label text NOT NULL,
  categoria text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  orden integer NOT NULL DEFAULT 0,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fp_rules TO authenticated;
GRANT ALL ON public.fp_rules TO service_role;
ALTER TABLE public.fp_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_rules lectura autenticada" ON public.fp_rules FOR SELECT TO authenticated USING (true);

-- Historial de cambios de reglas
CREATE TABLE public.fp_rules_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  old_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  new_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  updated_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fp_rules_history TO authenticated;
GRANT ALL ON public.fp_rules_history TO service_role;
ALTER TABLE public.fp_rules_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_rules_history solo admin" ON public.fp_rules_history FOR SELECT TO authenticated USING (public.is_admin());

-- Transacciones (fuente de verdad de los FP)
CREATE TABLE public.fp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_key text NOT NULL,
  rule_key text NOT NULL,
  kind text NOT NULL DEFAULT 'base',
  amount integer NOT NULL DEFAULT 0,
  program text,
  activity_type text NOT NULL,
  activity_id text,
  activity_label text NOT NULL DEFAULT '',
  detail text,
  status text NOT NULL DEFAULT 'procesada',
  reverses_id uuid,
  rule_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX fp_tx_event_unico ON public.fp_transactions (user_id, event_key);
CREATE INDEX fp_tx_user_fecha ON public.fp_transactions (user_id, occurred_at DESC);
CREATE INDEX fp_tx_programa ON public.fp_transactions (program, occurred_at DESC);
GRANT SELECT ON public.fp_transactions TO authenticated;
GRANT ALL ON public.fp_transactions TO service_role;
ALTER TABLE public.fp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_tx propias o admin" ON public.fp_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Saldo agregado (caché reconciliable con las transacciones)
CREATE TABLE public.fp_balances (
  user_id uuid PRIMARY KEY,
  total integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fp_balances TO authenticated;
GRANT ALL ON public.fp_balances TO service_role;
ALTER TABLE public.fp_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_balances propio o admin" ON public.fp_balances FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Perfil público de Comunidad (folio, privacidad, tutorial, métricas publicadas)
CREATE TABLE public.fp_community_profiles (
  user_id uuid PRIMARY KEY,
  folio text NOT NULL UNIQUE,
  privacidad text NOT NULL DEFAULT 'folio',
  tutorial_visto boolean NOT NULL DEFAULT false,
  tutorial_oculto boolean NOT NULL DEFAULT false,
  racha_actual integer NOT NULL DEFAULT 0,
  racha_max integer NOT NULL DEFAULT 0,
  logros integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fp_community_profiles TO authenticated;
GRANT ALL ON public.fp_community_profiles TO service_role;
ALTER TABLE public.fp_community_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_community propio o admin" ON public.fp_community_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Alertas de comportamiento anómalo
CREATE TABLE public.fp_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  tipo text NOT NULL,
  mensaje text NOT NULL,
  detalle jsonb NOT NULL DEFAULT '{}'::jsonb,
  revisada boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fp_alerts_fecha ON public.fp_alerts (created_at DESC);
GRANT SELECT ON public.fp_alerts TO authenticated;
GRANT ALL ON public.fp_alerts TO service_role;
ALTER TABLE public.fp_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fp_alerts solo admin" ON public.fp_alerts FOR SELECT TO authenticated USING (public.is_admin());

-- ── Rankings ──
-- Devuelve la tabla completa ordenada con posición; el servidor recorta Top 5 y vecinos.
CREATE OR REPLACE FUNCTION public.fp_leaderboard(p_metric text, p_period text)
RETURNS TABLE (
  user_id uuid,
  nombre text,
  folio text,
  privacidad text,
  avatar text,
  valor bigint,
  actividades bigint,
  primer_at timestamptz,
  posicion bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH desde AS (
    SELECT CASE
      WHEN p_period = 'semana' THEN date_trunc('week', (now() AT TIME ZONE 'America/Mexico_City')) AT TIME ZONE 'America/Mexico_City'
      WHEN p_period = 'mes' THEN date_trunc('month', (now() AT TIME ZONE 'America/Mexico_City')) AT TIME ZONE 'America/Mexico_City'
      ELSE '-infinity'::timestamptz
    END AS d
  ),
  base AS (
    SELECT
      c.user_id,
      COALESCE(NULLIF(p.data->>'nombre', ''), split_part(p.email, '@', 1)) AS nombre,
      c.folio,
      c.privacidad,
      NULLIF(p.data->>'avatarPath', '') AS avatar,
      CASE
        WHEN p_metric = 'racha' THEN c.racha_max::bigint
        WHEN p_metric = 'logros' THEN c.logros::bigint
        ELSE COALESCE((
          SELECT SUM(t.amount) FROM fp_transactions t, desde
          WHERE t.user_id = c.user_id
            AND t.status = 'procesada'
            AND t.occurred_at >= desde.d
            AND (p_metric = 'general' OR t.program = upper(p_metric))
        ), 0)
      END AS valor,
      COALESCE((
        SELECT COUNT(*) FROM fp_transactions t, desde
        WHERE t.user_id = c.user_id AND t.status = 'procesada' AND t.occurred_at >= desde.d
      ), 0) AS actividades,
      COALESCE((
        SELECT MIN(t.occurred_at) FROM fp_transactions t
        WHERE t.user_id = c.user_id AND t.status = 'procesada'
      ), now()) AS primer_at
    FROM fp_community_profiles c
    JOIN profiles p ON p.id = c.user_id
    WHERE COALESCE(p.role, 'student') <> 'admin'
  )
  SELECT b.user_id, b.nombre, b.folio, b.privacidad, b.avatar, b.valor, b.actividades, b.primer_at,
         ROW_NUMBER() OVER (ORDER BY b.valor DESC, b.actividades DESC, b.primer_at ASC, b.user_id ASC) AS posicion
  FROM base b
  WHERE b.valor > 0;
$$;
GRANT EXECUTE ON FUNCTION public.fp_leaderboard(text, text) TO authenticated;

-- ── Economía (solo admin) ──
CREATE OR REPLACE FUNCTION public.fp_economy()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  res jsonb;
  ini_semana timestamptz := date_trunc('week', (now() AT TIME ZONE 'America/Mexico_City')) AT TIME ZONE 'America/Mexico_City';
  ini_mes timestamptz := date_trunc('month', (now() AT TIME ZONE 'America/Mexico_City')) AT TIME ZONE 'America/Mexico_City';
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'no autorizado';
  END IF;
  SELECT jsonb_build_object(
    'semana', COALESCE((SELECT SUM(amount) FROM fp_transactions WHERE status='procesada' AND occurred_at >= ini_semana), 0),
    'mes', COALESCE((SELECT SUM(amount) FROM fp_transactions WHERE status='procesada' AND occurred_at >= ini_mes), 0),
    'historico', COALESCE((SELECT SUM(amount) FROM fp_transactions WHERE status='procesada'), 0),
    'usuarios', COALESCE((SELECT COUNT(DISTINCT user_id) FROM fp_transactions WHERE status='procesada'), 0),
    'transacciones', COALESCE((SELECT COUNT(*) FROM fp_transactions WHERE status='procesada'), 0),
    'por_actividad', COALESCE((
      SELECT jsonb_agg(x) FROM (
        SELECT activity_type AS tipo, SUM(amount)::bigint AS fp, COUNT(*)::bigint AS n
        FROM fp_transactions WHERE status='procesada'
        GROUP BY activity_type ORDER BY SUM(amount) DESC
      ) x), '[]'::jsonb),
    'por_programa', COALESCE((
      SELECT jsonb_agg(x) FROM (
        SELECT COALESCE(program, 'SIN_CLASIFICAR') AS programa, SUM(amount)::bigint AS fp, COUNT(*)::bigint AS n
        FROM fp_transactions WHERE status='procesada'
        GROUP BY COALESCE(program, 'SIN_CLASIFICAR') ORDER BY SUM(amount) DESC
      ) x), '[]'::jsonb)
  ) INTO res;
  RETURN res;
END;
$$;
GRANT EXECUTE ON FUNCTION public.fp_economy() TO authenticated;