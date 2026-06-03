-- Public read of gallery files (bucket is private at the workspace level,
-- but the gallery is meant to be publicly viewable on the website).
CREATE POLICY "Gallery objects: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

CREATE POLICY "Gallery objects: admin/koordinator insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'gallery'
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role))
  );

CREATE POLICY "Gallery objects: admin/koordinator update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'gallery'
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role))
  );

CREATE POLICY "Gallery objects: admin/koordinator delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'gallery'
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role))
  );