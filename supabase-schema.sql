-- NAZS Digital Library — Supabase Schema
-- Run this whole file in Supabase Dashboard → SQL Editor → New Query

-- 1. PROFILES (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  matric_number text unique not null,
  level text, -- e.g. '300'
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on profiles for select using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row when someone signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, matric_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'matric_number', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. RESOURCES (catalogue items: books, past questions, projects, notes)
create type resource_type as enum ('book', 'past_question', 'project', 'note', 'other');
create type resource_status as enum ('pending', 'approved', 'rejected');

create table resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type resource_type not null default 'other',
  course_code text, -- e.g. 'ZLY 301'
  author_or_source text,
  external_link text, -- e.g. Google Drive link
  file_path text, -- path in Supabase Storage bucket, if uploaded directly
  uploaded_by uuid references profiles(id) on delete set null,
  status resource_status not null default 'pending',
  created_at timestamptz default now()
);

alter table resources enable row level security;

create policy "Approved resources viewable by everyone authenticated"
  on resources for select using (
    status = 'approved' or uploaded_by = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Authenticated users can submit resources"
  on resources for insert with check (auth.uid() = uploaded_by);

create policy "Admins can update any resource"
  on resources for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete resources"
  on resources for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- 3. BORROW REQUESTS (for physical items referenced in the catalogue)
create type borrow_status as enum ('requested', 'approved', 'borrowed', 'returned', 'declined');

create table borrow_requests (
  id uuid default gen_random_uuid() primary key,
  resource_id uuid references resources(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  status borrow_status not null default 'requested',
  requested_at timestamptz default now(),
  returned_at timestamptz
);

alter table borrow_requests enable row level security;

create policy "Users see own borrow requests, admins see all"
  on borrow_requests for select using (
    user_id = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Users can create own borrow requests"
  on borrow_requests for insert with check (auth.uid() = user_id);

create policy "Admins can update borrow requests"
  on borrow_requests for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- 4. FEEDBACK (ratings/comments on resources)
create table feedback (
  id uuid default gen_random_uuid() primary key,
  resource_id uuid references resources(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rating smallint check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

alter table feedback enable row level security;

create policy "Feedback viewable by authenticated users"
  on feedback for select using (auth.role() = 'authenticated');

create policy "Users can leave own feedback"
  on feedback for insert with check (auth.uid() = user_id);

-- 5. STORAGE BUCKET for uploaded files (PDFs etc.)
insert into storage.buckets (id, name, public) values ('resources', 'resources', true)
on conflict do nothing;

create policy "Anyone authenticated can upload to resources bucket"
  on storage.objects for insert with check (
    bucket_id = 'resources' and auth.role() = 'authenticated'
  );

create policy "Anyone can view resources bucket"
  on storage.objects for select using (bucket_id = 'resources');

-- 6. MAKE YOURSELF ADMIN
-- After you sign up in the app once, run this (replace with your email):
-- update profiles set is_admin = true
-- where id = (select id from auth.users where email = 'your-email@example.com');
