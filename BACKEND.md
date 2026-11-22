# Noor — Backend Design (Accounts + Cloud Backup)

## Decision: Supabase (free tier)
- **Why:** the app is a static PWA on GitHub Pages. Supabase gives Auth (Google
  sign-in), a Postgres database and a JS client that runs entirely in the
  browser — no server to host, nothing to pay. Free tier: 50,000 monthly
  active users, 500 MB database — far beyond this app's needs. No card needed.
- Alternatives considered: Firebase (works too, but Firestore's model fits
  less well and Google's console flow is longer); a custom FastAPI server
  (needs always-on hosting — free hosts sleep; rejected).

## Architecture
```
iPhone PWA (GitHub Pages) ──HTTPS──> Supabase
   ├─ Auth: Google OAuth (Supabase Auth)
   └─ Data: table `user_data`, one row per user, state stored as JSONB
```
The app keeps working fully offline/local. The account layer (auth.js) only
adds sync on top: local state stays the source of truth on the device.

## Database (run once in Supabase → SQL Editor)
```sql
create table public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

create policy "read own row"   on public.user_data for select using (auth.uid() = user_id);
create policy "insert own row" on public.user_data for insert with check (auth.uid() = user_id);
create policy "update own row" on public.user_data for update using (auth.uid() = user_id);
```
Security note: the app ships the **anon key**, which is public by design —
the RLS policies above are what protect the data. A signed-in user can only
ever read/write the row whose `user_id` equals their own auth id.

## Sync rules (implemented in auth.js)
- **Sign-in:** pull the user's row. If the cloud copy is newer than the last
  local sync and differs, it replaces local data and the app reloads.
- **While signed in:** local changes are pushed (upsert) every 10 s when
  changed, on app hide, and on close. Last write wins.
- **Sign-out:** local data stays on the device; syncing stops.
- **No account:** nothing changes — local storage + backup file, as before.

## What the stored JSON contains
Exactly the app's local state object: prayer history (`days`), qaza counts
(`qaza`, `qazaInitial`, `qazaLog`), plan, ladies' days, tasbeeh total, roza
marks, name, settings, location choice. No passwords are stored anywhere —
Google handles authentication; Supabase only stores the data row.

## One-time setup (owner, ~10 minutes, all free)
1. supabase.com → Sign in (GitHub) → **New project**: name `noor`, region
   Singapore (closest), set a database password and keep it safe.
2. SQL Editor → paste the SQL above → Run.
3. Project Settings → API → copy **Project URL** and **anon public key**
   into `config.js` (or send them to Muse to deploy).
4. Google sign-in: Google Cloud Console → APIs & Services → Credentials →
   Create OAuth client (Web application). Authorized redirect URI:
   `https://<project-ref>.supabase.co/auth/v1/callback`
   Then Supabase → Authentication → Providers → Google → enable, paste the
   Client ID + Secret.
5. Supabase → Authentication → URL Configuration: Site URL =
   `https://waki44.github.io/islamic-companion/` and add the same URL under
   Redirect URLs.

## Future growth (not needed now)
- Split JSONB into normalised tables (prayers, qaza) if multi-device live
  editing or analytics are ever wanted.
- Email/password or magic-link sign-in can be switched on in Supabase Auth
  with no code change beyond a form.
