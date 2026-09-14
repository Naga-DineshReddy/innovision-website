-- ============================================================
-- INNOVISION Phase 2 — Complete Database Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ============================================================
-- 1. HELPER: Admin check function
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid()
      AND is_active = true
  );
END;
$$;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  short_description text NOT NULL DEFAULT '',
  banner_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'hackathon'
    CHECK (category IN ('hackathon','workshop','competition','seminar','bootcamp','tech-talk','cultural')),
  event_date date NOT NULL,
  start_time text NOT NULL DEFAULT '',
  end_time text NOT NULL DEFAULT '',
  venue text NOT NULL DEFAULT '',
  eligibility text NOT NULL DEFAULT '',
  rules jsonb NOT NULL DEFAULT '[]',
  team_size_min integer NOT NULL DEFAULT 1 CHECK (team_size_min >= 1),
  team_size_max integer NOT NULL DEFAULT 4 CHECK (team_size_max >= 1 AND team_size_max <= 10),
  registration_deadline date,
  registration_enabled boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_team_size CHECK (team_size_min <= team_size_max)
);

-- TEAM MEMBERS
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Technical Team'
    CHECK (category IN ('Faculty','President','Technical Team','Secretariat','Media Team','Treasurer')),
  profile_image_url text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  instagram_url text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- GALLERIES
CREATE TABLE public.galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  cover_image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- GALLERY IMAGES
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- BANNERS
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  button_text text NOT NULL DEFAULT '',
  button_link text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- REGISTRATIONS
CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id text UNIQUE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  team_name text NOT NULL DEFAULT '',
  team_size integer NOT NULL DEFAULT 1 CHECK (team_size >= 1 AND team_size <= 10),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('confirmed','pending','cancelled')),
  registered_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- REGISTRATION MEMBERS
CREATE TABLE public.registration_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  roll_number text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  member_number integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CONTACT MESSAGES
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','read','resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ADMIN PROFILES
CREATE TABLE public.admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. AUTO-GENERATE registration_id
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_registration_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  seq_num integer;
  year_str text;
