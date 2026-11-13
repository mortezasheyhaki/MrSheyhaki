-- Learning Arcade scores table for Supabase
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  score integer not null default 0,
  max_score integer,
  game_id text not null,
  game_name text,
  user_id uuid references auth.users(id) on delete set null,
  time_ms integer,
  at bigint not null,
  created_at timestamptz default now()
);

create index if not exists scores_game_id_idx on public.scores (game_id);
create index if not exists scores_score_idx on public.scores (score desc);
create index if not exists scores_at_idx on public.scores (at desc);
create index if not exists scores_user_id_idx on public.scores (user_id);

alter table public.scores enable row level security;

-- Public read (leaderboards)
drop policy if exists "Public can read scores" on public.scores;
create policy "Public can read scores"
  on public.scores for select
  to anon, authenticated
  using (true);

-- Anyone can insert (guest + logged-in). Tighten later if needed.
drop policy if exists "Anyone can insert scores" on public.scores;
create policy "Anyone can insert scores"
  on public.scores for insert
  to anon, authenticated
  with check (true);
