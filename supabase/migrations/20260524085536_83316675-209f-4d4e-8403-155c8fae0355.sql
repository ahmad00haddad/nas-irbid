
-- 1) Drop the memories table (feature removed; contained public contributor emails)
DROP TABLE IF EXISTS public.memories CASCADE;

-- 2) Remove the open public upload policy on storage; keep admin/editor management policy
DROP POLICY IF EXISTS "anyone uploads media" ON storage.objects;

-- 3) Lock down has_role(): revoke from public/anon/authenticated.
--    RLS policies invoke it under the function owner's privileges (SECURITY DEFINER),
--    so this does not break access control.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
