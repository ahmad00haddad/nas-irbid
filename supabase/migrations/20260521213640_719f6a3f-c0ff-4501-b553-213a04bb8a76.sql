
-- Fix function search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Tighten public INSERT policies with content validation (not always-true)
DROP POLICY "anyone can suggest" ON public.guest_suggestions;
CREATE POLICY "anyone can suggest" ON public.guest_suggestions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(candidate_name) BETWEEN 2 AND 200
    AND length(story_summary) BETWEEN 5 AND 5000
  );

DROP POLICY "anyone can submit memory" ON public.memories;
CREATE POLICY "anyone can submit memory" ON public.memories
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(body) BETWEEN 5 AND 5000
    AND approved = false
    AND featured = false
  );

DROP POLICY "anyone submits questions" ON public.questions;
CREATE POLICY "anyone submits questions" ON public.questions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(question_text) BETWEEN 3 AND 1000
    AND selected = false
  );

DROP POLICY "anyone sends message" ON public.contact_messages;
CREATE POLICY "anyone sends message" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 200
    AND length(message) BETWEEN 5 AND 5000
    AND handled = false
  );

-- Restrict media bucket listing: anyone can read direct URLs but not list
DROP POLICY "public read media" ON storage.objects;
CREATE POLICY "authenticated read media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'nas-irbid-media');

-- Anonymous direct file access works through public bucket URLs without listing.

-- Lock down has_role: revoke from public/anon, only authenticated may call
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
