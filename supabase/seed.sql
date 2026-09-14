-- ============================================================
-- INNOVISION Phase 2 — Seed Data (Optional)
-- Run after migration.sql to populate sample data
-- ============================================================

-- Sample Events
INSERT INTO public.events (title, slug, description, short_description, banner_url, category, event_date, start_time, end_time, venue, eligibility, rules, team_size_min, team_size_max, registration_deadline, registration_enabled, status) VALUES
(
  'CodeStorm 2026',
  'codestorm-2026',
  'CodeStorm is our flagship 24-hour hackathon bringing together the brightest minds to build innovative solutions. Participants will work in teams to develop projects addressing real-world challenges using AI and Data Science technologies.\n\nThis year''s theme focuses on Sustainable AI — building intelligent solutions that contribute to environmental sustainability and social good.',
  'A 24-hour hackathon to build AI-powered solutions for real-world challenges.',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
  'hackathon',
  '2026-11-15',
  '09:00 AM',
  '09:00 AM (Next Day)',
  'Main Auditorium, Block A',
  'Open to all B.Tech students (1st to 4th year)',
  '["Participants must register before the deadline.", "Each team must have 2 to 4 members.", "Participants must carry college ID.", "Projects must be built from scratch during the event.", "Use of pre-built templates is not allowed.", "Decisions of the judges are final."]',
  2, 4, '2026-11-10', true, 'upcoming'
),
(
  'ML Workshop Series',
  'ml-workshop-series',
  'A comprehensive 3-day workshop series covering the fundamentals of Machine Learning, from data preprocessing to model deployment. Each session includes hands-on coding exercises with real datasets.\n\nDay 1: Data Preprocessing & EDA\nDay 2: Supervised Learning Algorithms\nDay 3: Model Evaluation & Deployment',
  'Three-day hands-on workshop series on Machine Learning fundamentals.',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
  'workshop',
  '2026-10-20',
  '10:00 AM',
  '04:00 PM',
  'Computer Lab 3, Block B',
  'Open to 2nd and 3rd year students with basic Python knowledge',
  '["Bring your own laptop.", "Python 3.8+ must be pre-installed.", "Basic Python knowledge is required.", "Attendance is mandatory for all 3 days to receive certificate."]',
  1, 1, '2026-10-15', true, 'upcoming'
),
(
  'DataViz Challenge',
  'dataviz-challenge',
  'A data visualization competition where participants transform complex datasets into compelling visual stories. The challenge tests creativity, analytical thinking, and presentation skills.\n\nParticipants will be given a dataset and 6 hours to create the most insightful and visually appealing dashboard.',
  'Transform complex data into compelling visual stories.',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
  'competition',
  '2026-10-05',
  '09:00 AM',
  '04:00 PM',
  'Seminar Hall, Block C',
  'Open to all students with interest in data visualization',
  '["Individual participation only.", "Tools allowed: Tableau, Power BI, Python (matplotlib/seaborn/plotly).", "Dataset will be provided at the start.", "Presentations limited to 5 minutes.", "Judging based on clarity, creativity, and insight."]',
  1, 1, '2026-09-30', true, 'upcoming'
),
(
  'AI Ethics Seminar',
  'ai-ethics-seminar',
  'An engaging seminar featuring industry experts discussing the ethical implications of AI in society. Topics include bias in AI, privacy concerns, autonomous decision-making, and the responsible development of AI systems.',
  'Industry experts discuss the ethical implications of AI in society.',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
  'seminar',
  '2026-09-01',
  '02:00 PM',
  '05:00 PM',
  'Conference Room, Admin Block',
  'Open to all students and faculty',
  '["Open for all departments.", "Q&A session at the end.", "Certificates will be provided to attendees."]',
  1, 1, NULL, false, 'completed'
);

-- Sample Team Members
INSERT INTO public.team_members (name, role, category, profile_image_url, department, year, email, linkedin_url, instagram_url, display_order, is_active) VALUES
('Dr. Priya Sharma', 'Faculty Advisor', 'Faculty', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300', 'AI & Data Science', '', 'priya.sharma@college.edu', '', '', 1, true),
('Dr. Rajesh Kumar', 'Faculty Co-Advisor', 'Faculty', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300', 'AI & Data Science', '', 'rajesh.kumar@college.edu', '', '', 2, true),
('Arjun Reddy', 'President', 'President', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', 'AI & Data Science', '4th Year', 'arjun@college.edu', '', '', 1, true),
('Sneha Patel', 'Vice President', 'President', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300', 'AI & Data Science', '4th Year', 'sneha@college.edu', '', '', 2, true),
('Vikram Singh', 'Technical Lead', 'Technical Team', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300', 'AI & Data Science', '3rd Year', 'vikram@college.edu', '', '', 1, true),
('Meera Joshi', 'ML Engineer', 'Technical Team', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300', 'AI & Data Science', '3rd Year', 'meera@college.edu', '', '', 2, true),
('Karthik Iyer', 'Web Developer', 'Technical Team', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300', 'AI & Data Science', '2nd Year', 'karthik@college.edu', '', '', 3, true),
('Ananya Das', 'General Secretary', 'Secretariat', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', 'AI & Data Science', '3rd Year', 'ananya@college.edu', '', '', 1, true),
('Rohan Mehta', 'Media Lead', 'Media Team', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300', 'AI & Data Science', '2nd Year', 'rohan@college.edu', '', '', 1, true),
('Diya Nair', 'Treasurer', 'Treasurer', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300', 'AI & Data Science', '3rd Year', 'diya@college.edu', '', '', 1, true);

-- Sample Banners
INSERT INTO public.banners (title, subtitle, image_url, button_text, button_link, display_order, is_active) VALUES
('CodeStorm 2026', 'Register now for our flagship 24-hour hackathon', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200', 'Register Now', '/events', 1, true),
('ML Workshop Series', 'Three days of hands-on machine learning', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200', 'Learn More', '/events', 2, true),
('Join InnoVision', 'Be part of the AI & Data Science revolution', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200', 'About Us', '/about', 3, true);

-- Sample Gallery (linked to AI Ethics Seminar — the completed event)
DO $$
DECLARE
  v_event_id uuid;
  v_gallery_id uuid;
BEGIN
  SELECT id INTO v_event_id FROM public.events WHERE slug = 'ai-ethics-seminar';
  IF v_event_id IS NOT NULL THEN
    INSERT INTO public.galleries (event_id, title, description, cover_image_url)
    VALUES (v_event_id, 'AI Ethics Seminar 2026', 'Highlights from our AI Ethics Seminar featuring industry experts.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800')
    RETURNING id INTO v_gallery_id;

    INSERT INTO public.gallery_images (gallery_id, image_url, caption, display_order) VALUES
    (v_gallery_id, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'Opening keynote session', 1),
    (v_gallery_id, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', 'Panel discussion on AI bias', 2),
    (v_gallery_id, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'Audience Q&A segment', 3),
    (v_gallery_id, 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800', 'Networking break', 4),
    (v_gallery_id, 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800', 'Certificate distribution', 5),
    (v_gallery_id, 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', 'Group photo with speakers', 6);
  END IF;
END $$;
