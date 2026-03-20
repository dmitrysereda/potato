-- App users table: tracks who can access the app and their role
create table app_users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique,
  email text not null unique,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz default now()
);

create index idx_app_users_auth_id on app_users(auth_id);
create index idx_app_users_email on app_users(email);

-- Invites table: owner invites others by email
create table invites (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  token text not null unique,
  invited_by uuid references app_users(id) on delete cascade,
  created_at timestamptz default now()
);

create index idx_invites_token on invites(token);
create index idx_invites_email on invites(email);
