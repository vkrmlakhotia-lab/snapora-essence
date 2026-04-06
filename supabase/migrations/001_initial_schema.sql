-- ============================================================
-- SNAPORA — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Profiles (one per user, auto-created on signup)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Book projects
create table book_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  cover_photo text,
  status text default 'draft' check (status in ('draft', 'completed', 'ordered')),
  paper_finish text default 'matte' check (paper_finish in ('matte', 'glossy', 'layflat')),
  style text default 'classic' check (style in ('classic', 'baby', 'yearbook', 'wedding', 'travel', 'minimal')),
  gift_note text,
  share_link text,
  ai_prompt text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Book pages (ordered by position)
create table book_pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references book_projects(id) on delete cascade not null,
  layout text default '1-up' check (layout in ('1-up', '2-up', '3-up')),
  caption text,
  position integer not null default 0,
  created_at timestamptz default now()
);

-- Book photos (belong to a page and project)
create table book_photos (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references book_pages(id) on delete cascade not null,
  project_id uuid references book_projects(id) on delete cascade not null,
  url text not null,
  storage_path text,
  is_low_res boolean default false,
  is_duplicate boolean default false,
  position integer not null default 0,
  created_at timestamptz default now()
);

-- Collaborators
create table collaborators (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references book_projects(id) on delete cascade not null,
  name text not null,
  email text not null,
  photos_added integer default 0,
  joined_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  book_id uuid references book_projects(id) on delete cascade not null,
  book_title text not null,
  page_count integer not null,
  price_per_page numeric(10,2) not null,
  delivery_fee numeric(10,2) not null,
  total numeric(10,2) not null,
  status text default 'processing' check (status in ('processing', 'printed', 'shipped', 'delivered')),
  tracking_number text,
  estimated_delivery text,
  ordered_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- This ensures users can only see their own data
-- ============================================================

alter table profiles enable row level security;
alter table book_projects enable row level security;
alter table book_pages enable row level security;
alter table book_photos enable row level security;
alter table collaborators enable row level security;
alter table orders enable row level security;

-- Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Book projects
create policy "Users can view own projects" on book_projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on book_projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on book_projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on book_projects for delete using (auth.uid() = user_id);

-- Book pages (inherit access from project)
create policy "Users can manage own pages" on book_pages for all using (
  exists (select 1 from book_projects where id = book_pages.project_id and user_id = auth.uid())
);

-- Book photos (inherit access from project)
create policy "Users can manage own photos" on book_photos for all using (
  exists (select 1 from book_projects where id = book_photos.project_id and user_id = auth.uid())
);

-- Collaborators
create policy "Users can manage collaborators" on collaborators for all using (
  exists (select 1 from book_projects where id = collaborators.project_id and user_id = auth.uid())
);

-- Orders
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on orders for insert with check (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- When a user signs up, automatically create their profile row
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- STORAGE BUCKET FOR PHOTOS
-- ============================================================

insert into storage.buckets (id, name, public) values ('photos', 'photos', false);

create policy "Users can upload own photos" on storage.objects for insert
  with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own photos" on storage.objects for select
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own photos" on storage.objects for delete
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
