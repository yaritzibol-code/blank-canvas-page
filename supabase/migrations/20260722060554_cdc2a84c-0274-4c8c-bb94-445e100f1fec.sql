
REVOKE EXECUTE ON FUNCTION public.admin_mrr(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_pro_stats(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_stripe_event_stats(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_ai_stats(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_platform_stats() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_plan_drift(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_mrr(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_pro_stats(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_stripe_event_stats(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_ai_stats(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_platform_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_plan_drift(text) TO authenticated;
