# NAZS Digital Library

A resource hub for the National Association of Zoology Students (Unilorin) — catalogue,
search/filter, resource submission with admin review, borrowing requests, and feedback.

## 1. Set up Supabase

1. Create a project at supabase.com.
2. Go to **SQL Editor → New query**, paste the entire contents of `supabase-schema.sql`, and run it.
   This creates all tables, storage bucket, and security policies in one go.
3. Go to **Settings → API** and copy your **Project URL** and **anon public key**.

## 2. Configure the app

```bash
cp .env.example .env
```

Fill in the two values from Supabase in `.env`.

## 3. Run locally

```bash
npm install
npm run dev
```

## 4. Make yourself admin

Sign up once through the app (this creates your profile row). Then in Supabase's
SQL Editor, run:

```sql
update profiles set is_admin = true
where id = (select id from auth.users where email = 'your-email@example.com');
```

Refresh the app — you'll now see an **Admin** tab in the nav for approving submissions
and managing borrow requests.

## 5. Deploy to Netlify

1. Push this project to a GitHub repo.
2. In Netlify: **Add new site → Import from Git**, pick the repo.
3. Build command: `npm run build` — Publish directory: `dist`
4. Add the two `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars under
   **Site settings → Environment variables**.
5. Deploy.

## What students can do

- Browse and search the catalogue by title, description, type, or course code (e.g. ZLY 301).
- Submit books, past questions, project reports, or notes — goes to "pending" until you approve it.
- Request to borrow physical items and track status.
- Leave star ratings and comments on resources.

## What you (Librarian/Admin) can do

- Approve or reject pending submissions.
- Manage borrow request status (requested → approved → borrowed → returned).
- Delete any resource from the catalogue.

## Rollout checklist

- [ ] Run the schema SQL in Supabase
- [ ] Deploy to Netlify with env vars set
- [ ] Make your account admin
- [ ] Seed the catalogue with 10–15 real resources (past questions are the biggest draw)
- [ ] Share the link in the department group with a short "how to submit" note
