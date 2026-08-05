-- 1) El banco de preguntas deja de ser legible en bloque desde el cliente
DROP POLICY IF EXISTS content_select_authenticated ON public.content;
CREATE POLICY content_select_authenticated ON public.content
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND (collection <> 'questions' OR public.is_admin())
);

-- 2) Entrega acotada de preguntas (lotes limitados, orden aleatorio)
CREATE OR REPLACE FUNCTION public.get_bank_questions(
  p_materias text[] DEFAULT NULL,
  p_fuentes text[] DEFAULT NULL,
  p_caps int[] DEFAULT NULL,
  p_ids text[] DEFAULT NULL,
  p_scope text DEFAULT 'all',
  p_limit int DEFAULT 200,
  p_offset int DEFAULT 0,
  p_ordered boolean DEFAULT false
)
RETURNS SETOF jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin boolean := public.is_admin();
  v_limit int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF v_admin THEN
    v_limit := LEAST(COALESCE(p_limit, 1000), 2000);
  ELSE
    v_limit := LEAST(GREATEST(COALESCE(p_limit, 200), 1), 600);
  END IF;

  RETURN QUERY
  SELECT c.data
  FROM public.content c
  WHERE c.collection = 'questions'
    AND c.data->>'status' = 'publicada'
    AND (p_ids IS NOT NULL OR p_scope <> 'ciaac' OR COALESCE(c.data->>'fuente', '') = '')
    AND (p_ids IS NOT NULL OR p_scope <> 'la' OR COALESCE(c.data->>'fuente', '') <> '')
    AND (p_ids IS NULL OR c.data->>'id' = ANY(p_ids))
    AND (p_materias IS NULL OR c.data->>'materia' = ANY(p_materias))
    AND (p_fuentes IS NULL OR COALESCE(c.data->>'fuente', '') = ANY(p_fuentes))
    AND (
      p_caps IS NULL
      OR COALESCE(NULLIF(c.data->>'capitulo', ''), '0')::int = ANY(p_caps)
    )
  ORDER BY
    CASE WHEN p_ordered OR p_ids IS NOT NULL THEN c.id END NULLS LAST,
    CASE WHEN p_ordered OR p_ids IS NOT NULL THEN NULL ELSE random() END
  LIMIT v_limit
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$$;

REVOKE ALL ON FUNCTION public.get_bank_questions(text[], text[], int[], text[], text, int, int, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_bank_questions(text[], text[], int[], text[], text, int, int, boolean) TO authenticated;

-- 3) Conteos (no exponen contenido)
CREATE OR REPLACE FUNCTION public.get_bank_counts()
RETURNS TABLE(materia text, fuente text, capitulo int, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    COALESCE(c.data->>'materia', '') AS materia,
    COALESCE(c.data->>'fuente', '') AS fuente,
    COALESCE(NULLIF(c.data->>'capitulo', ''), '0')::int AS capitulo,
    count(*)::bigint AS total
  FROM public.content c
  WHERE c.collection = 'questions'
    AND c.data->>'status' = 'publicada'
    AND auth.uid() IS NOT NULL
  GROUP BY 1, 2, 3;
$$;

REVOKE ALL ON FUNCTION public.get_bank_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_bank_counts() TO authenticated;