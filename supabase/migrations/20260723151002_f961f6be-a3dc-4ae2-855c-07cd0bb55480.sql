
-- Convertir funciones de solo-lectura a SECURITY INVOKER (RLS permite ya el acceso propio)
ALTER FUNCTION public.has_active_subscription(uuid, text) SECURITY INVOKER;
ALTER FUNCTION public.user_data_sync_status(text) SECURITY INVOKER;
ALTER FUNCTION public.match_rag_chunks(vector, text, integer) SECURITY INVOKER;
