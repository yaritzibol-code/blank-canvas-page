CREATE OR REPLACE FUNCTION public.admin_lamina_cobertura()
RETURNS TABLE(fuente text, bucket text, preguntas bigint, con_lamina bigint, laminas_distintas bigint, laminas_existentes bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH q AS (
    SELECT c.id,
           COALESCE(c.data->>'fuente', 'CIAAC') AS f,
           COALESCE(c.data->'imagenes', '[]'::jsonb) AS imgs
    FROM public.content c
    WHERE c.collection = 'questions' AND public.is_admin()
  ), b AS (
    SELECT q.*, CASE COALESCE(q.f,'')
                  WHEN 'ATP' THEN 'atp-images'
                  WHEN 'LAOF' THEN 'e190-images'
                  WHEN 'B737MAX' THEN '737-images'
                  WHEN 'JEPP' THEN 'jeppesen-images'
                  ELSE NULL END AS bk
    FROM q
  ), refs AS (
    SELECT b.f, b.bk, jsonb_array_elements_text(b.imgs) AS img FROM b
  )
  SELECT b.f AS fuente,
         COALESCE(b.bk, '—') AS bucket,
         count(*) AS preguntas,
         count(*) FILTER (WHERE jsonb_array_length(b.imgs) > 0) AS con_lamina,
         (SELECT count(DISTINCT r.img) FROM refs r WHERE r.f = b.f) AS laminas_distintas,
         (SELECT count(DISTINCT r.img) FROM refs r
            JOIN storage.objects o ON o.bucket_id = r.bk AND o.name = r.img
           WHERE r.f = b.f) AS laminas_existentes
  FROM b
  GROUP BY b.f, b.bk
  ORDER BY 3 DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_lamina_cobertura() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_lamina_cobertura() TO authenticated, service_role;