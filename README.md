CRAFT — Cocktails, perfected.

## Quick start

```bash
npm install
cp .env.example .env
# Configure Supabase — see docs/SUPABASE_SETUP.md
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase (required for accounts)

CRAFT uses **Supabase Auth** + **PostgreSQL** with Row Level Security.

**Full setup guide:** [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)

Summary:

1. Create a Supabase project
2. Run `supabase/migrations/001_craft_schema.sql` in the SQL Editor
3. Run `supabase/migrations/002_reviews.sql` for cocktail ratings (optional)
4. Configure auth redirect URLs (`/auth/callback`)
5. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env`

## Features

- 500 cocktails with photos and bar matching
- **My Bar** — saved to Supabase when signed in
- **Accounts** — email/password via Supabase Auth
- Favorites & recently viewed (synced when signed in)
- Cocktail reviews (requires `002_reviews.sql` migration)
- Guest mode via localStorage (no account required)

## Stack

Next.js 15 · TypeScript · Tailwind · Supabase · cocktail.glass data (MIT)
