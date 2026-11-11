SUPABASE MIGRATION APPLIED
==========================

This project has been migrated from Appwrite to Supabase for:
- Login / Register (username + password)
- Scoreboard / leaderboard

Changed files:
- index.html
- learningarcade/auth-system/auth.js
- learningarcade/auth-system/login.html
- learningarcade/firebase-scores.js
- learningarcade/grammar/daily-routines/index.html
- learningarcade/grammar/present-perfect/index.html
- learningarcade/grammar/simple-past/index.html

REQUIRED SUPABASE SETUP
-----------------------

1. Authentication → Providers → Email → turn OFF "Confirm email"

2. Authentication → URL Configuration
   - Site URL = your website URL
   - Add the same URL to Redirect URLs

3. SQL Editor — create the scores table:

create table public.scores (
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

create index scores_game_id_idx on public.scores (game_id);
create index scores_score_idx on public.scores (score desc);
create index scores_at_idx on public.scores (at desc);

alter table public.scores enable row level security;

create policy "Public can read scores"
  on public.scores for select
  to anon, authenticated
  using (true);

create policy "Anyone can insert scores"
  on public.scores for insert
  to anon, authenticated
  with check (true);
