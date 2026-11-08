create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.devotionals (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  scripture_reference text not null check (char_length(scripture_reference) between 1 and 120),
  topic text not null check (char_length(topic) between 1 and 80),
  excerpt text not null check (char_length(excerpt) between 1 and 500),
  body text not null check (char_length(body) between 1 and 30000),
  prayer text check (prayer is null or char_length(prayer) <= 3000),
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) between 7 and 32),
  sms_opt_in boolean not null default false,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamptz not null default now()
);

create unique index subscribers_email_lower_unique on public.subscribers (lower(email));
create index devotionals_published_at_idx on public.devotionals (published_at desc);
create index subscribers_status_created_at_idx on public.subscribers (status, created_at desc);

alter table public.admin_users enable row level security;
alter table public.devotionals enable row level security;
alter table public.subscribers enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

grant select on public.devotionals to anon, authenticated;
grant insert, update, delete on public.devotionals to authenticated;
grant insert on public.subscribers to anon, authenticated;
grant select, update on public.subscribers to authenticated;

create policy "Published devotionals are public"
  on public.devotionals for select
  using (status = 'published' or (select public.is_admin()));

create policy "Admins can insert devotionals"
  on public.devotionals for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update devotionals"
  on public.devotionals for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete devotionals"
  on public.devotionals for delete to authenticated
  using ((select public.is_admin()));

create policy "Anyone can subscribe"
  on public.subscribers for insert
  with check (status = 'active' and (not sms_opt_in or phone is not null));

create policy "Admins can read subscribers"
  on public.subscribers for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can update subscribers"
  on public.subscribers for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
