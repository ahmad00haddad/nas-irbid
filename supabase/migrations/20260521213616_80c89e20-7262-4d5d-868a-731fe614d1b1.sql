
-- ============ ROLES SYSTEM (secure, separate table) ============
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "admins manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ EPISODES ============
CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  character_name TEXT,
  profession TEXT,
  neighborhood TEXT,
  decade TEXT,
  youtube_id TEXT,
  cover_image_url TEXT,
  short_description TEXT,
  story TEXT,
  behind_the_scenes TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  episode_number INT,
  season INT DEFAULT 1,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone reads published episodes" ON public.episodes
  FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY "admins read all episodes" ON public.episodes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "admins manage episodes" ON public.episodes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- ============ GUEST SUGGESTIONS ============
CREATE TABLE public.guest_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_name TEXT NOT NULL,
  profession TEXT,
  neighborhood TEXT,
  story_summary TEXT NOT NULL,
  contact_info TEXT,
  submitter_name TEXT,
  submitter_email TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can suggest" ON public.guest_suggestions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admins read suggestions" ON public.guest_suggestions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "admins manage suggestions" ON public.guest_suggestions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "admins delete suggestions" ON public.guest_suggestions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ MEMORIES (wall) ============
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_name TEXT,
  contributor_email TEXT,
  title TEXT,
  body TEXT NOT NULL,
  photo_url TEXT,
  decade TEXT,
  neighborhood TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone reads approved memories" ON public.memories
  FOR SELECT TO anon, authenticated USING (approved = true);

CREATE POLICY "anyone can submit memory" ON public.memories
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admins read all memories" ON public.memories
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "admins manage memories" ON public.memories
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "admins delete memories" ON public.memories
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ QUESTION BANK ============
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES public.episodes(id) ON DELETE SET NULL,
  target_character TEXT,
  question_text TEXT NOT NULL,
  submitter_name TEXT,
  submitter_email TEXT,
  selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone submits questions" ON public.questions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admins read questions" ON public.questions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "admins manage questions" ON public.questions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- ============ CONTACT / SUPPORT MESSAGES ============
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'general',
  handled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone sends message" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admins read messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "admins manage messages" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- ============ updated_at trigger for episodes ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER episodes_updated_at
  BEFORE UPDATE ON public.episodes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Storage bucket for images ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('nas-irbid-media', 'nas-irbid-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'nas-irbid-media');

CREATE POLICY "anyone uploads media" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'nas-irbid-media');

CREATE POLICY "admins manage media" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'nas-irbid-media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')))
  WITH CHECK (bucket_id = 'nas-irbid-media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));
