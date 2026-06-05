
-- Video categories
CREATE TABLE public.video_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.video_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_categories TO authenticated;
GRANT ALL ON public.video_categories TO service_role;
ALTER TABLE public.video_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Video kategórie: všetci čítajú" ON public.video_categories FOR SELECT TO public USING (true);
CREATE POLICY "Video kategórie: admin/koordinator spravuje" ON public.video_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'koordinator'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'koordinator'::app_role));
CREATE TRIGGER trg_video_categories_updated BEFORE UPDATE ON public.video_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Videos
CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category_id uuid REFERENCES public.video_categories(id) ON DELETE SET NULL,
  module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL,
  grade integer,
  author text NOT NULL DEFAULT 'Tím INVOK',
  source_type text NOT NULL DEFAULT 'upload', -- upload | youtube | vimeo | url
  source_url text,
  storage_path text,
  thumbnail_url text,
  duration_seconds integer,
  status text NOT NULL DEFAULT 'draft', -- draft | published | archived
  published_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videá: publikované verejne" ON public.videos FOR SELECT TO public USING (status='published');
CREATE POLICY "Videá: admin/koordinator vidí všetko" ON public.videos FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'koordinator'::app_role));
CREATE POLICY "Videá: admin/koordinator spravuje" ON public.videos FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'koordinator'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'koordinator'::app_role));
CREATE TRIGGER trg_videos_updated BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage policies for 'videos' bucket
CREATE POLICY "Videá storage: admin/koordinator nahrávajú"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='videos' AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'koordinator'::app_role)));
CREATE POLICY "Videá storage: admin/koordinator čítajú"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='videos' AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'koordinator'::app_role)));
CREATE POLICY "Videá storage: admin/koordinator mažú"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='videos' AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'koordinator'::app_role)));
