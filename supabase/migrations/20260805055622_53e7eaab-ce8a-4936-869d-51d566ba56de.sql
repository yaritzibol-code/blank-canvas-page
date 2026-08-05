CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_admin() OR auth.role() = 'service_role') THEN
    NEW.role := OLD.role;
    IF OLD.data ? 'plan' THEN
      NEW.data := NEW.data || jsonb_build_object(
        'plan', OLD.data->'plan',
        'planNombre', OLD.data->'planNombre',
        'accessStatus', OLD.data->'accessStatus',
        'accessStart', OLD.data->'accessStart',
        'accessEnd', OLD.data->'accessEnd',
        'notasInternas', OLD.data->'notasInternas'
      );
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;