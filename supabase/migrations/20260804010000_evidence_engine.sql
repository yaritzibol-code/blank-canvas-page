-- Evidence Engine (defensa de contracargos):
--   * evidence_events: ledger append-only de eventos con contexto de request
--     (IP, user agent, idioma, timezone). Inmutable incluso para service role.
--   * disputes: disputas de Stripe recibidas por webhook (charge.dispute.*).
-- Lectura solo para admins; escritura solo desde el servidor (service role).

create table if not exists public.evidence_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  event text not null,
  environment text not null default 'live',
  ip text,
  user_agent text,
  locale text,
  timezone text,
  referer text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists evidence_events_user_idx on public.evidence_events (user_id, created_at);
create index if not exists evidence_events_event_idx on public.evidence_events (event, created_at);

alter table public.evidence_events enable row level security;
drop policy if exists evidence_admin_read on public.evidence_events;
create policy evidence_admin_read on public.evidence_events for select using (public.is_admin());

create or replace function public.evidence_events_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'evidence_events es un ledger append-only: no se permite % en el registro %', TG_OP, old.id;
end $$;
drop trigger if exists evidence_events_no_mutation on public.evidence_events;
create trigger evidence_events_no_mutation
  before update or delete on public.evidence_events
  for each row execute function public.evidence_events_immutable();

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  stripe_dispute_id text not null unique,
  charge_id text,
  payment_intent_id text,
  user_id uuid,
  environment text not null,
  reason text,
  status text,
  amount numeric,
  currency text,
  evidence_due_by timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.disputes enable row level security;
drop policy if exists disputes_admin_read on public.disputes;
create policy disputes_admin_read on public.disputes for select using (public.is_admin());
