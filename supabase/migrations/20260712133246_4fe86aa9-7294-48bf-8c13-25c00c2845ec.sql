
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;

CREATE POLICY "Public can read public site settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (key IN ('hero_title','hero_subtitle','about_tagline','facebook_url','whatsapp_url','youtube_url','instagram_handle'));

CREATE POLICY "Editors can read all site settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'editor'));
