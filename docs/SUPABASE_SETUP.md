# Supabase setup for CRAFT

Follow these steps once to connect CRAFT to Supabase auth and database.

---

## Step 1 — Create a Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Choose an organization, name (e.g. `craft`), database password, and region
4. Wait for the project to finish provisioning (~2 minutes)

---

## Step 2 — Create database tables

CRAFT stores user data in four tables, all protected by **Row Level Security (RLS)** so users can only read/write their own rows.

| Table | Purpose |
|-------|---------|
| `profiles` | Display name (auto-created on signup) |
| `bar_items` | Saved bar inventory (`ingredient_id` per row) |
| `favorites` | Starred cocktails |
| `recent_cocktails` | Recently viewed cocktails |
| `reviews` | Cocktail ratings and short reviews (**optional** — run `002_reviews.sql`) |

### Run the migration

1. In Supabase Dashboard, open **SQL Editor**
2. Click **New query**
3. Copy the entire contents of [`supabase/migrations/001_craft_schema.sql`](../supabase/migrations/001_craft_schema.sql)
4. Click **Run**

You should see “Success. No rows returned.”

### Enable reviews (recommended)

If you want cocktail ratings on detail pages:

1. Open **SQL Editor** → **New query**
2. Copy [`supabase/migrations/002_reviews.sql`](../supabase/migrations/002_reviews.sql)
3. Click **Run**

Without this migration, CRAFT still works — the reviews section shows a friendly “not enabled” message.

### Verify tables

Open **Table Editor** — you should see:

- `profiles`
- `bar_items`
- `favorites`
- `recent_cocktails`
- `reviews` (if you ran `002_reviews.sql`)

Open **Authentication → Policies** — each table should have RLS policies enabled.

---

## Step 3 — Configure authentication

### Site URL & redirects

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to `http://localhost:3000` (use your production URL when deployed)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**` (optional wildcard for local dev)
   - Your production callback, e.g. `https://yourdomain.com/auth/callback`

### Email confirmation (recommended for dev)

For faster local testing:

1. Go to **Authentication → Providers → Email**
2. Turn **off** “Confirm email” (you can enable it in production)

With confirmation **on**, users must click the email link before signing in.

---

## Step 4 — Copy API keys to CRAFT

1. In Supabase, open **Project Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. In the CRAFT folder, edit `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> **Never** put the `service_role` key in the frontend or `.env` file committed to git. CRAFT uses only the anon key + RLS.

4. Restart the dev server after changing `.env`:

```bash
npm run dev
```

---

## Step 5 — Test the flow

1. Open [http://localhost:3000/register](http://localhost:3000/register)
2. Create an account with email + password
3. Go to **My Bar** and add ingredients
4. Sign out, sign back in — your bar should reload from Supabase
5. In Supabase **Table Editor → bar_items**, confirm rows appear with your `user_id`

---

## How CRAFT uses Supabase

```
Browser (anon key + user JWT)
    ↓
Supabase Auth (signUp / signInWithPassword)
    ↓
Session cookie (refreshed by middleware.ts)
    ↓
bar_items / favorites / recent_cocktails (RLS: auth.uid() = user_id)
```

- **Guests** — bar/favorites/recents stay in `localStorage`
- **Signed-in users** — data loads from Supabase on login; changes sync automatically (bar saves are debounced 400ms)
- **First login** — local bar merges to Supabase if the cloud bar is empty

---

## Production checklist

- [ ] Set production **Site URL** and **Redirect URLs** in Supabase
- [ ] Enable **email confirmation** if you want verified accounts
- [ ] Add env vars to your host (Vercel, etc.):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Keep RLS enabled on all tables (never disable for convenience)
- [ ] Do not expose `service_role` key in client code

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Invalid API key” | Check `.env` values match Project Settings → API |
| Sign-up works but bar doesn’t save | Run the SQL migration; check RLS policies exist |
| Email confirmation required | Confirm email, or disable in Auth settings for dev |
| Redirect loop after login | Add `/auth/callback` to Redirect URLs |
| Empty bar after login | Sign in, add ingredients again; check `bar_items` in Table Editor |

---

## Files in this repo

| File | Role |
|------|------|
| `supabase/migrations/001_craft_schema.sql` | Database schema + RLS |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server Supabase client (cookies) |
| `src/lib/supabase/middleware.ts` | Session refresh |
| `middleware.ts` | Runs session refresh on every request |
| `src/app/auth/callback/route.ts` | OAuth / email confirmation callback |
| `src/lib/supabase/bar-sync.ts` | Bar / favorites / recents CRUD |
| `src/components/UserDataProvider.tsx` | Auth state + sync logic |
