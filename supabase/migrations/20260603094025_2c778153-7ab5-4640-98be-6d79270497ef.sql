-- Revoke broad EXECUTE permissions on SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_school_id() FROM PUBLIC, anon;

-- handle_new_user is only invoked by the auth.users trigger; only service_role needs it
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- has_role and current_user_school_id are used inside RLS policies; authenticated callers must keep execute
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_school_id() TO authenticated, service_role;
