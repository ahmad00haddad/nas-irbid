-- 1. Restrict SECURITY DEFINER trigger helper from direct execution
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- 2. Remove always-true RLS policies on site_analytics
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.site_analytics;
DROP POLICY IF EXISTS "Only authenticated users can view analytics" ON public.site_analytics;

CREATE POLICY "anyone records analytics"
ON public.site_analytics FOR INSERT TO anon, authenticated
WITH CHECK (
  length(session_id) BETWEEN 1 AND 128
  AND length(path) BETWEEN 1 AND 512
  AND length(event_type) BETWEEN 1 AND 64
);

CREATE POLICY "staff read analytics"
ON public.site_analytics FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- 3. Explicit storage policies for the public media bucket
DROP POLICY IF EXISTS "public read nas irbid media" ON storage.objects;
CREATE POLICY "public read nas irbid media"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'nas-irbid-media');
