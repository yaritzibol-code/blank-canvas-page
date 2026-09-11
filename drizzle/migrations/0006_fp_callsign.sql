ALTER TABLE public.fp_community_profiles
  ADD COLUMN IF NOT EXISTS callsign text,
  ADD COLUMN IF NOT EXISTS privacidad_elegida boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS fp_community_callsign_unico
  ON public.fp_community_profiles (callsign)
  WHERE callsign IS NOT NULL;

DROP FUNCTION IF EXISTS public.fp_leaderboard(text, text);

CREATE OR REPLACE FUNCTION public.fp_leaderboard(p_metric text, p_period text)
RETURNS TABLE (
  user_id uuid,
  nombre text,
  folio text,
  callsign text,
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
      c.callsign,
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
  SELECT b.user_id, b.nombre, b.folio, b.callsign, b.privacidad, b.avatar, b.valor, b.actividades, b.primer_at,
         ROW_NUMBER() OVER (ORDER BY b.valor DESC, b.actividades DESC, b.primer_at ASC, b.user_id ASC) AS posicion
  FROM base b
  WHERE b.valor > 0;
$$;

GRANT EXECUTE ON FUNCTION public.fp_leaderboard(text, text) TO authenticated;