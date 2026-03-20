<p align="center">
  <img src="src/app/icon.png" width="120" alt="Potato" />
</p>

# Potato

Why "Potato"? Because you can make anything out of a potato. This is a blueprint for working with [Postproxy](https://postproxy.dev) — client management, social accounts, composing and scheduling posts — and from here you can take it anywhere. Plug in generative AI for images and copy, add an approval workflow, build dashboards — whatever you need.

Built on Next.js + Supabase.

## Features

- **Clients** — organize work by client, each with their own connected accounts
- **Connect accounts** — OAuth flow for Facebook, Instagram, Twitter/X, LinkedIn, TikTok, YouTube, Threads, Pinterest
- **Compose** — write posts, attach media, create threads, publish immediately or schedule
- **Drafts** — save posts as drafts, edit and publish later
- **Post feed** — view all posts per client, filter by status, paginate, edit or delete

## Prerequisites

You will need **accounts** on [Postproxy](https://postproxy.dev) and [Supabase](https://supabase.com). In each dashboard, create or copy: a **Postproxy API key**, and your **Supabase project URL** plus **publishable (anon) key**. You will paste them into `.env.local` (local dev) or into Vercel **Environment Variables** (deploy).

- [Postproxy](https://postproxy.dev) account with an API key
- [Supabase](https://supabase.com) project with URL and publishable key
- **Node.js 18+** — only if you [run locally](#a-run-locally) below

## Getting started

### Fork this repository

1. Open **[postproxy/potato on GitHub](https://github.com/postproxy/potato)**.
2. Click **Fork** and pick your user or organization.

Your fork is the repo you own: connect Vercel to it, clone it on your laptop, or both. You do **not** need a fork only if you already have push access to the original repo.

Then pick **one path** (or do local first, deploy later).

### A. Run locally

**Clone your fork** — in a terminal, `cd` to the parent folder you want (e.g. `~/Projects`). Replace `YOUR_GITHUB_USERNAME` with yours, or paste the HTTPS URL from your fork’s green **Code** button.

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/potato.git && cd potato
cp .env.example .env.local
```

#### Install dependencies

```bash
npm install
```

#### Environment variables

The `.env.local` file holds your private keys and URLs (nothing is committed to git). Open it in any text editor and save. For example `nano .env.local` — edit, then Ctrl+O to save, Ctrl+X to exit (`nano` is common on Mac/Linux). Or use Cursor / VS Code.

Replace the placeholders with your real credentials:

```
POSTPROXY_API_KEY=your-postproxy-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-publishable-key
```

#### Database migration

Run the migration on your Supabase project — open the **SQL Editor**, paste `supabase/migrations/001_create_clients.sql`, and run it. Or use the CLI: if you have not used it on this machine, run `npx supabase login` once (opens the browser). Then:

```bash
npx supabase link
npx supabase db push
```

#### Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **Ta-da** — the app is running on your machine. Sign up, poke around: create a client, connect a social profile, try the composer.

**Sign-up email:** use a real address you can open (not a fake or random string). Supabase sends a confirmation link, and you need to verify the email before sign-in works.

### B. Deploy on Vercel

You can deploy from GitHub **without** installing Node locally. Vercel builds the app in the cloud.

1. **Fork** (above) so the code lives under your GitHub account.
2. Sign in at [vercel.com](https://vercel.com) with GitHub. If your fork does not appear when importing a project, check GitHub → **Settings** → **Applications** → **Vercel** → repository access and allow the fork.
3. **Add New → Project** → import **your** `potato` fork. Use the default Next.js settings and create the first deployment (you can fix env in the next step and redeploy).
4. Open **Project → Settings → Environment Variables** (Production). Add the **same four** names as locally; set `NEXT_PUBLIC_APP_URL` to your **live** app URL:

   | Name | Value (production) |
   |------|---------------------|
   | `POSTPROXY_API_KEY` | your Postproxy API key |
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | your Supabase publishable key |
   | `NEXT_PUBLIC_APP_URL` | full URL, e.g. `https://your-project.vercel.app` (from **Deployment → Domains**, the main production `*.vercel.app` host — include `https://`) |

   After the first deploy, copy that domain, set `NEXT_PUBLIC_APP_URL`, then **Redeploy** so OAuth callbacks use the correct host.

5. **Supabase:** **Authentication → URL configuration** — set **Site URL** to the same URL as `NEXT_PUBLIC_APP_URL`, and add that URL (plus any custom domain) under **Redirect URLs**. Run the [database migration](#database-migration) on this Supabase project once if you have not already.
6. **Redeploy** after changing env vars or Supabase URLs.

Private forks work the same way: grant Vercel access to the private repository when GitHub asks.

## Stack

- [Next.js 15](https://nextjs.org) (App Router, server actions)
- [Supabase](https://supabase.com) (database only — one table)
- [postproxy-sdk](https://www.npmjs.com/package/postproxy-sdk) (social media API)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)

## Project structure

```
src/
├── actions/          # Server actions (clients, profiles, posts)
├── app/              # Next.js routes
│   ├── callback/     # OAuth return handler
│   └── clients/      # All client pages (list, new, edit, profiles, compose, posts)
├── components/       # UI components (sidebar, compose form, post card, etc.)
└── lib/              # Postproxy SDK client, Supabase client, helpers
supabase/
└── migrations/       # SQL migration for the clients table
```

## License

MIT
