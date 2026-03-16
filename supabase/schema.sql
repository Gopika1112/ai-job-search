-- AI Job Search Platform - Supabase SQL Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================================================
-- PROFILES TABLE
-- ================================================================
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  skills text[] default '{}',
  experience_years int default 0,
  preferred_roles text[] default '{}',
  preferred_locations text[] default '{}',
  resume_text text,
  resume_url text,
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger: auto-create profile on new user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ================================================================
-- JOBS TABLE
-- ================================================================
create table if not exists jobs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  company text not null,
  location text,
  description text not null,
  url text not null,
  source text not null,
  tags text[] default '{}',
  salary_min int,
  salary_max int,
  job_type text default 'full-time',
  is_remote boolean default false,
  posted_at timestamptz,
  fetched_at timestamptz default now(),
  url_hash text unique not null
);

create index if not exists jobs_source_idx on jobs(source);
create index if not exists jobs_fetched_at_idx on jobs(fetched_at desc);
create index if not exists jobs_url_hash_idx on jobs(url_hash);

-- ================================================================
-- JOB MATCHES TABLE
-- ================================================================
create table if not exists job_matches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete cascade not null,
  fit_score int not null check (fit_score >= 0 and fit_score <= 100),
  summary text,
  skill_gaps text[] default '{}',
  match_reasons text[] default '{}',
  matched_at timestamptz default now(),
  unique(user_id, job_id)
);

create index if not exists job_matches_user_idx on job_matches(user_id);
create index if not exists job_matches_fit_score_idx on job_matches(fit_score desc);

-- ================================================================
-- SAVED JOBS TABLE
-- ================================================================
create table if not exists saved_jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete cascade not null,
  saved_at timestamptz default now(),
  unique(user_id, job_id)
);

create index if not exists saved_jobs_user_idx on saved_jobs(user_id);

-- ================================================================
-- APPLIED JOBS TABLE
-- ================================================================
create table if not exists applied_jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete cascade not null,
  applied_at timestamptz default now(),
  notes text,
  unique(user_id, job_id)
);

create index if not exists applied_jobs_user_idx on applied_jobs(user_id);

-- ================================================================
-- NOTIFICATIONS TABLE
-- ================================================================
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists notifications_user_idx on notifications(user_id);
create index if not exists notifications_read_idx on notifications(read);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- PROFILES
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- JOBS (public read - everyone can see jobs)
alter table jobs enable row level security;
create policy "Jobs are publicly readable" on jobs for select using (true);
create policy "Service role can insert jobs" on jobs for insert with check (true);
create policy "Service role can update jobs" on jobs for update using (true);

-- JOB MATCHES
alter table job_matches enable row level security;
create policy "Users can view own matches" on job_matches for select using (auth.uid() = user_id);
create policy "Service role can insert matches" on job_matches for insert with check (true);

-- SAVED JOBS
alter table saved_jobs enable row level security;
create policy "Users can view own saved jobs" on saved_jobs for select using (auth.uid() = user_id);
create policy "Users can save jobs" on saved_jobs for insert with check (auth.uid() = user_id);
create policy "Users can unsave jobs" on saved_jobs for delete using (auth.uid() = user_id);

-- APPLIED JOBS
alter table applied_jobs enable row level security;
create policy "Users can view own applied jobs" on applied_jobs for select using (auth.uid() = user_id);
create policy "Users can mark jobs as applied" on applied_jobs for insert with check (auth.uid() = user_id);
create policy "Users can update applied job notes" on applied_jobs for update using (auth.uid() = user_id);

-- NOTIFICATIONS
alter table notifications enable row level security;
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);
create policy "Service role can insert notifications" on notifications for insert with check (true);

-- ================================================================
-- STORAGE BUCKET for Resumes
-- ================================================================
insert into storage.buckets (id, name, public) 
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "Users can upload their own resume" on storage.objects
  for insert with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view their own resume" on storage.objects
  for select using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
