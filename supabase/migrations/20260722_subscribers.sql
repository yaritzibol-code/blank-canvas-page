-- Suscripciones de pago (Stripe).
-- Una fila por usuario; la escriben las edge functions con service role
-- (check-subscription), los usuarios solo pueden LEER la suya.

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  stripe_customer_id text,
  subscribed boolean not null default false,
  subscription_tier text,
  subscription_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- Cada quien ve solo su suscripción (por id de usuario o por correo).
create policy "select_own_subscription" on public.subscribers
  for select
  using (user_id = auth.uid() or email = auth.email());

-- Sin políticas de insert/update/delete: solo las edge functions (service
-- role, que ignora RLS) modifican esta tabla.
