drop policy if exists "Anyone can subscribe" on public.subscribers;

alter table public.subscribers
  add column email_opt_in boolean not null default true,
  add column email_status text not null default 'confirmed'
    check (email_status in ('pending', 'confirmed', 'unsubscribed')),
  add column email_confirmed_at timestamptz,
  add column email_confirmation_token_hash text unique,
  add column email_confirmation_expires_at timestamptz,
  add column email_confirmation_error text;

update public.subscribers
set
  email_opt_in = status = 'active',
  email_status = case when status = 'active' then 'confirmed' else 'unsubscribed' end,
  email_confirmed_at = case when status = 'active' then created_at else null end;

drop index if exists public.subscribers_status_created_at_idx;
alter table public.subscribers drop column status;
alter table public.subscribers alter column email_opt_in set default false;
alter table public.subscribers alter column email_status set default 'unsubscribed';

alter table public.subscribers
  add constraint subscribers_email_preferences_check
    check (
      (email_opt_in and email_status in ('pending', 'confirmed'))
      or (not email_opt_in and email_status = 'unsubscribed')
    ),
  add constraint subscribers_confirmation_token_check
    check (
      (email_status = 'pending'
        and email_confirmed_at is null
        and email_confirmation_token_hash is not null
        and email_confirmation_expires_at is not null)
      or (email_status = 'confirmed'
        and email_confirmed_at is not null
        and email_confirmation_token_hash is null
        and email_confirmation_expires_at is null)
      or (email_status = 'unsubscribed'
        and email_confirmed_at is null
        and email_confirmation_token_hash is null
        and email_confirmation_expires_at is null)
    );

create index subscribers_email_status_created_at_idx
  on public.subscribers (email_status, created_at desc);
create index subscribers_sms_opt_in_created_at_idx
  on public.subscribers (sms_opt_in, created_at desc);

revoke insert on public.subscribers from anon, authenticated;
grant insert on public.subscribers to service_role;

create table public.devotional_email_events (
  provider_event_id text primary key,
  delivery_id uuid not null references public.devotional_email_deliveries (id) on delete cascade,
  event_type text not null check (event_type in ('delivered', 'failed', 'opened', 'clicked')),
  clicked_url text,
  occurred_at timestamptz not null
);

create index devotional_email_events_delivery_type_idx
  on public.devotional_email_events (delivery_id, event_type);

alter table public.devotional_email_events enable row level security;

grant select on public.devotional_email_events to authenticated;
grant select, insert on public.devotional_email_events to service_role;

create policy "Admins can read devotional email events"
  on public.devotional_email_events for select to authenticated
  using ((select public.is_admin()));

grant update on public.subscribers to service_role;
