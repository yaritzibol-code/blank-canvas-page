
-- 1. pgvector extension for RAG
create extension if not exists vector;
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Subscriptions table (Stripe)
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  product_id text not null,
  price_id text not null,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  environment text not null default 'sandbox',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_id on public.subscriptions(stripe_subscription_id);

grant select on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;

alter table public.subscriptions enable row level security;

create policy "Users view own subscription"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Service role manages subscriptions"
  on public.subscriptions for all
  to service_role
  using (true) with check (true);

create or replace function public.has_active_subscription(
  user_uuid uuid,
  check_env text default 'live'
) returns boolean
language sql security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = user_uuid
    and environment = check_env
    and (
      (status in ('active','trialing') and (current_period_end is null or current_period_end > now()))
      or (status = 'canceled' and current_period_end > now())
    )
  );
$$;

-- 3. Reminder events (WhatsApp reminders log)
create table public.reminder_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  reminder_id text not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index idx_reminder_events_user on public.reminder_events(user_id);
create index idx_reminder_events_status on public.reminder_events(status, scheduled_for);

grant select on public.reminder_events to authenticated;
grant all on public.reminder_events to service_role;

alter table public.reminder_events enable row level security;

create policy "Users view own reminder events"
  on public.reminder_events for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Service role manages reminder events"
  on public.reminder_events for all
  to service_role
  using (true) with check (true);

-- 4. RAG chunks for Yaris
create table public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  materia text,
  content text not null,
  embedding vector(3072) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index idx_rag_chunks_source on public.rag_chunks(source_type, source_id);
create index idx_rag_chunks_materia on public.rag_chunks(materia);
create index rag_chunks_embedding_idx
  on public.rag_chunks using hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);

grant select on public.rag_chunks to authenticated;
grant all on public.rag_chunks to service_role;

alter table public.rag_chunks enable row level security;

create policy "Authenticated users read rag chunks"
  on public.rag_chunks for select
  to authenticated
  using (true);

create policy "Service role manages rag chunks"
  on public.rag_chunks for all
  to service_role
  using (true) with check (true);

-- RPC for similarity search
create or replace function public.match_rag_chunks(
  query_embedding vector(3072),
  materia_filter text default null,
  match_count int default 6
) returns table (
  id uuid,
  source_type text,
  source_id text,
  materia text,
  content text,
  metadata jsonb,
  similarity float
) language sql stable security definer
set search_path = public
as $$
  select
    r.id, r.source_type, r.source_id, r.materia, r.content, r.metadata,
    1 - (r.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)) as similarity
  from public.rag_chunks r
  where materia_filter is null or r.materia = materia_filter
  order by r.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)
  limit match_count;
$$;

grant execute on function public.match_rag_chunks(vector, text, int) to authenticated;
