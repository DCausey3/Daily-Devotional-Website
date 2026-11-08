create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 5 and 5000),
  created_at timestamptz not null default now()
);

create table public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  name text check (name is null or char_length(name) <= 100),
  email text check (email is null or char_length(email) <= 254),
  message text not null check (char_length(message) between 5 and 5000),
  created_at timestamptz not null default now()
);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index prayer_requests_created_at_idx on public.prayer_requests (created_at desc);

alter table public.contact_messages enable row level security;
alter table public.prayer_requests enable row level security;

grant insert on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;
grant insert on public.prayer_requests to anon, authenticated;
grant select on public.prayer_requests to authenticated;

create policy "Anyone can send contact messages"
  on public.contact_messages for insert
  with check (true);

create policy "Admins can read contact messages"
  on public.contact_messages for select to authenticated
  using ((select public.is_admin()));

create policy "Anyone can send prayer requests"
  on public.prayer_requests for insert
  with check (true);

create policy "Admins can read prayer requests"
  on public.prayer_requests for select to authenticated
  using ((select public.is_admin()));
