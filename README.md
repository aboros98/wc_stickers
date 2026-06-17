# WC26 Sticker Tracker

A phone-first web app to track your **Panini FIFA World Cup 2026** sticker album
(980 stickers — 48 teams × 20 + 20 FWC specials). See what you're **missing**,
manage your **duplicates/spares**, and **share** your needs & spares with friends
to swap. Anyone can sign in and manage their own collection.

- **No paid AI / no API costs.** Fast manual entry: tap a sticker grid, or use the
  **Quick-Add** number pad (type `1-18, 20` to mark a whole team at once).
- **Sharing** uses the browser's native share sheet (WhatsApp, Messages, …) plus a
  generated PNG card; copy/download fallbacks on desktop.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Vite + React + TypeScript, Tailwind v4 |
| Data / Auth | Supabase (Postgres + Row-Level Security + Auth) |
| Hosting | Cloudflare Pages or Netlify (free static hosting) |

The whole thing runs comfortably on Supabase's free tier + a free static host — **$0/month** for a hobby app.

---

## 1. Set up Supabase (the backend)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard → **SQL Editor**, paste and run the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   This creates the `catalog`, `profiles`, and `user_stickers` tables, the
   sign-up trigger, and all Row-Level-Security policies.
3. Grab your keys from **Project Settings → API**:
   - `Project URL`
   - `anon` public key (safe to ship to the browser — RLS protects the data)
   - `service_role` secret key (used **only** by the catalog importer, never in the browser)

### Load the 980-sticker catalog

The catalog (every sticker's code, country, slot, type and label) ships in
[`supabase/seed/catalog.json`](supabase/seed/catalog.json). Load it once:

```bash
SUPABASE_URL="https://YOURPROJECT.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
npm run import:catalog
```

You should see `Done. 980 stickers loaded into catalog.`

> Player names come from published checklists and have been cross-verified; a
> handful (~9) of obscure-squad spellings remain lower-confidence (no placeholders).
> To fix any, edit `supabase/seed/catalog.json` and re-run the import (it upserts
> by `sticker_code`), or edit rows directly in the Supabase Table Editor.

---

## 2. Configure the frontend

```bash
cp .env.example .env
```

Fill in the two `VITE_` values (the importer's `SUPABASE_*` values are only needed
for the import step above):

```
VITE_SUPABASE_URL=https://YOURPROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173, create an account (email + password, magic link, or
Google), and start tapping.

> **Email confirmation:** by default Supabase requires confirming the sign-up
> email. For quick local testing you can turn it off under **Auth → Providers →
> Email → "Confirm email"**, or just use the **magic link** button.

### Optional: Google sign-in

Supabase dashboard → **Auth → Providers → Google**: enable it and paste a Google
OAuth client ID/secret ([guide](https://supabase.com/docs/guides/auth/social-login/auth-google)).
Add your deployed URL and `http://localhost:5173` to the allowed redirect URLs.

---

## 4. Deploy (free)

The app is a static SPA, so any static host works. Build settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output / publish directory | `dist` |
| Env vars | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

**Cloudflare Pages** or **Netlify**: connect the repo, set the above, deploy. The
included [`public/_redirects`](public/_redirects) file makes client-side routes
(`/missing`, `/spares`, …) resolve to `index.html` on both hosts.

After deploying, add the live URL to Supabase **Auth → URL Configuration → Site
URL / Redirect URLs** so email-link and Google logins return to your app.

> **Supabase free-tier note:** projects pause after ~7 days with no requests.
> If the app goes quiet, unpause it in the dashboard (or add a tiny cron that
> pings it).

---

## Data model

Everything is three tables. The trick: one integer `count` per (user, sticker):

```
count = 0  → missing
count = 1  → have
count ≥ 2  → have + (count − 1) spares to swap
```

"Missing" and "Duplicates" are then just filters over that. `catalog` is shared
and read-only to users; `user_stickers` is private per user via RLS.

## Project structure

```
src/
  lib/            supabase client, types, collection math, ranges, share, haptics, team colors
  auth/           AuthProvider (email/password, magic link, Google)
  data/           react-query hooks (catalog, collection, optimistic set-count)
  components/     StickerGrid/Cell, sheets, accordion, progress ring/bar, share card, …
  pages/          Collection, Missing, Duplicates, Share, Login
supabase/
  migrations/     0001_init.sql  (schema + RLS + triggers)
  seed/           catalog.json   (the 980 stickers)
  import-catalog.mjs
```

## Roadmap

- **v1 (this):** auth, tap-grid + Quick-Add entry, missing & duplicates, share (text + image).
- **Phase 2:** friend swap-matching (your missing ∩ their spares) + QR for in-person swaps.
