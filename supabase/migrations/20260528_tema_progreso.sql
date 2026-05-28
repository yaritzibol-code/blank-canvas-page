-- Track per-user progress and perceived difficulty for each tema
create table public.tema_progreso (
  id                   uuid         default gen_random_uuid() primary key,
  user_id              uuid         references auth.users(id) on delete cascade not null,
  tema_id              text         not null,                          -- e.g. "aerodinamica-1-1"
  completado           boolean      default false,
  dificultad_percibida smallint     check (dificultad_percibida between 1 and 5),
  fecha_completado     timestamptz,
  intentos_actividad   integer      default 0,
  created_at           timestamptz  default now(),
  updated_at           timestamptz  default now(),

  unique (user_id, tema_id)
);

-- Auto-update updated_at on row modification
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tema_progreso_updated_at
  before update on public.tema_progreso
  for each row execute procedure public.handle_updated_at();

-- Row-Level Security: students can only see and modify their own rows
alter table public.tema_progreso enable row level security;

create policy "select_own" on public.tema_progreso
  for select using (auth.uid() = user_id);

create policy "insert_own" on public.tema_progreso
  for insert with check (auth.uid() = user_id);

create policy "update_own" on public.tema_progreso
  for update using (auth.uid() = user_id);

-- Useful index for dashboard queries (progress by materia prefix)
create index tema_progreso_user_tema_idx on public.tema_progreso (user_id, tema_id);
