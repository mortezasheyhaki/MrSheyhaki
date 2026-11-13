# Finish Supabase migration — Mr. Sheyhaki Learning Arcade

Signup is broken because Appwrite Cloud returned **402 billing_limit_exceeded**.
This package replaces Appwrite auth + scores with Supabase.

## 1. Create a free Supabase project

1. Go to https://supabase.com → New project
2. Note the region (any is fine)
3. Open **Project Settings → API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

## 2. Auth settings

**Authentication → Providers → Email**
- Enable Email
- **Turn OFF “Confirm email”** (students use fake emails like `ali_7a@players.mrsheyhaki.ir`)

**Authentication → URL Configuration**
- Site URL: `https://mrsheyhaki.ir`
- Redirect URLs: add
  - `https://mrsheyhaki.ir/**`
  - `https://mrsheyhaki.ir/learningarcade/**`

## 3. Create the scores table

**SQL Editor → New query** → paste and run `scores.sql` from this folder.

## 4. Put your keys in the two JS files

Edit both files and replace the placeholders:

```js
var SUPABASE_URL = "https://XXXXXXXX.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOi...";
```

Files:
- `learningarcade/auth-system/auth.js`
- `learningarcade/firebase-scores.js`  (same filename so existing `<script>` tags keep working)

## 5. Upload to the site

Overwrite on the server:

| Local path | Server path |
|------------|-------------|
| `learningarcade/auth-system/auth.js` | `/learningarcade/auth-system/auth.js` |
| `learningarcade/auth-system/login.html` | `/learningarcade/auth-system/login.html` |
| `learningarcade/firebase-scores.js` | `/learningarcade/firebase-scores.js` |

## 6. Test

1. Open https://mrsheyhaki.ir/learningarcade/auth-system/login.html
2. **Register** a new username (3+ chars) and password (8+ chars)
3. You should see “Account created!” and redirect
4. Log out and log in again with the same username

## How usernames work

Same as before — no real email is needed:

`ali_7a` → internal email `ali_7a@players.mrsheyhaki.ir`

## Notes

- Legacy Appwrite “short password upgrade” is not ported. New accounts must use 8+ character passwords.
- Old Appwrite accounts will not transfer automatically. Students register once on Supabase.
- `LAAuth` and `LAScores` public APIs are unchanged so games and profile pages keep working.
