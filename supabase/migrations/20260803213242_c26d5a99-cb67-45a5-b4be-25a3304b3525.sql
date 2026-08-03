CREATE TABLE public.billing_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event text not null,
  environment text not null check (environment in ('sandbox','live')),
  source text not null default 'app',
  ok boolean not null default true,
  message text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

CREATE INDEX idx_billing_audit_created ON public.billing_audit(created_at DESC);
CREATE INDEX idx_billing_audit_user ON public.billing_audit(user_id);
CREATE INDEX idx_billing_audit_event ON public.billing_audit(event);

GRANT SELECT ON public.billing_audit TO authenticated;
GRANT ALL ON public.billing_audit TO service_role;

ALTER TABLE public.billing_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read billing audit"
  ON public.billing_audit FOR SELECT
  TO authenticated
  USING (public.is_admin());