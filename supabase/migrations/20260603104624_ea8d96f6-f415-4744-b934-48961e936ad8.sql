
-- 1. Rozšírenie tabuľky tests o nové polia
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS instructions text,
  ADD COLUMN IF NOT EXISTS module_id uuid,
  ADD COLUMN IF NOT EXISTS show_result_to_student boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS save_to_school_report boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_retake boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS anonymous_allowed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS evaluate_by_competency boolean NOT NULL DEFAULT false;

-- 2. Rozšírenie test_questions
ALTER TABLE public.test_questions
  ADD COLUMN IF NOT EXISTS is_required boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS scale_min integer,
  ADD COLUMN IF NOT EXISTS scale_max integer,
  ADD COLUMN IF NOT EXISTS scale_labels jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS scoring_mode text;

-- 3. Tabuľka modules (vzdelávacie moduly INVOK)
CREATE TABLE IF NOT EXISTS public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.modules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moduly: všetci čítajú"
  ON public.modules FOR SELECT
  USING (true);

CREATE POLICY "Moduly: admin/koordinator spravuje"
  ON public.modules FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role));

CREATE TRIGGER set_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Pravidlá vyhodnotenia
CREATE TABLE IF NOT EXISTS public.test_scoring_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  min_percentage integer NOT NULL,
  max_percentage integer NOT NULL,
  label text NOT NULL,
  description text,
  competency_area text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scoring_rules_test ON public.test_scoring_rules(test_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_scoring_rules TO authenticated;
GRANT ALL ON public.test_scoring_rules TO service_role;

ALTER TABLE public.test_scoring_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pravidlá: admin/koordinator plný prístup"
  ON public.test_scoring_rules FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role));

CREATE POLICY "Pravidlá: prihlásený číta pre publikovaný test"
  ON public.test_scoring_rules FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tests t WHERE t.id = test_scoring_rules.test_id AND t.status = 'published'));

CREATE TRIGGER set_scoring_rules_updated_at
  BEFORE UPDATE ON public.test_scoring_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Priradenie testov
CREATE TABLE IF NOT EXISTS public.test_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  scope text NOT NULL DEFAULT 'all', -- 'all' | 'school' | 'class' | 'module' | 'grade'
  school_id uuid,
  class_id uuid,
  module_id uuid,
  grade integer,
  starts_at timestamptz,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'active', -- 'active' | 'paused' | 'ended'
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_test ON public.test_assignments(test_id);
CREATE INDEX IF NOT EXISTS idx_assignments_school ON public.test_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.test_assignments(class_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_assignments TO authenticated;
GRANT ALL ON public.test_assignments TO service_role;

ALTER TABLE public.test_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Priradenia: admin/koordinator plný prístup"
  ON public.test_assignments FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role));

CREATE POLICY "Priradenia: škola vidí svoje"
  ON public.test_assignments FOR SELECT
  TO authenticated
  USING (
    scope = 'all'
    OR school_id = current_user_school_id()
    OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = test_assignments.class_id AND c.school_id = current_user_school_id())
  );

CREATE TRIGGER set_assignments_updated_at
  BEFORE UPDATE ON public.test_assignments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Seed základných modulov INVOK
INSERT INTO public.modules (name, slug, description, sort_order) VALUES
  ('Podnikavosť a iniciatíva', 'podnikavost', 'Modul rozvoja podnikateľského myslenia', 1),
  ('Kritické a mediálne myslenie', 'kriticke-myslenie', 'Analýza informácií a médií', 2),
  ('Tímová spolupráca', 'timova-spolupraca', 'Práca v tíme a líderstvo', 3),
  ('Digitálne zručnosti', 'digitalne-zrucnosti', 'Práca s digitálnymi nástrojmi', 4),
  ('Komunikácia a prezentácia', 'komunikacia', 'Verbálna a vizuálna komunikácia', 5),
  ('Sebahodnotenie a budúcnosť', 'sebahodnotenie', 'Reflexia a kariérne plánovanie', 6)
ON CONFLICT (slug) DO NOTHING;
