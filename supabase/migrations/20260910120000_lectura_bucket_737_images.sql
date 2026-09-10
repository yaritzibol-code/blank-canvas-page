-- Faltaba la política de lectura del bucket `737-images`.
--
-- `QuestionImages` manda las figuras de la fuente B737MAX a ese bucket, pero
-- sólo `jeppesen-images`, `atp-images` y `e190-images` tenían política SELECT
-- para usuarios autenticados. Sin ella, `createSignedUrls` no devuelve nada y
-- la lámina nunca aparece: el alumno ve la pregunta sin figura.
--
-- Si el bucket todavía no existe, la política queda inerte hasta que se cree.
DROP POLICY IF EXISTS "737 images readable by authenticated" ON storage.objects;
CREATE POLICY "737 images readable by authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = '737-images');
