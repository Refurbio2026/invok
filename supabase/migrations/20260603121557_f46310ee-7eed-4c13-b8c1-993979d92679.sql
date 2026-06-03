-- Fotogaléria (Gallery / media library) — used by Blog and other content
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  url text NOT NULL,
  filename text NOT NULL,
  alt text,
  caption text,
  width integer,
  height integer,
  size_bytes integer,
  content_type text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Galéria: verejne čítaná"
  ON public.gallery_images FOR SELECT
  USING (true);

CREATE POLICY "Galéria: admin/koordinator spravuje"
  ON public.gallery_images FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role));

CREATE TRIGGER set_updated_at_gallery_images
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_gallery_images_created_at ON public.gallery_images (created_at DESC);