BEGIN
  year_str := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(NULLIF(split_part(registration_id, '-', 3), '') AS integer)
  ), 0) + 1
  INTO seq_num
  FROM public.registrations
  WHERE registration_id LIKE 'INV-' || year_str || '-%';

  NEW.registration_id := 'INV-' || year_str || '-' || LPAD(seq_num::text, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_generate_registration_id
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  WHEN (NEW.registration_id IS NULL)
  EXECUTE FUNCTION public.generate_registration_id();

-- ============================================================
-- 4. AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_galleries_updated_at BEFORE UPDATE ON public.galleries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_banners_updated_at BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_registrations_updated_at BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 5. INDEXES
-- ============================================================
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_registration_enabled ON public.events(registration_enabled);
CREATE INDEX idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX idx_registrations_registered_at ON public.registrations(registered_at);
CREATE INDEX idx_registration_members_registration_id ON public.registration_members(registration_id);
CREATE INDEX idx_galleries_event_id ON public.galleries(event_id);
CREATE INDEX idx_gallery_images_gallery_id ON public.gallery_images(gallery_id);
CREATE INDEX idx_banners_is_active ON public.banners(is_active);
CREATE INDEX idx_team_members_category ON public.team_members(category);
CREATE INDEX idx_team_members_is_active ON public.team_members(is_active);
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- EVENTS: public read, admin write
CREATE POLICY "events_public_read" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_admin_insert" ON public.events FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "events_admin_update" ON public.events FOR UPDATE USING (public.is_admin());
CREATE POLICY "events_admin_delete" ON public.events FOR DELETE USING (public.is_admin());

-- TEAM MEMBERS: public read active, admin write
CREATE POLICY "team_public_read" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "team_admin_insert" ON public.team_members FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "team_admin_update" ON public.team_members FOR UPDATE USING (public.is_admin());
CREATE POLICY "team_admin_delete" ON public.team_members FOR DELETE USING (public.is_admin());

-- GALLERIES: public read, admin write
CREATE POLICY "galleries_public_read" ON public.galleries FOR SELECT USING (true);
CREATE POLICY "galleries_admin_insert" ON public.galleries FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "galleries_admin_update" ON public.galleries FOR UPDATE USING (public.is_admin());
CREATE POLICY "galleries_admin_delete" ON public.galleries FOR DELETE USING (public.is_admin());

-- GALLERY IMAGES: public read, admin write
CREATE POLICY "gallery_images_public_read" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "gallery_images_admin_insert" ON public.gallery_images FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "gallery_images_admin_update" ON public.gallery_images FOR UPDATE USING (public.is_admin());
CREATE POLICY "gallery_images_admin_delete" ON public.gallery_images FOR DELETE USING (public.is_admin());

-- BANNERS: public read, admin write
CREATE POLICY "banners_public_read" ON public.banners FOR SELECT USING (true);
CREATE POLICY "banners_admin_insert" ON public.banners FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "banners_admin_update" ON public.banners FOR UPDATE USING (public.is_admin());
CREATE POLICY "banners_admin_delete" ON public.banners FOR DELETE USING (public.is_admin());

-- REGISTRATIONS: public insert (for registering), admin full access
CREATE POLICY "registrations_public_insert" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "registrations_admin_read" ON public.registrations FOR SELECT USING (public.is_admin());
CREATE POLICY "registrations_admin_update" ON public.registrations FOR UPDATE USING (public.is_admin());
CREATE POLICY "registrations_admin_delete" ON public.registrations FOR DELETE USING (public.is_admin());

-- REGISTRATION MEMBERS: public insert, admin read
CREATE POLICY "reg_members_public_insert" ON public.registration_members FOR INSERT WITH CHECK (true);
CREATE POLICY "reg_members_admin_read" ON public.registration_members FOR SELECT USING (public.is_admin());
CREATE POLICY "reg_members_admin_delete" ON public.registration_members FOR DELETE USING (public.is_admin());

-- CONTACT MESSAGES: public insert, admin read/update/delete
CREATE POLICY "contact_public_insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_admin_read" ON public.contact_messages FOR SELECT USING (public.is_admin());
CREATE POLICY "contact_admin_update" ON public.contact_messages FOR UPDATE USING (public.is_admin());
CREATE POLICY "contact_admin_delete" ON public.contact_messages FOR DELETE USING (public.is_admin());

-- ADMIN PROFILES: admin can read own profile
CREATE POLICY "admin_profiles_read" ON public.admin_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- 7. RPC: Atomic Registration Creation
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_registration(
  p_event_id uuid,
  p_team_name text,
  p_members jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event record;
  v_reg_id uuid;
  v_reg_display_id text;
  v_member jsonb;
  v_member_idx integer := 0;
  v_team_size integer;
BEGIN
  -- Validate event exists and is accepting registrations
  SELECT * INTO v_event FROM public.events WHERE id = p_event_id;

  IF v_event IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event not found.');
  END IF;

  IF NOT v_event.registration_enabled THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registration is closed for this event.');
  END IF;

  IF v_event.registration_deadline IS NOT NULL AND v_event.registration_deadline < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registration deadline has passed.');
  END IF;

  -- Validate team size
  v_team_size := jsonb_array_length(p_members);

  IF v_team_size < v_event.team_size_min OR v_team_size > v_event.team_size_max THEN
    RETURN jsonb_build_object('success', false, 'error',
      format('Team size must be between %s and %s.', v_event.team_size_min, v_event.team_size_max));
  END IF;

  -- Check for duplicate registrations (same event + same email or roll)
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
    IF EXISTS (
      SELECT 1 FROM public.registration_members rm
      JOIN public.registrations r ON r.id = rm.registration_id
      WHERE r.event_id = p_event_id
        AND r.status != 'cancelled'
        AND (
          (rm.email = v_member->>'email' AND v_member->>'email' != '')
          OR (rm.roll_number = v_member->>'roll_number' AND v_member->>'roll_number' != '')
        )
    ) THEN
      RETURN jsonb_build_object('success', false, 'error',
        format('Member "%s" is already registered for this event.', v_member->>'full_name'));
    END IF;
  END LOOP;

  -- Create registration
  INSERT INTO public.registrations (event_id, team_name, team_size, status)
  VALUES (p_event_id, p_team_name, v_team_size, 'pending')
  RETURNING id, registration_id INTO v_reg_id, v_reg_display_id;

  -- Create members
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
    v_member_idx := v_member_idx + 1;
    INSERT INTO public.registration_members (
      registration_id, full_name, roll_number, email, phone, department, year, member_number
    ) VALUES (
      v_reg_id,
      v_member->>'full_name',
      COALESCE(v_member->>'roll_number', ''),
      COALESCE(v_member->>'email', ''),
      COALESCE(v_member->>'phone', ''),
      COALESCE(v_member->>'department', ''),
      COALESCE(v_member->>'year', ''),
      v_member_idx
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'registration_id', v_reg_display_id,
    'id', v_reg_id
  );
END;
$$;

-- ============================================================
-- 8. RPC: Dashboard Stats
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_events', (SELECT count(*) FROM public.events),
    'upcoming_events', (SELECT count(*) FROM public.events WHERE status = 'upcoming'),
    'total_registrations', (SELECT count(*) FROM public.registrations),
    'total_gallery_photos', (SELECT count(*) FROM public.gallery_images),
    'active_banners', (SELECT count(*) FROM public.banners WHERE is_active = true),
    'total_team_members', (SELECT count(*) FROM public.team_members WHERE is_active = true)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ============================================================
-- 9. RPC: Registration count for event
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_registration_count(p_event_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT count(*)::integer FROM public.registrations
  WHERE event_id = p_event_id AND status != 'cancelled';
$$;

-- ============================================================
-- 10. Enable Realtime for key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;
