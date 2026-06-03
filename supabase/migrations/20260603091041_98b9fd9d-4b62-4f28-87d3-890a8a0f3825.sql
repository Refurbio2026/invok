
-- Pokusy o vyplnenie testu žiakmi a ich odpovede
CREATE TABLE public.test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL,
  student_id uuid NOT NULL,
  school_id uuid NOT NULL,
  class_id uuid,
  status text NOT NULL DEFAULT 'in_progress', -- in_progress | submitted
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  score numeric NOT NULL DEFAULT 0,
  max_score numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_attempts_test ON public.test_attempts(test_id);
CREATE INDEX idx_attempts_student ON public.test_attempts(student_id);
CREATE INDEX idx_attempts_school ON public.test_attempts(school_id);

GRANT SELECT, INSERT, UPDATE ON public.test_attempts TO authenticated;
GRANT ALL ON public.test_attempts TO service_role;

ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pokusy: admin/koordinator plný prístup"
ON public.test_attempts FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role));

CREATE POLICY "Pokusy: škola vidí svoje"
ON public.test_attempts FOR SELECT TO authenticated
USING (school_id = current_user_school_id());

CREATE TRIGGER trg_attempts_updated
BEFORE UPDATE ON public.test_attempts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.test_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL,
  question_id uuid NOT NULL,
  answer_keys text[] NOT NULL DEFAULT '{}',
  answer_text text,
  points_awarded numeric NOT NULL DEFAULT 0,
  is_correct boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);
CREATE INDEX idx_answers_attempt ON public.test_answers(attempt_id);

GRANT SELECT, INSERT, UPDATE ON public.test_answers TO authenticated;
GRANT ALL ON public.test_answers TO service_role;

ALTER TABLE public.test_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Odpovede: admin/koordinator plný prístup"
ON public.test_answers FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'koordinator'::app_role));

CREATE POLICY "Odpovede: škola vidí svoje cez pokus"
ON public.test_answers FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.test_attempts a
  WHERE a.id = test_answers.attempt_id
    AND a.school_id = current_user_school_id()
));

CREATE TRIGGER trg_answers_updated
BEFORE UPDATE ON public.test_answers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
