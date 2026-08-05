CREATE POLICY "atp images readable by authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'atp-images');