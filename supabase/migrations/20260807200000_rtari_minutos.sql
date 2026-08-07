-- Minutos de entrevista RTARI (voz).
--
-- La voz se cobra por minuto de audio, así que el módulo se mide en minutos y
-- no en "sesiones": una sesión de 3 minutos y una de 20 no cuestan lo mismo.
--
--   * rtari_saldo       — estado actual por usuario. Los minutos INCLUIDOS son
--                         del ciclo mensual y no se acumulan (se reinician al
--                         cambiar de mes); los COMPRADOS no vencen.
--   * rtari_movimientos — bitácora de cada alta y cada consumo, para poder
--                         explicarle a un alumno a dónde se fueron sus minutos.
--
-- El saldo lo escribe únicamente el servidor (service role). El alumno puede
-- leer lo suyo; la administradora, todo.

create table if not exists public.rtari_saldo (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- Ciclo mensual vigente en formato 'YYYY-MM'.
  ciclo text not null,
  -- Minutos incluidos otorgados y gastados dentro de ESTE ciclo.
  segundos_incluidos integer not null default 0,
  segundos_incluidos_usados integer not null default 0,
  -- Saldo comprado, ya neto de consumo. No vence ni se reinicia.
  segundos_comprados integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.rtari_saldo enable row level security;
drop policy if exists rtari_saldo_read_own on public.rtari_saldo;
create policy rtari_saldo_read_own on public.rtari_saldo
  for select to authenticated using (auth.uid() = user_id or public.is_admin());

grant select on public.rtari_saldo to authenticated;
grant all on public.rtari_saldo to service_role;

create table if not exists public.rtari_movimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Positivo acredita, negativo consume.
  segundos integer not null,
  -- 'incluido' | 'compra' | 'consumo' | 'reembolso' | 'ajuste'
  tipo text not null check (tipo in ('incluido', 'compra', 'consumo', 'reembolso', 'ajuste')),
  -- Referencia para conciliar: id de sesión, de checkout de Stripe, etc.
  ref text,
  detalle jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists rtari_mov_user_idx on public.rtari_movimientos (user_id, created_at desc);
create index if not exists rtari_mov_ref_idx on public.rtari_movimientos (ref) where ref is not null;
-- Idempotencia a nivel base: una compra y una devolución sólo pueden ocurrir
-- UNA vez por referencia. Es lo que hace inofensivo que el webhook de Stripe
-- se entregue dos veces, o que la pantalla y su red de seguridad liquiden la
-- misma entrevista a la vez.
create unique index if not exists rtari_mov_compra_ref_idx
  on public.rtari_movimientos (ref) where tipo = 'compra';
create unique index if not exists rtari_mov_reembolso_ref_idx
  on public.rtari_movimientos (ref) where tipo = 'reembolso';

alter table public.rtari_movimientos enable row level security;
drop policy if exists rtari_mov_read_own on public.rtari_movimientos;
create policy rtari_mov_read_own on public.rtari_movimientos
  for select to authenticated using (auth.uid() = user_id or public.is_admin());

grant select on public.rtari_movimientos to authenticated;
grant all on public.rtari_movimientos to service_role;

-- ── Otorgar los minutos incluidos del ciclo ──────────────────────────────
--
-- Idempotente por (usuario, ciclo): llamarla diez veces en el mismo mes deja
-- el mismo saldo. Al cambiar de mes reinicia los incluidos —no se acumulan—
-- y deja intacto lo comprado.
create or replace function public.rtari_asegurar_ciclo(
  p_user uuid,
  p_ciclo text,
  p_segundos_incluidos integer
) returns public.rtari_saldo
language plpgsql
security definer
set search_path = public
as $$
declare
  fila public.rtari_saldo;
begin
  insert into public.rtari_saldo (user_id, ciclo, segundos_incluidos)
  values (p_user, p_ciclo, p_segundos_incluidos)
  on conflict (user_id) do nothing;

  select * into fila from public.rtari_saldo where user_id = p_user for update;

  if fila.ciclo is distinct from p_ciclo then
    update public.rtari_saldo
       set ciclo = p_ciclo,
           segundos_incluidos = p_segundos_incluidos,
           segundos_incluidos_usados = 0,
           updated_at = now()
     where user_id = p_user
     returning * into fila;

    insert into public.rtari_movimientos (user_id, segundos, tipo, ref, detalle)
    values (p_user, p_segundos_incluidos, 'incluido', p_ciclo,
            jsonb_build_object('motivo', 'ciclo nuevo'));

  elsif fila.segundos_incluidos is distinct from p_segundos_incluidos then
    -- Cambió la cuota del plan a media suscripción: se ajusta sin perder lo
    -- ya gastado en el ciclo.
    update public.rtari_saldo
       set segundos_incluidos = p_segundos_incluidos,
           updated_at = now()
     where user_id = p_user
     returning * into fila;
  end if;

  return fila;
end $$;

revoke all on function public.rtari_asegurar_ciclo(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.rtari_asegurar_ciclo(uuid, text, integer) to service_role;

-- ── Consumir minutos ─────────────────────────────────────────────────────
--
-- Descuenta primero de los incluidos del ciclo y luego de los comprados, en
-- UNA sola operación con el renglón bloqueado: dos entrevistas abiertas al
-- mismo tiempo no pueden gastar el mismo saldo dos veces.
--
-- Devuelve cuántos segundos se pudieron descontar realmente, que puede ser
-- menos de lo pedido si al alumno no le alcanzaba.
create or replace function public.rtari_consumir(
  p_user uuid,
  p_segundos integer,
  p_ref text default null,
  p_detalle jsonb default '{}'::jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  fila public.rtari_saldo;
  disponible_incluidos integer;
  usar_incluidos integer;
  usar_comprados integer;
  total integer;
begin
  if p_segundos is null or p_segundos <= 0 then
    return 0;
  end if;

  select * into fila from public.rtari_saldo where user_id = p_user for update;
  if not found then
    return 0;
  end if;

  disponible_incluidos := greatest(0, fila.segundos_incluidos - fila.segundos_incluidos_usados);
  usar_incluidos := least(disponible_incluidos, p_segundos);
  usar_comprados := least(greatest(0, fila.segundos_comprados), p_segundos - usar_incluidos);
  total := usar_incluidos + usar_comprados;

  if total = 0 then
    return 0;
  end if;

  update public.rtari_saldo
     set segundos_incluidos_usados = segundos_incluidos_usados + usar_incluidos,
         segundos_comprados = segundos_comprados - usar_comprados,
         updated_at = now()
   where user_id = p_user;

  insert into public.rtari_movimientos (user_id, segundos, tipo, ref, detalle)
  values (p_user, -total, 'consumo', p_ref,
          p_detalle || jsonb_build_object('incluidos', usar_incluidos, 'comprados', usar_comprados));

  return total;
end $$;

revoke all on function public.rtari_consumir(uuid, integer, text, jsonb) from public, anon, authenticated;
grant execute on function public.rtari_consumir(uuid, integer, text, jsonb) to service_role;

-- ── Devolver minutos no usados ───────────────────────────────────────────
--
-- La entrevista cobra por adelantado el máximo que puede durar y al colgar
-- devuelve la diferencia. Se devuelve en orden INVERSO al que se cobró —
-- primero lo comprado— porque el consumo gasta primero los minutos incluidos:
-- devolver al revés le dejaría al alumno minutos que vencen a fin de mes en
-- lugar de los que compró, que no vencen.
--
-- El movimiento se inserta ANTES de tocar el saldo y con `on conflict do
-- nothing`: el índice único por referencia hace que una segunda liquidación de
-- la misma entrevista no devuelva nada, aunque llegue al mismo tiempo que la
-- primera.
create or replace function public.rtari_devolver(
  p_user uuid,
  p_segundos_incluidos integer,
  p_segundos_comprados integer,
  p_ref text default null,
  p_detalle jsonb default '{}'::jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  fila public.rtari_saldo;
  dev_incluidos integer;
  total integer;
  movimiento uuid;
begin
  p_segundos_incluidos := greatest(0, coalesce(p_segundos_incluidos, 0));
  p_segundos_comprados := greatest(0, coalesce(p_segundos_comprados, 0));
  total := p_segundos_incluidos + p_segundos_comprados;
  if total = 0 or p_ref is null then
    return 0;
  end if;

  select * into fila from public.rtari_saldo where user_id = p_user for update;
  if not found then
    return 0;
  end if;

  -- Nunca se devuelve más de lo que se había marcado como usado en el ciclo.
  dev_incluidos := least(p_segundos_incluidos, fila.segundos_incluidos_usados);

  insert into public.rtari_movimientos (user_id, segundos, tipo, ref, detalle)
  values (p_user, dev_incluidos + p_segundos_comprados, 'reembolso', p_ref,
          p_detalle || jsonb_build_object('incluidos', dev_incluidos, 'comprados', p_segundos_comprados))
  on conflict do nothing
  returning id into movimiento;

  if movimiento is null then
    return 0;  -- esta entrevista ya se había liquidado
  end if;

  update public.rtari_saldo
     set segundos_incluidos_usados = segundos_incluidos_usados - dev_incluidos,
         segundos_comprados = segundos_comprados + p_segundos_comprados,
         updated_at = now()
   where user_id = p_user;

  return dev_incluidos + p_segundos_comprados;
end $$;

revoke all on function public.rtari_devolver(uuid, integer, integer, text, jsonb) from public, anon, authenticated;
grant execute on function public.rtari_devolver(uuid, integer, integer, text, jsonb) to service_role;

-- ── Acreditar una compra ─────────────────────────────────────────────────
--
-- Idempotente por `p_ref` (el id de la sesión de checkout de Stripe): el
-- índice único deja pasar el primer movimiento y descarta los repetidos, así
-- que reintentar el webhook no acredita minutos de más.
create or replace function public.rtari_acreditar_compra(
  p_user uuid,
  p_segundos integer,
  p_ref text,
  p_detalle jsonb default '{}'::jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  movimiento uuid;
begin
  if p_segundos is null or p_segundos <= 0 or p_ref is null then
    return 0;
  end if;

  insert into public.rtari_movimientos (user_id, segundos, tipo, ref, detalle)
  values (p_user, p_segundos, 'compra', p_ref, p_detalle)
  on conflict do nothing
  returning id into movimiento;

  if movimiento is null then
    return 0;  -- este checkout ya se había acreditado
  end if;

  insert into public.rtari_saldo (user_id, ciclo, segundos_comprados)
  values (p_user, to_char(now(), 'YYYY-MM'), p_segundos)
  on conflict (user_id) do update
    set segundos_comprados = public.rtari_saldo.segundos_comprados + p_segundos,
        updated_at = now();

  return p_segundos;
end $$;

revoke all on function public.rtari_acreditar_compra(uuid, integer, text, jsonb) from public, anon, authenticated;
grant execute on function public.rtari_acreditar_compra(uuid, integer, text, jsonb) to service_role;

-- ── Costo real por llamada en `ai_usage` ─────────────────────────────────
--
-- Hasta ahora el costo se estimaba en el panel multiplicando tokens por una
-- tarifa fija de texto. Con la voz eso deja de servir: un token de audio
-- cuesta ~25 veces más que uno de texto, así que el panel reportaría una
-- fracción del gasto real. Quien hace la llamada sabe qué modelo usó y a qué
-- tarifa, y escribe aquí el costo ya calculado.
alter table public.ai_usage add column if not exists cost_usd numeric;

create or replace function public.admin_ai_daily(days_back integer default 30)
 returns table (
   day date,
   calls bigint,
   errors bigint,
   tokens_in bigint,
   tokens_out bigint,
   avg_latency_ms integer,
   cost_usd numeric,
   tokens_in_est bigint,
   tokens_out_est bigint
 )
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  WITH days AS (
    SELECT generate_series((CURRENT_DATE - (days_back - 1))::date, CURRENT_DATE, '1 day')::date AS d
  )
  SELECT
    days.d AS day,
    COUNT(u.id)::bigint AS calls,
    COUNT(u.id) FILTER (WHERE u.success = false)::bigint AS errors,
    COALESCE(SUM(u.tokens_in), 0)::bigint AS tokens_in,
    COALESCE(SUM(u.tokens_out), 0)::bigint AS tokens_out,
    COALESCE(AVG(u.latency_ms)::int, 0) AS avg_latency_ms,
    COALESCE(SUM(u.cost_usd), 0)::numeric AS cost_usd,
    -- Tokens de las llamadas que NO traen costo propio: son las únicas que el
    -- panel debe estimar con la tarifa de texto. Sumar el estimado sobre TODOS
    -- los tokens contaría dos veces las llamadas que ya reportaron su costo.
    COALESCE(SUM(u.tokens_in) FILTER (WHERE u.cost_usd IS NULL), 0)::bigint AS tokens_in_est,
    COALESCE(SUM(u.tokens_out) FILTER (WHERE u.cost_usd IS NULL), 0)::bigint AS tokens_out_est
  FROM days
  LEFT JOIN public.ai_usage u ON u.created_at::date = days.d
  WHERE public.is_admin_ctx()
  GROUP BY days.d
  ORDER BY days.d;
$function$;

create or replace function public.admin_ai_stats(hours_back integer default 24)
 returns jsonb
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  SELECT CASE WHEN public.is_admin_ctx() THEN jsonb_build_object(
    'calls', (SELECT count(*) FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'errors', (SELECT count(*) FROM public.ai_usage WHERE success = false AND created_at > now() - make_interval(hours => hours_back)),
    'tokens_in', (SELECT COALESCE(sum(tokens_in),0) FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'tokens_out', (SELECT COALESCE(sum(tokens_out),0) FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'cost_usd', (SELECT COALESCE(sum(cost_usd),0) FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'tokens_in_est', (SELECT COALESCE(sum(tokens_in),0) FROM public.ai_usage WHERE cost_usd IS NULL AND created_at > now() - make_interval(hours => hours_back)),
    'tokens_out_est', (SELECT COALESCE(sum(tokens_out),0) FROM public.ai_usage WHERE cost_usd IS NULL AND created_at > now() - make_interval(hours => hours_back)),
    'latency_p50', (SELECT COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY latency_ms), 0)::int FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back)),
    'latency_p95', (SELECT COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms), 0)::int FROM public.ai_usage WHERE created_at > now() - make_interval(hours => hours_back))
  ) ELSE NULL END;
$function$;
