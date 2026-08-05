CREATE POLICY "jeppesen images readable by authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'jeppesen-images');