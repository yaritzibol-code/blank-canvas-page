-- Mirror esPreguntaHelicoptero: strong terms in all fields; contextual terms
-- only in the heading/question/options/citation (ordinary rotor clouds stay).
CREATE OR REPLACE FUNCTION public.is_atp_helicopter(q jsonb)
RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $function$
  WITH fields AS (
    SELECT concat_ws(E'\n',
      q->>'seccion', q->>'capituloTitulo', q->>'text',
      (SELECT string_agg(value, E'\n') FROM jsonb_array_elements_text(
        CASE WHEN jsonb_typeof(q->'options') = 'array' THEN q->'options' ELSE '[]'::jsonb END
      )), q->>'cite'
    ) AS heading
  )
  SELECT heading ~* $strong$helic[oó]pter|rotorcraft|autor+otaci[oó]n|autorotation|heliport|helipuerto$strong$
    OR heading ~* $context$(main|tail|anti-?torque)\s+rotor|rotor\s+(principal|de\s+cola|blades?|disc|disk|rpm|system|wash)|\yhover(ing|s)?\y|vuelo\s+estacionario|translational\s+lift|dissymmetry\s+of\s+lift|retreating\s+blade|pala\s+en\s+retroceso|settling\s+with\s+power|vortex\s+ring|ground\s+resonance|resonancia\s+con\s+el\s+suelo|dynamic\s+rollover|\ycyclic\y|\ycollective\y|\yc[ií]clic[oa]\y|\ycolectivo\y|gyroplane|autogiro$context$
    OR coalesce(q->>'explanation', '') ~* $strong$helic[oó]pter|rotorcraft|autor+otaci[oó]n|autorotation|heliport|helipuerto$strong$
  FROM fields;
$function$;
REVOKE ALL ON FUNCTION public.is_atp_helicopter(jsonb) FROM PUBLIC, anon, authenticated;

-- Aggregate only; never downloads questions to count them in the selector.
CREATE OR REPLACE FUNCTION public.get_atp_fixed_wing_counts()
RETURNS TABLE(materia text, fuente text, capitulo int, total bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT coalesce(c.data->>'materia', ''), c.data->>'fuente',
    coalesce(nullif(c.data->>'capitulo', ''), '0')::int, count(*)::bigint
  FROM public.content c
  WHERE auth.uid() IS NOT NULL
    AND c.collection = 'questions'
    AND c.data->>'status' = 'publicada'
    AND c.data->>'fuente' = 'ATP'
    AND NOT public.is_atp_helicopter(c.data)
  GROUP BY 1, 2, 3;
$function$;
REVOKE ALL ON FUNCTION public.get_atp_fixed_wing_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_atp_fixed_wing_counts() TO authenticated;
