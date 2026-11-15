alter table public.subscribers
  add column email_opt_in_at timestamptz,
  add column email_unsubscribed_at timestamptz;

update public.subscribers
set email_opt_in_at = email_confirmed_at
where email_status = 'confirmed';

create table public.subscriber_preference_tokens (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  subscriber_id uuid not null references public.subscribers (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.subscriber_preference_tokens enable row level security;
revoke all on public.subscriber_preference_tokens from anon, authenticated;
grant select, insert on public.subscriber_preference_tokens to service_role;
