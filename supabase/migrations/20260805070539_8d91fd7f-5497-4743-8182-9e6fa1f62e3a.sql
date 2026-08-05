CREATE OR REPLACE FUNCTION public.evidence_events_immutable()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  raise exception 'evidence_events es un ledger append-only: no se permite % en el registro %', TG_OP, old.id;
end $function$;

CREATE OR REPLACE FUNCTION public.seed_content(p_collection text, p_items jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
declare
  v_count integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  select count(*) into v_count from public.content where collection = p_collection;
  if v_count > 0 then
    return 0;
  end if;
  insert into public.content (collection, id, data)
  select p_collection, item->>'id', item
  from jsonb_array_elements(p_items) as item
  on conflict (collection, id) do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end;
$function$;

REVOKE EXECUTE ON FUNCTION public.seed_content(text, jsonb) FROM anon;