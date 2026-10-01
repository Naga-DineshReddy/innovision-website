-- ============================================================
-- Update BUG HUNT (and any past events) to status = 'completed'
-- Run this in your Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Specifically mark the BUG HUNT event as completed
UPDATE public.events
SET status = 'completed',
    registration_enabled = false,
    updated_at = now()
WHERE title ILIKE '%bug hunt%' OR id = '3e886f07-b451-4e99-a073-1dca31eb3a28';

-- 2. (Optional but recommended) Mark any event whose event_date has passed as completed
UPDATE public.events
SET status = 'completed',
    registration_enabled = false,
    updated_at = now()
WHERE event_date < CURRENT_DATE
  AND status NOT IN ('completed', 'cancelled');
