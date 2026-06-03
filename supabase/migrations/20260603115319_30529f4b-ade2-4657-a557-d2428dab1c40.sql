
-- Blog categories
CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_categories TO service_role;

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kategórie: všetci čítajú" ON public.blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Kategórie: admin/koordinator spravuje" ON public.blog_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'koordinator'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'koordinator'));

CREATE TRIGGER blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Blog posts
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL DEFAULT '',
  cover_image_url text,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author text NOT NULL DEFAULT 'Tím INVOK',
  status text NOT NULL DEFAULT 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog: publikované verejne" ON public.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Blog: admin/koordinator vidí všetko" ON public.blog_posts
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'koordinator'));

CREATE POLICY "Blog: admin/koordinator spravuje" ON public.blog_posts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'koordinator'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'koordinator'));

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_blog_posts_status_published_at ON public.blog_posts(status, published_at DESC);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);

-- Seed default categories
INSERT INTO public.blog_categories (name, slug) VALUES
  ('Aktuality', 'aktuality'),
  ('Zo škôl', 'zo-skol'),
  ('Kompetencie', 'kompetencie'),
  ('Kritické myslenie', 'kriticke-myslenie'),
  ('Mediálna gramotnosť', 'medialna-gramotnost'),
  ('Podnikavosť', 'podnikavost'),
  ('Digitálne zručnosti', 'digitalne-zrucnosti'),
  ('Tímová spolupráca', 'timova-spolupraca')
ON CONFLICT (slug) DO NOTHING;
