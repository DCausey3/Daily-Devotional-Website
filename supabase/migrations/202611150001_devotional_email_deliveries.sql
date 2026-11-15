create table public.devotional_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  devotional_id uuid not null references public.devotionals (id) on delete cascade,
  subscriber_id uuid references public.subscribers (id) on delete set null,
  recipient_email text not null check (char_length(recipient_email) between 3 and 254),
  status text not null default 'queued' check (status in ('queued', 'sending', 'sent', 'delivered', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  provider_message_id text unique,
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (devotional_id, recipient_email)
);

create index devotional_email_deliveries_devotional_status_idx
  on public.devotional_email_deliveries (devotional_id, status);

alter table public.devotional_email_deliveries enable row level security;

grant select, insert, update on public.devotional_email_deliveries to authenticated;
grant select, update on public.devotional_email_deliveries to service_role;

create policy "Admins can manage devotional email deliveries"
  on public.devotional_email_deliveries for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
