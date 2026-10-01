# Student progress — Appwrite setup (do this once)

The code is already in the site. These steps create the private tables and switch on real logins.
Project: `6aafc5370019ebd5da7c` (Frankfurt) · Database: `6aafc5ce007461d09d3`.

## 1. Create the two tables
**Option A (recommended):** from your computer, in the site folder:

    npm install node-appwrite
    APPWRITE_API_KEY=<a key with databases/tables/columns/indexes read+write> node tools/appwrite-setup.mjs

**Option B (by hand, Console → Databases → your database → Create table):** use these exact **Table IDs**.

Both tables → **Settings → Permissions:** add role **Users** with **Create** only (no Read/Update/Delete),
and turn **Row security ON**. Add an index on `userId` (type key).

`progress` columns — strings: `userId`(36, required) `gameId`(128, required) `gameName`(128) `category`(64) `unit`(128);
integers (not required): `attempts` `completions` `totalTimeSeconds` `bestTimeSeconds` `bestStars`
`bestScore` `bestMaxScore` `bestAccuracy` `latestScore` `latestMaxScore` `latestAccuracy` `firstPlayedAt` `lastPlayedAt`.

`attempts` columns — strings: `userId`(36, required) `gameId`(128, required) `gameName`(128) `category`(64) `unit`(128);
integers: `score` `maxScore` `accuracy` `timeSeconds` `stars` `at`; boolean: `completed`.

## 2. Auth
Console → **Auth → Settings**: make sure **Email/Password** is ON. Leave "Session limit" at its default.
(Students never see an email: `ali_7a` is stored as `ali_7a@players.mrsheyhaki.ir`. No emails are sent.)

## 3. Allow your website
Console → **Overview → Integrations → Platforms → Add platform → Web**, once for each hostname:
`mrsheyhaki.ir`, `www.mrsheyhaki.ir` (and `localhost` while testing). Without this, logins fail with a CORS error.

## 4. Existing students
Old accounts keep working: the first login with the old password creates the real account automatically.
Old passwords shorter than 8 characters get a one-time "choose a new password" step (Appwrite requires 8+).
Once everyone has logged in once, **delete the old `players` table** — it contains everyone's old password hashes
and is currently publicly readable (needed only for this one-time migration).

## 5. Privacy model (what protects each student)
- Each row is created with permissions `read/update = that student only`. Appwrite enforces this on the server,
  so changing an ID in JavaScript cannot expose another student's rows.
- The history table (`attempts`) is read-only for students; they can't edit or delete past attempts.
- Teacher access is not included. To add it later: create the label `teacher` on teacher accounts and add
  `read("label:teacher")` to the table permissions.

## 6. Quick test
1. Register a new student → play any game to the end → Console shows 1 row in `progress` and 1 in `attempts`.
2. Play the same game again → still 1 `progress` row; `attempts` = 2; best score keeps the higher result.
3. Log out, play → no new rows, no errors. Log in as someone else → their profile shows only their own games.
