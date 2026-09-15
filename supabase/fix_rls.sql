-- ============================================================
-- RLS FIX: Allow any authenticated user to write admin data
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- EVENTS
DROP POLICY IF EXISTS "events_admin_insert" ON public.events;
DROP POLICY IF EXISTS "events_admin_update" ON public.events;
DROP POLICY IF EXISTS "events_admin_delete" ON public.events;
CREATE POLICY "events_auth_insert" ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "events_auth_update" ON public.events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "events_auth_delete" ON public.events FOR DELETE USING (auth.role() = 'authenticated');

-- TEAM MEMBERS
DROP POLICY IF EXISTS "team_admin_insert" ON public.team_members;
DROP POLICY IF EXISTS "team_admin_update" ON public.team_members;
DROP POLICY IF EXISTS "team_admin_delete" ON public.team_members;
CREATE POLICY "team_auth_insert" ON public.team_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "team_auth_update" ON public.team_members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "team_auth_delete" ON public.team_members FOR DELETE USING (auth.role() = 'authenticated');

-- GALLERIES
DROP POLICY IF EXISTS "galleries_admin_insert" ON public.galleries;
DROP POLICY IF EXISTS "galleries_admin_update" ON public.galleries;
DROP POLICY IF EXISTS "galleries_admin_delete" ON public.galleries;
CREATE POLICY "galleries_auth_insert" ON public.galleries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "galleries_auth_update" ON public.galleries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "galleries_auth_delete" ON public.galleries FOR DELETE USING (auth.role() = 'authenticated');

-- GALLERY IMAGES
DROP POLICY IF EXISTS "gallery_images_admin_insert" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images_admin_update" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images_admin_delete" ON public.gallery_images;
CREATE POLICY "gallery_images_auth_insert" ON public.gallery_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "gallery_images_auth_update" ON public.gallery_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "gallery_images_auth_delete" ON public.gallery_images FOR DELETE USING (auth.role() = 'authenticated');

-- BANNERS
DROP POLICY IF EXISTS "banners_admin_insert" ON public.banners;
DROP POLICY IF EXISTS "banners_admin_update" ON public.banners;
DROP POLICY IF EXISTS "banners_admin_delete" ON public.banners;
CREATE POLICY "banners_auth_insert" ON public.banners FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "banners_auth_update" ON public.banners FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "banners_auth_delete" ON public.banners FOR DELETE USING (auth.role() = 'authenticated');
