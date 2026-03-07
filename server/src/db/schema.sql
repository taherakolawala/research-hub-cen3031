-- =============================================================================
-- ResearchHub Database Schema
-- Target: Supabase (PostgreSQL 15)
-- Run each section in order via the Supabase SQL Editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- trigram indexes for text search


-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('student', 'pi', 'study_participant', 'admin');

create type application_status as enum (
  'pending',
  'reviewing',
  'accepted',
  'rejected',
  'withdrawn'
);

create type position_status as enum ('open', 'closed', 'filled');

create type study_status as enum ('recruiting', 'closed', 'completed');

create type compensation_type as enum ('paid', 'unpaid', 'credit', 'stipend');

create type academic_level as enum (
  'freshman',
  'sophomore',
  'junior',
  'senior',
  'masters',
  'phd',
  'postdoc'
);


-- ---------------------------------------------------------------------------
-- Table: users
-- Core identity record. One row per registered account.
-- ---------------------------------------------------------------------------
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  role          user_role not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  users              is 'Core user accounts shared across all roles.';
comment on column users.role         is 'Determines which profile table holds the extended data.';
comment on column users.password_hash is 'bcrypt hash — never store plaintext passwords.';

create index if not exists users_email_idx on users (email);
create index if not exists users_role_idx  on users (role);


-- ---------------------------------------------------------------------------
-- Table: student_profiles
-- Extended data for users with role = ''student''.
-- ---------------------------------------------------------------------------
create table if not exists student_profiles (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null unique references users (id) on delete cascade,
  major          text,
  gpa            numeric(3, 2) check (gpa >= 0 and gpa <= 4.0),
  skills         text[]        not null default '{}',
  resume_url     text,
  interests      text[]        not null default '{}',
  academic_level academic_level,
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);

comment on table  student_profiles               is 'Profile details for student users.';
comment on column student_profiles.skills        is 'Free-form skill tags, e.g. ["Python","R","Statistics"].';
comment on column student_profiles.interests     is 'Research interest tags used for position matching.';
comment on column student_profiles.academic_level is 'Current academic standing of the student.';

create index if not exists student_profiles_user_id_idx on student_profiles (user_id);


-- ---------------------------------------------------------------------------
-- Table: pi_profiles
-- Extended data for users with role = ''pi'' (Principal Investigator).
-- ---------------------------------------------------------------------------
create table if not exists pi_profiles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references users (id) on delete cascade,
  name             text not null,
  department       text not null,
  research_areas   text[]      not null default '{}',
  lab_name         text,
  staffing_needs   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table  pi_profiles                  is 'Profile details for Principal Investigator users.';
comment on column pi_profiles.research_areas   is 'Tags describing the lab''s research domains.';
comment on column pi_profiles.staffing_needs   is 'Free-text description of current hiring needs.';

create index if not exists pi_profiles_user_id_idx    on pi_profiles (user_id);
create index if not exists pi_profiles_department_idx on pi_profiles (department);


-- ---------------------------------------------------------------------------
-- Table: study_participant_profiles
-- Extended data for users with role = ''study_participant''.
-- ---------------------------------------------------------------------------
create table if not exists study_participant_profiles (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null unique references users (id) on delete cascade,
  availability              jsonb not null default '{}',
  demographics              jsonb not null default '{}',
  participation_preferences jsonb not null default '{}',
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

comment on table  study_participant_profiles                        is 'Profile details for study participant users.';
comment on column study_participant_profiles.availability           is 'JSON schedule object, e.g. {"weekdays": true, "mornings": false}.';
comment on column study_participant_profiles.demographics           is 'Self-reported demographic info used for study eligibility matching.';
comment on column study_participant_profiles.participation_preferences is 'Preferences such as remote_only, compensation_required, etc.';

create index if not exists study_participant_profiles_user_id_idx on study_participant_profiles (user_id);


-- ---------------------------------------------------------------------------
-- updated_at trigger (shared function)
-- Automatically bumps updated_at on every row update.
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_users_updated_at
  before update on users
  for each row execute function set_updated_at();

create or replace trigger trg_student_profiles_updated_at
  before update on student_profiles
  for each row execute function set_updated_at();

create or replace trigger trg_pi_profiles_updated_at
  before update on pi_profiles
  for each row execute function set_updated_at();

create or replace trigger trg_study_participant_profiles_updated_at
  before update on study_participant_profiles
  for each row execute function set_updated_at();
