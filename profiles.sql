-- Profiles: one row per signed-up user (visible in Admin)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text,
  birthdate date,
  role text default 'student',
  studying_book text default 'not-a-student',
  active_title text,
  created_at timestamptz default now()
);

alter table public.profiles add column if not exists birthdate date;
alter table public.profiles add column if not exists role text default 'student';
alter table public.profiles add column if not exists studying_book text default 'not-a-student';
alter table public.profiles add column if not exists active_title text;

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

alter table public.profiles enable row level security;

drop policy if exists "Public can read profiles" on public.profiles;
create policy "Public can read profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  raw_bday text := nullif(trim(coalesce(new.raw_user_meta_data->>'birthdate', '')), '');
  parsed_bday date := null;
begin
  if raw_bday ~ '^\d{4}-\d{2}-\d{2}$' then
    parsed_bday := raw_bday::date;
  end if;

  insert into public.profiles (id, username, display_name, birthdate, role, studying_book, active_title)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    parsed_bday,
    nullif(trim(coalesce(new.raw_user_meta_data->>'role', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'studying_book', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'active_title', '')), '')
  )
  on conflict (id) do update set
    username = excluded.username,
    display_name = excluded.display_name,
    birthdate = coalesce(excluded.birthdate, public.profiles.birthdate),
    role = coalesce(excluded.role, public.profiles.role),
    studying_book = coalesce(excluded.studying_book, public.profiles.studying_book),
    active_title = coalesce(excluded.active_title, public.profiles.active_title);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
