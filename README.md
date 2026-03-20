<p align="center">
  <img src="src/app/icon.png" width="120" alt="Potato" />
</p>

# Potato

Why "Potato"? Because you can make anything out of a potato. This is a blueprint for working with [PostProxy](https://postproxy.dev) — client management, social accounts, composing and scheduling posts — and from here you can take it anywhere. Plug in generative AI for images and copy, add an approval workflow, build dashboards — whatever you need.

Built on Next.js + Supabase.

## Features

- **Clients** — organize work by client, each with their own connected accounts
- **Connect accounts** — OAuth flow for Facebook, Instagram, Twitter/X, LinkedIn, TikTok, YouTube, Threads, Pinterest
- **Compose** — write posts, attach media, create threads, publish immediately or schedule
- **Drafts** — save posts as drafts, edit and publish later
- **Post feed** — view all posts per client, filter by status, paginate, edit or delete

## Prerequisites

- Node.js 18+
- A [PostProxy](https://postproxy.dev) account and API key
- A [Supabase](https://supabase.com) project

## Setup

```bash
git clone <repo-url> && cd potato
cp .env.example .env.local
```

## Install dependencies

```bash
npm install
```

Fill in your `.env.local`:

```
POSTPROXY_API_KEY=your-postproxy-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-publishable-key
```

Run the database migration — open your Supabase SQL Editor and paste the contents of `supabase/migrations/001_create_clients.sql`, then run it. Or:

```bash
npx supabase link
npx supabase db push
```

Start:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
