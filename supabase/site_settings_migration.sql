-- ============================================================
-- INNOVISION: Site Settings Table & Realtime Migration
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ============================================================

-- 1. Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'default',
  contact_email text NOT NULL DEFAULT 'innovision@college.edu',
  contact_phone text NOT NULL DEFAULT '+91 98765 43210',
  contact_address text NOT NULL DEFAULT 'Department of AI & Data Science,
Main Campus, Block A, College of Engineering',
  video_enabled boolean NOT NULL DEFAULT true,
  video_title text NOT NULL DEFAULT 'Experience InnoVision',
  video_subtitle text NOT NULL DEFAULT 'Watch our highlight reel and discover what makes InnoVision the most exciting tech community on campus.',
  video_source_type text NOT NULL DEFAULT 'default',
  video_url text NOT NULL DEFAULT '/videos/innovision-promo.mp4?v=2',
  video_poster text NOT NULL DEFAULT '/videos/innovision-promo-thumb.png?v=2',
  has_custom_uploaded_video boolean NOT NULL DEFAULT false,
  uploaded_video_name text,
  uploaded_video_size bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Insert initial default row if missing
INSERT INTO public.site_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- 3. Trigger to keep updated_at in sync
DROP TRIGGER IF EXISTS tr_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER tr_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Anyone can view site settings (public contact info & video details)
DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT USING (true);

-- Authenticated admins can update/insert site settings
DROP POLICY IF EXISTS "site_settings_admin_insert" ON public.site_settings;
CREATE POLICY "site_settings_admin_insert" ON public.site_settings
  FOR INSERT WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "site_settings_admin_update" ON public.site_settings;
CREATE POLICY "site_settings_admin_update" ON public.site_settings
  FOR UPDATE USING (public.is_admin() OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "site_settings_admin_delete" ON public.site_settings;
CREATE POLICY "site_settings_admin_delete" ON public.site_settings
  FOR DELETE USING (public.is_admin() OR auth.role() = 'authenticated');

-- 6. Enable Realtime push updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'site_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  END IF;
END;
$$;
