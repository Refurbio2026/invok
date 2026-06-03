
-- =============================
-- TRIEDY
-- =============================
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  name text not null,
  grade int,
  school_year text,
  teacher_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_classes_school_id on public.classes(school_id);
create index idx_classes_teacher_id on public.classes(teacher_id);

grant select, insert, update, delete on public.classes to authenticated;
grant all on public.classes to service_role;

alter table public.classes enable row level security;

create policy "Triedy: admin/koordinator plný prístup"
on public.classes for all to authenticated
using (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'koordinator'))
with check (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'koordinator'));

create policy "Triedy: škola vidí svoje"
on public.classes for select to authenticated
using (school_id = current_user_school_id());

create policy "Triedy: škola vkladá svoje"
on public.classes for insert to authenticated
with check (school_id = current_user_school_id());

create policy "Triedy: škola upravuje svoje"
on public.classes for update to authenticated
using (school_id = current_user_school_id())
with check (school_id = current_user_school_id());

create policy "Triedy: škola maže svoje"
on public.classes for delete to authenticated
using (school_id = current_user_school_id());

create trigger trg_classes_updated_at
before update on public.classes
for each row execute function public.set_updated_at();

-- =============================
-- ŽIACI
-- =============================
create table public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  class_id uuid not null references public.classes(id) on delete cascade,
  code text not null,
  first_name text,
  last_name text,
  grade int,
  pin text,
  status text not null default 'aktivny',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, code)
);

create index idx_students_school_id on public.students(school_id);
create index idx_students_class_id on public.students(class_id);

grant select, insert, update, delete on public.students to authenticated;
grant all on public.students to service_role;

alter table public.students enable row level security;

create policy "Žiaci: admin/koordinator plný prístup"
on public.students for all to authenticated
using (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'koordinator'))
with check (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'koordinator'));

create policy "Žiaci: škola vidí svojich"
on public.students for select to authenticated
using (school_id = current_user_school_id());

create policy "Žiaci: škola vkladá svojich"
on public.students for insert to authenticated
with check (school_id = current_user_school_id());

create policy "Žiaci: škola upravuje svojich"
on public.students for update to authenticated
using (school_id = current_user_school_id())
with check (school_id = current_user_school_id());

create policy "Žiaci: škola maže svojich"
on public.students for delete to authenticated
using (school_id = current_user_school_id());

create trigger trg_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

-- =============================
-- TESTY
-- =============================
create table public.tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  type text not null default 'diagnosticky',
  grade_from int,
  grade_to int,
  description text,
  status text not null default 'draft',
  duration_min int,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tests_status on public.tests(status);

grant select, insert, update, delete on public.tests to authenticated;
grant all on public.tests to service_role;

alter table public.tests enable row level security;

create policy "Testy: admin/koordinator plný prístup"
on public.tests for all to authenticated
using (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'koordinator'))
with check (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'koordinator'));

create policy "Testy: prihlásený čít. publikované"
on public.tests for select to authenticated
using (status = 'published');

create trigger trg_tests_updated_at
before update on public.tests
for each row execute function public.set_updated_at();

-- =============================
-- OTÁZKY TESTOV
-- =============================
create table public.test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  position int not null,
  question_text text not null,
  question_type text not null default 'single',
  competency text,
  options jsonb not null default '[]'::jsonb,
  correct_keys text[] not null default '{}',
  points numeric not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (test_id, position)
);

create index idx_test_questions_test_id on public.test_questions(test_id);

grant select, insert, update, delete on public.test_questions to authenticated;
grant all on public.test_questions to service_role;

alter table public.test_questions enable row level security;

create policy "Otázky: admin/koordinator plný prístup"
on public.test_questions for all to authenticated
using (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'koordinator'))
with check (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'koordinator'));

create policy "Otázky: prihlásený čít. otázky publikovaného testu"
on public.test_questions for select to authenticated
using (
  exists (
    select 1 from public.tests t
    where t.id = test_questions.test_id
      and t.status = 'published'
  )
);

create trigger trg_test_questions_updated_at
before update on public.test_questions
for each row execute function public.set_updated_at();
