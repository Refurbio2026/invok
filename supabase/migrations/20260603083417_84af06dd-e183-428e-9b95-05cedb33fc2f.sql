-- =========================================================
-- INVOK — Phase 1 core schema
-- =========================================================

-- Enums ---------------------------------------------------
create type public.app_role as enum ('admin', 'editor', 'koordinator', 'viewer', 'skola');

create type public.school_status as enum (
  'nova', 'schvalena', 'aktivna', 'pozastavena', 'ukoncena', 'zamietnuta'
);

create type public.school_request_status as enum (
  'nova', 'v_rieseni', 'schvalena', 'zamietnuta', 'archivovana'
);

create type public.school_type as enum (
  'zakladna', 'stredna', 'gymnazium', 'sou', 'spojena', 'ina'
);

-- Profiles ------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  school_id uuid,
  status text not null default 'aktivny',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

-- User roles ---------------------------------------------
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  school_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

-- has_role helper ----------------------------------------
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.current_user_school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id from public.profiles where id = auth.uid()
$$;

-- Profiles policies --------------------------------------
create policy "Profil: vlastník číta"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Profil: vlastník upraví"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Profil: vlastný insert"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- User roles policies ------------------------------------
create policy "Roly: vlastné alebo admin"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- (insert/update/delete iba cez service_role)

-- Schools -------------------------------------------------
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.school_type,
  ico text,
  dic text,
  street text,
  city text,
  zip text,
  region text,
  website text,
  contact_name text,
  contact_position text,
  contact_email text,
  contact_phone text,
  status public.school_status not null default 'nova',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.schools to authenticated;
grant all on public.schools to service_role;

alter table public.schools enable row level security;

create policy "Školy: admin/koordinátor/viewer vidia všetky"
  on public.schools for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'koordinator')
    or public.has_role(auth.uid(), 'viewer')
    or id = public.current_user_school_id()
  );

create policy "Školy: admin/koordinátor upravujú"
  on public.schools for update to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'koordinator')
  );

create policy "Školy: admin/koordinátor vkladajú"
  on public.schools for insert to authenticated
  with check (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'koordinator')
  );

-- FK do profiles.school_id (po vytvorení schools)
alter table public.profiles
  add constraint profiles_school_id_fkey
  foreign key (school_id) references public.schools(id) on delete set null;

-- School requests (verejný formulár) ---------------------
create table public.school_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.school_type,
  ico text,
  dic text,
  street text,
  city text,
  zip text,
  region text,
  website text,
  contact_name text not null,
  contact_position text,
  contact_email text not null,
  contact_phone text,
  students_count int,
  classes_count int,
  interested_in_testing boolean not null default true,
  note text,
  gdpr_consent boolean not null default false,
  contact_consent boolean not null default false,
  status public.school_request_status not null default 'nova',
  internal_note text,
  processed_by uuid references auth.users(id),
  processed_at timestamptz,
  school_id uuid references public.schools(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant insert on public.school_requests to anon, authenticated;
grant select, update on public.school_requests to authenticated;
grant all on public.school_requests to service_role;

alter table public.school_requests enable row level security;

create policy "Žiadosti: anonymný insert (verejný formulár)"
  on public.school_requests for insert to anon
  with check (gdpr_consent = true);

create policy "Žiadosti: prihlásený insert"
  on public.school_requests for insert to authenticated
  with check (gdpr_consent = true);

create policy "Žiadosti: admin a koordinátor čítajú"
  on public.school_requests for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'koordinator')
  );

create policy "Žiadosti: admin a koordinátor upravujú"
  on public.school_requests for update to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'koordinator')
  );

-- Activity log -------------------------------------------
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  module text,
  description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

grant select on public.activity_log to authenticated;
grant all on public.activity_log to service_role;

alter table public.activity_log enable row level security;

create policy "Activity log: admin vidí"
  on public.activity_log for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- handle_new_user trigger (vytvorí profil) ---------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, school_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    nullif(new.raw_user_meta_data->>'school_id', '')::uuid
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger -------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_schools_updated_at before update on public.schools
  for each row execute function public.set_updated_at();
create trigger trg_school_requests_updated_at before update on public.school_requests
  for each row execute function public.set_updated_at();
