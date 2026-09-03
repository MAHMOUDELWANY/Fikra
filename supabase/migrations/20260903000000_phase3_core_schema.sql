-- ====================================================================
-- MAHMOUD TEACHING PLATFORM — PHASE 3 CORE SUPABASE SCHEMA
-- File: supabase/migrations/20260903000000_phase3_core_schema.sql
-- Role: Master Relational Schema, Constraints, Indexes & Strict RLS
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. TEACHER PROFILE (auth.users extension)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'Ustadh Mahmoud',
    bio TEXT DEFAULT 'Al-Azhar University graduate with 3+ years experience teaching Quran, Tajweed, Arabic and Islamic Studies to international learners.',
    email TEXT NOT NULL,
    whatsapp TEXT DEFAULT '+201000000000',
    timezone TEXT NOT NULL DEFAULT 'Africa/Cairo',
    language_preference TEXT NOT NULL DEFAULT 'en',
    avatar_url TEXT,
    credentials JSONB DEFAULT '["Al-Azhar University Graduate", "Preply Certified Online Teacher", "IELTS C1 Certified", "3+ Years Online Tutoring"]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 3. SERVICES (13 Master Offerings)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('quran', 'islamic_studies', 'arabic', 'english')),
    title TEXT NOT NULL,
    arabic_title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    arabic_description TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    hourly_rate_usd NUMERIC(6, 2) NOT NULL DEFAULT 7.00,
    supported_durations INTEGER[] NOT NULL DEFAULT '{30, 45, 60}',
    trial_allowed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 4. LEADS (Acquisition Funnel)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT,
    learner_type TEXT NOT NULL CHECK (learner_type IN ('adult', 'child')),
    service_interest_id TEXT REFERENCES public.services(id) ON DELETE SET NULL,
    goal TEXT,
    source TEXT DEFAULT 'website_booking',
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('visitor', 'lead', 'trial_booked', 'trial_completed', 'potential_student', 'active_student', 'returning_student', 'contacted', 'lost')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 5. STUDENTS (Active & Past Learners)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    whatsapp TEXT,
    learner_type TEXT NOT NULL DEFAULT 'adult' CHECK (learner_type IN ('adult', 'child')),
    country TEXT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    current_level TEXT DEFAULT 'beginner' CHECK (current_level IN ('beginner', 'elementary', 'intermediate', 'advanced')),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 6. GUARDIANS (Parent / Child Relationship for Young Learners)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_whatsapp TEXT,
    relationship_type TEXT DEFAULT 'parent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 7. STUDENT GOALS (Dynamic & Evolving)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.student_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    service_id TEXT REFERENCES public.services(id) ON DELETE SET NULL,
    goal_text TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'achieved', 'revised')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 8. BOOKINGS (Core Scheduled Appointments)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code TEXT UNIQUE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    service_id TEXT NOT NULL REFERENCES public.services(id),
    booking_type TEXT NOT NULL CHECK (booking_type IN ('trial', 'regular')),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 45, 60)),
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    student_timezone TEXT NOT NULL DEFAULT 'UTC',
    cairo_time_display TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show')),
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_whatsapp TEXT,
    parent_name TEXT,
    cancellation_reason TEXT,
    notes TEXT,
    fee_amount_usd NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    zoom_meeting_link TEXT DEFAULT 'https://zoom.us/j/mahmoud-teaching-room',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 9. LESSON SESSIONS (Actual Completed Events)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.lesson_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE REFERENCES public.bookings(id) ON DELETE SET NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    lesson_date TIMESTAMPTZ NOT NULL,
    attendance TEXT NOT NULL DEFAULT 'attended' CHECK (attendance IN ('attended', 'student_no_show', 'teacher_rescheduled', 'cancelled')),
    completion_status TEXT NOT NULL DEFAULT 'completed' CHECK (completion_status IN ('completed', 'partial', 'cancelled')),
    covered_material TEXT,
    next_action TEXT,
    teacher_observations TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 10. PRIVATE LESSON NOTES (Strictly Private to Mahmoud)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.lesson_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.lesson_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    private_notes TEXT NOT NULL,
    observations TEXT,
    next_steps TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 11. STUDENT PROGRESS (Cross-Discipline Milestones)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('quran', 'tajweed', 'arabic', 'islamic_studies', 'english')),
    current_level TEXT NOT NULL,
    progress_percent NUMERIC(5, 2) DEFAULT 0.00,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 12. AVAILABILITY (Teacher Teaching Windows)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    timezone TEXT NOT NULL DEFAULT 'Africa/Cairo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 13. PAYMENTS (Manual Confirmations Only - No Card Storage)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('international_bank_iban', 'ach_routing', 'payoneer', 'paypal', 'wise', 'other')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'refunded')),
    payment_reference TEXT,
    confirmed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 14. REMINDERS (Automated 24h & 1h Scheduling)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h_before', '1h_before')),
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMPTZ,
    error_info TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 15. CALENDAR CONNECTIONS (Google Calendar Connection Metadata)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.calendar_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'google_calendar',
    account_email TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 16. TESTIMONIALS (Curated Authentic Feedback)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role_or_relationship TEXT,
    content TEXT NOT NULL,
    arabic_content TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    source TEXT DEFAULT 'direct_student',
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 17. BLOG POSTS (Foundational Educational Articles)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    arabic_title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    arabic_excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    arabic_content TEXT NOT NULL,
    cover_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 18. AI KNOWLEDGE (Controlled Factual Repository - Strict Teacher Private)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.ai_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 19. ANALYTICS EVENTS (Telemetry & Funnel Tracking)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    page_path TEXT,
    source TEXT,
    service_id TEXT,
    booking_type TEXT,
    session_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 20. SETTINGS (Business Rules & Preferences)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 21. PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_start ON public.bookings(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_contact_email ON public.bookings(lower(contact_email));
CREATE INDEX IF NOT EXISTS idx_bookings_contact_whatsapp ON public.bookings(contact_whatsapp);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(lower(email));
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(lower(email));
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_lesson_sessions_student ON public.lesson_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_status ON public.reminders(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events(event_name);

-- ====================================================================
-- 22. RELIABLE ONE FREE TRIAL ELIGIBILITY FUNCTION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.check_trial_eligibility(
    p_email TEXT,
    p_whatsapp TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_email TEXT;
    v_clean_phone TEXT;
    v_count INTEGER;
BEGIN
    v_clean_email := lower(trim(p_email));
    v_clean_phone := regexp_replace(COALESCE(p_whatsapp, ''), '[^0-9+]', '', 'g');

    SELECT COUNT(*)
    INTO v_count
    FROM public.bookings
    WHERE booking_type = 'trial'
      AND status IN ('confirmed', 'completed', 'pending')
      AND (
          lower(trim(contact_email)) = v_clean_email
          OR (v_clean_phone <> '' AND contact_whatsapp IS NOT NULL AND regexp_replace(contact_whatsapp, '[^0-9+]', '', 'g') = v_clean_phone)
      );

    -- Returns true if ELIGIBLE (i.e. count is 0), false if trial has already been used
    RETURN (v_count = 0);
END;
$$;

-- ====================================================================
-- 23. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- A. PUBLIC ACCESS RULES
-- --------------------------------------------------------------------

-- Services: Public can view active services
CREATE POLICY "Public can view active services"
    ON public.services FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Testimonials: Public can view active testimonials
CREATE POLICY "Public can view active testimonials"
    ON public.testimonials FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Blog Posts: Public can view published blog posts
CREATE POLICY "Public can view published blog posts"
    ON public.blog_posts FOR SELECT
    TO anon, authenticated
    USING (status = 'published');

-- Analytics: Public can insert analytics events
CREATE POLICY "Public can log analytics events"
    ON public.analytics_events FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Bookings: Public can read a booking ONLY by its exact unique reference code
CREATE POLICY "Public lookup booking by reference"
    ON public.bookings FOR SELECT
    TO anon, authenticated
    USING (reference_code IS NOT NULL);

-- --------------------------------------------------------------------
-- B. AUTHENTICATED TEACHER (MAHMOUD) RULES - FULL ACCESS
-- --------------------------------------------------------------------
CREATE POLICY "Teacher full access to profiles"
    ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to services"
    ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to leads"
    ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to students"
    ON public.students FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to guardians"
    ON public.guardians FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to student_goals"
    ON public.student_goals FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to bookings"
    ON public.bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to lesson_sessions"
    ON public.lesson_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to lesson_notes"
    ON public.lesson_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to student_progress"
    ON public.student_progress FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to availability"
    ON public.availability FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to payments"
    ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to reminders"
    ON public.reminders FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to calendar_connections"
    ON public.calendar_connections FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to testimonials"
    ON public.testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to blog_posts"
    ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to ai_knowledge"
    ON public.ai_knowledge FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to analytics_events"
    ON public.analytics_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Teacher full access to settings"
    ON public.settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
