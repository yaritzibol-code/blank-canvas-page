-- Diagnóstico de láminas del banco de preguntas.
--
-- NO es una migración: pégalo en el editor SQL de Supabase cuando quieras
-- saber por qué una pregunta se ve sin figura. Sólo lee, no modifica nada.
--
-- Recordatorio de cómo funciona el enlace: el reactivo guarda en
-- `data->'imagenes'` una lista de NOMBRES DE ARCHIVO, y el cliente los firma
-- contra el bucket que le toca a su `fuente`:
--   JEPP → jeppesen-images · ATP → atp-images
--   LAOF → e190-images     · B737MAX → 737-images
-- Si falta el nombre en la pregunta, o el archivo en el bucket, o la política
-- de lectura del bucket, la pregunta se muestra sin figura.

-- 1) ¿Cuántas preguntas traen lámina, por manual?
--    Esto responde de un vistazo "¿el cuestionario de Aeroméxico (LAOF) tiene
--    imágenes ligadas o no?".
SELECT
  COALESCE(NULLIF(data->>'fuente', ''), '(CIAAC, sin manual)') AS fuente,
  count(*)                                                     AS preguntas,
  count(*) FILTER (WHERE data ? 'imagenes'
                     AND jsonb_array_length(data->'imagenes') > 0) AS con_lamina,
  count(*) FILTER (WHERE NOT (data ? 'imagenes')
                      OR jsonb_array_length(data->'imagenes') = 0) AS sin_lamina
FROM public.content
WHERE collection = 'questions'
  AND data->>'status' = 'publicada'
GROUP BY 1
ORDER BY 1;

-- 2) Preguntas que HABLAN de una figura pero no traen ninguna ligada.
--    Estas son las que el alumno ve incompletas: el texto manda a mirar algo
--    que no está en pantalla.
SELECT
  data->>'fuente' AS fuente,
  data->>'id'     AS id,
  left(data->>'text', 140) AS texto
FROM public.content
WHERE collection = 'questions'
  AND data->>'status' = 'publicada'
  AND data->>'text' ~* '(figura|imagen|lámina|carta adjunta|se muestra|mostrada|observe|siguiente gráfic)'
  AND (NOT (data ? 'imagenes') OR jsonb_array_length(data->'imagenes') = 0)
ORDER BY 1, 2;

-- 3) Láminas declaradas que NO existen en su bucket (enlace roto).
--    Si esta consulta devuelve filas, el nombre del archivo en la pregunta no
--    coincide con nada subido: ahí es donde "se ligó mal".
WITH declaradas AS (
  SELECT
    data->>'id'    AS pregunta,
    data->>'fuente' AS fuente,
    CASE data->>'fuente'
      WHEN 'ATP'     THEN 'atp-images'
      WHEN 'LAOF'    THEN 'e190-images'
      WHEN 'B737MAX' THEN '737-images'
      ELSE 'jeppesen-images'
    END            AS bucket,
    archivo
  FROM public.content,
       LATERAL jsonb_array_elements_text(data->'imagenes') AS archivo
  WHERE collection = 'questions'
    AND data->>'status' = 'publicada'
    AND data ? 'imagenes'
)
SELECT d.pregunta, d.fuente, d.bucket, d.archivo AS archivo_faltante
FROM declaradas d
LEFT JOIN storage.objects o
  ON o.bucket_id = d.bucket AND o.name = d.archivo
WHERE o.id IS NULL
ORDER BY d.fuente, d.pregunta;

-- 4) Archivos subidos que ninguna pregunta usa (el problema al revés:
--    la lámina está en el bucket pero nadie la referencia).
WITH usadas AS (
  SELECT DISTINCT
    CASE data->>'fuente'
      WHEN 'ATP'     THEN 'atp-images'
      WHEN 'LAOF'    THEN 'e190-images'
      WHEN 'B737MAX' THEN '737-images'
      ELSE 'jeppesen-images'
    END AS bucket,
    archivo
  FROM public.content,
       LATERAL jsonb_array_elements_text(data->'imagenes') AS archivo
  WHERE collection = 'questions' AND data ? 'imagenes'
)
SELECT o.bucket_id, count(*) AS archivos_sin_usar
FROM storage.objects o
LEFT JOIN usadas u ON u.bucket = o.bucket_id AND u.archivo = o.name
WHERE o.bucket_id IN ('jeppesen-images', 'atp-images', 'e190-images', '737-images')
  AND u.archivo IS NULL
GROUP BY 1
ORDER BY 1;

-- 5) Buckets sin política de lectura para usuarios autenticados.
--    Un bucket que aquí no aparezca con su política nunca podrá firmar URLs,
--    por más que la pregunta y el archivo estén bien.
SELECT bucket_id, count(*) AS objetos
FROM storage.objects
WHERE bucket_id IN ('jeppesen-images', 'atp-images', 'e190-images', '737-images')
GROUP BY 1
ORDER BY 1;
