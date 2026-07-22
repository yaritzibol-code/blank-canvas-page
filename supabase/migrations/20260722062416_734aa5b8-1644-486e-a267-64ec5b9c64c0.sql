-- Asegurar que los correos administrativos siempre tengan rol admin,
-- incluso si se registraron previamente con otro método (Google, email).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
      'nombre', coalesce(new.raw_user_meta_data->>'nombre', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
      'marketingOptIn', coalesce((new.raw_user_meta_data->>'marketingOptIn')::boolean, false)
    )
  )
  on conflict (id) do update
    set role = case
      when excluded.email = any(array['rdaniel.guzman@glassway.mx','yaritzi.bol@glassway.mx']) then 'admin'
      else public.profiles.role
    end;
  return new;
end;
$$;

-- Corrige cualquier fila existente que quedó como student por creación previa.
UPDATE public.profiles
SET role = 'admin'
WHERE email IN ('rdaniel.guzman@glassway.mx','yaritzi.bol@glassway.mx')
  AND role <> 'admin';