See signed-up students in Admin
================================

1) In Supabase → SQL Editor, run: profiles.sql

2) Upload:
   - learningarcade/admin/index.html
   - learningarcade/auth-system/auth.js

3) Optional — backfill users who already registered (SQL Editor):

insert into public.profiles (id, username, display_name)
select
  id,
  coalesce(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  coalesce(raw_user_meta_data->>'display_name', raw_user_meta_data->>'username', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;

4) Open Admin → Refresh list

Until someone registers AFTER profiles.sql is installed (or you run the backfill),
the list stays empty. You can always see signups in:
  Supabase Dashboard → Authentication → Users
