-- 1. Actualizar roles existentes
update public.profiles set role = 'student' where email = 'admin@flightpath.mx';
update public.profiles set role = 'admin' where email in ('rdaniel.guzman@glassway.mx','yaritzi.bol@glassway.mx');

-- 2. Reescribir handle_new_user() con lista blanca de admins
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_role text := 'student';
  v_admin_emails text[] := array['rdaniel.guzman@glassway.mx','yaritzi.bol@glassway.mx'];
begin
  if new.email = any(v_admin_emails) or not exists (select 1 from public.profiles) then
    v_role := 'admin';
  end if;
  insert into public.profiles (id, email, role, data)
  values (
    new.id,
    coalesce(new.email, ''),
    v_role,
    jsonb_build_object(
      'nombre', coalesce(new.raw_user_meta_data->>'nombre', ''),
      'marketingOptIn', coalesce((new.raw_user_meta_data->>'marketingOptIn')::boolean, false)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;