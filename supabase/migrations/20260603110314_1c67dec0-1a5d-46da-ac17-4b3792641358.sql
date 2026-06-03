-- Bezpečné doplnenie chýbajúcich polí (nič nemažeme, nič neprepisujeme)
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS completion_text text,
  ADD COLUMN IF NOT EXISTS start_button_text text;

ALTER TABLE public.test_questions
  ADD COLUMN IF NOT EXISTS question_description text;