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

You will need **accounts** on [Postproxy](https://postproxy.dev) and [Supabase](https://supabase.com). In each dashboard, create or copy the credentials you will paste into `.env.local` in the next section: a **Postproxy API key**, and your **Supabase project URL** plus **publishable (anon) key** for the browser.

- Node.js 18+
- [Postproxy](https://postproxy.dev) account with an API key
- [Supabase](https://supabase.com) project with URL and publishable key

## Setup

**Get the code.** Open a terminal and `cd` to the parent folder where you want the project (for example `~/Projects`). The first command clones this repo into a new `potato` subdirectory and switches into it; the next command copies the env template.

```bash
git clone https://github.com/postproxy/potato && cd potato
cp .env.example .env.local
```

## Install dependencies

```bash
npm install
```

**Environment variables.** The `.env.local` file holds your private keys and URLs (nothing is committed to git). Open it in any text editor, fill in the values below, and save. For example `nano .env.local` — edit the lines, then press Ctrl+O to save and Ctrl+X to exit (`nano` is available on most Mac/Linux systems).

Replace the placeholders with your real credentials:

```
POSTPROXY_API_KEY=your-postproxy-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-publishable-key
```

Run the database migration — open your Supabase SQL Editor and paste the contents of `supabase/migrations/001_create_clients.sql`, then run it. Or use the Supabase CLI: if you have not signed in on this machine before, run `npx supabase login` once (it opens the browser). Then:

```bash
npx supabase link
npx supabase db push
```

Start:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **Ta-da** — the app is running on your machine. Sign up, poke around: create a client, connect a social profile, try the composer.

**Sign-up email:** use a real address you can open (not a fake or random string). Supabase sends a confirmation link, and you need to verify the email before sign-in works.

## Deploy

Works out of the box on Vercel:

1. Push to GitHub
2. Import in Vercel
3. Add the four environment variables (set `NEXT_PUBLIC_APP_URL` to your production URL)
4. Deploy

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
└── lib/              # PostProxy SDK client, Supabase client, helpers
supabase/
└── migrations/       # SQL migration for the clients table
```

## License

MIT
