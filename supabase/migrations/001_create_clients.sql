create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text default '',
  postproxy_profile_group_id text not null,
  created_at timestamptz default now()
);

create index idx_clients_created_at on clients(created_at desc);
