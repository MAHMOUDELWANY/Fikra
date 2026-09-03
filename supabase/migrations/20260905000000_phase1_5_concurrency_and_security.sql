-- ====================================================================
-- MAHMOUD TEACHING PLATFORM — PHASE 1.5 CONCURRENCY & SECURITY MIGRATION
-- File: supabase/migrations/20260905000000_phase1_5_concurrency_and_security.sql
-- Role: PostgreSQL Concurrency Exclusion, True One-Free-Trial Uniqueness,
--       Deterministic Leads Upsert, Authoritative Pricing, Canonical Service IDs,
--       High-Entropy Management Tokens, Minimized Lookup & Secure Cancel/Reschedule
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. MANAGEMENT TOKENS FOR PUBLIC BOOKINGS
-- High-entropy 192-bit secret token so reference code alone cannot be used as an authorization factor.
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS management_token TEXT;

-- Populate tokens for existing rows if any exist without one
UPDATE public.bookings
SET management_token = encode(gen_random_bytes(24), 'hex')
WHERE management_token IS NULL;

ALTER TABLE public.bookings
ALTER COLUMN management_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_management_token
ON public.bookings (management_token);

-- 3. FIX #1 — TRUE CONCURRENCY-SAFE DOUBLE BOOKING EXCLUSION CONSTRAINT
-- Resolve any historical overlaps among active bookings before adding the exclusion constraint
WITH ranked_overlaps AS (
  SELECT b1.id
  FROM public.bookings b1
  JOIN public.bookings b2 ON b1.id <> b2.id
    AND b1.status IN ('pending', 'confirmed', 'rescheduled')
    AND b2.status IN ('pending', 'confirmed', 'rescheduled')
    AND tstzrange(b1.scheduled_start, b1.scheduled_end, '[)') && tstzrange(b2.scheduled_start, b2.scheduled_end, '[)')
    AND b1.created_at < b2.created_at
)
UPDATE public.bookings
SET status = 'cancelled', cancellation_reason = 'Cancelled during concurrency exclusion constraint initialization'
WHERE id IN (SELECT id FROM ranked_overlaps);

-- Drop old constraint if present
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_no_overlap_excl;

-- Add PostgreSQL exclusion constraint:
-- Half-open [) interval ensures adjacent lessons (e.g. 10:00-10:30 and 10:30-11:00) DO NOT overlap.
-- Cancelled, completed, or no-show bookings do not block new bookings.
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_no_overlap_excl
EXCLUDE USING gist (
    tstzrange(scheduled_start, scheduled_end, '[)') WITH &&
)
WHERE (status IN ('pending', 'confirmed', 'rescheduled'));

-- 4. FIX #2 — TRUE ONE-FREE-TRIAL CONCURRENCY SAFETY (PARTIAL UNIQUE INDEXES)
-- Resolve any historical duplicate trials by retaining the most recently active
WITH duplicate_trials AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY lower(trim(contact_email))
           ORDER BY created_at DESC
         ) as rn
  FROM public.bookings
  WHERE booking_type = 'trial' AND status IN ('pending', 'confirmed', 'rescheduled', 'completed')
)
UPDATE public.bookings
SET status = 'cancelled', cancellation_reason = 'Cancelled during one-trial uniqueness constraint initialization'
WHERE id IN (SELECT id FROM duplicate_trials WHERE rn > 1);

-- Unique index guaranteeing at most ONE active or completed trial per normalized email
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_active_trial_email
ON public.bookings (lower(trim(contact_email)))
WHERE booking_type = 'trial' AND status IN ('pending', 'confirmed', 'rescheduled', 'completed');

-- Unique index guaranteeing at most ONE active or completed trial per normalized phone (when phone >= 7 digits)
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_active_trial_whatsapp
ON public.bookings (regexp_replace(contact_whatsapp, '[^0-9+]', '', 'g'))
WHERE booking_type = 'trial'
  AND status IN ('pending', 'confirmed', 'rescheduled', 'completed')
  AND contact_whatsapp IS NOT NULL
  AND length(trim(contact_whatsapp)) >= 7;

-- 5. FIX #3 — LEADS UNIQUE INDEX FOR SAFE DETERMINISTIC UPSERT
-- Deduplicate existing leads by lower(trim(email)) safely
WITH lead_ranks AS (
  SELECT id, lower(trim(email)) as norm_email,
         ROW_NUMBER() OVER (PARTITION BY lower(trim(email)) ORDER BY updated_at DESC, created_at DESC) as rn,
         FIRST_VALUE(id) OVER (PARTITION BY lower(trim(email)) ORDER BY updated_at DESC, created_at DESC) as master_id
  FROM public.leads
)
UPDATE public.bookings b
SET lead_id = lr.master_id
FROM lead_ranks lr
WHERE b.lead_id = lr.id AND lr.rn > 1;

WITH lead_ranks AS (
  SELECT id, lower(trim(email)) as norm_email,
         ROW_NUMBER() OVER (PARTITION BY lower(trim(email)) ORDER BY updated_at DESC, created_at DESC) as rn
  FROM public.leads
)
DELETE FROM public.leads
WHERE id IN (SELECT id FROM lead_ranks WHERE rn > 1);

-- Unique index on normalized email on leads
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_unique_lower_email
ON public.leads (lower(trim(email)));

-- 6. FIX #5 — CANONICAL SERVICE IDS (MASTER SPEC SECTION 7)
-- Insert/update all 13 canonical kebab-case offerings
INSERT INTO public.services (
    id, category, title, arabic_title, short_description, arabic_description,
    display_order, is_active, hourly_rate_usd, supported_durations, trial_allowed
) VALUES
('quran-reading', 'quran', 'Quran Reading', 'تلاوة القرآن الكريم',
 'Master accurate letter articulation, phonetic flow, and direct Mushaf reading from Noorani basics to fluency.',
 'تأسيس القراءة الصحيحة من المصحف، وضبط مخارج الحروف للمبتدئين وغير الناطقين بالعربية.',
 1, true, 7.00, '{30, 45, 60}', true),

('quran-memorization', 'quran', 'Quran Memorization', 'حفظ القرآن الكريم',
 'Systematic memorization schedules tailored to your pace with consistent revision targets and retention benchmarks.',
 'منهجية منظمة لحفظ السور والآيات مع تثبيت الحفظ القديم ووضع أهداف مراجعة أسبوعية.',
 2, true, 7.00, '{30, 45, 60}', true),

('quran-revision', 'quran', 'Quran Revision', 'مراجعة وتثبيت القرآن',
 'Dedicated review sessions for huffadh to systematically strengthen past juz, eliminate doubts, and fortify memory.',
 'جلسات مخصصة للحفاظ لمراجعة الأجزاء السابقة وتثبيت المتشابهات وضمان عدم النسيان.',
 3, true, 7.00, '{30, 45, 60}', true),

('tajweed', 'quran', 'Tajweed Rules & Application', 'أحكام التجويد والتطبيق',
 'Theoretical and practical application of Nun Sakinah, Meem Sakinah, Madd, and letter characteristics during live recitation.',
 'دراسة قواعد التجويد النظرية والتطبيق المباشر أثناء التلاوة برواية حفص عن عاصم.',
 4, true, 7.00, '{30, 45, 60}', true),

('islamic-studies', 'islamic_studies', 'General Islamic Studies', 'الدراسات الإسلامية العامة',
 'Comprehensive and age-appropriate Islamic curriculum covering essentials of faith, manners, and daily worship.',
 'منهج إسلامي متكامل ومناسب لكل الأعمار يغطي أركان الإسلام والأخلاق والآداب اليومية.',
 5, true, 7.00, '{30, 45, 60}', true),

('aqeedah', 'islamic_studies', 'Authentic Aqeedah', 'العقيدة الإسلامية الصافية',
 'Pure Islamic creed and the fundamentals of Tawheed, explained rationally and calmly to ground personal faith.',
 'دراسة أصول الإيمان والعقيدة الإسلامية بأسلوب هادئ وواضح يرسخ اليقين في القلب.',
 6, true, 7.00, '{30, 45, 60}', true),

('fiqh', 'islamic_studies', 'Practical Fiqh', 'الفقه الإسلامي الميسر',
 'Essential rulings of purification (Taharah), prayer (Salah), fasting, and everyday contemporary transactions.',
 'أحكام الطهارة والصلاة والعبادات والمعاملات اليومية بأسلوب ميسر ومرتبط بحياة المسلم المعاصر.',
 7, true, 7.00, '{30, 45, 60}', true),

('seerah', 'islamic_studies', 'Prophetic Seerah', 'السيرة النبوية العطرة',
 'Deep chronological study of the life of the Prophet Muhammad ﷺ and his noble companions, deriving moral guidance.',
 'دراسة سيرة النبي المصطفى ﷺ وصحابته الكرام واستخلاص العبر والقدوة الحسنة للحياة اليومية.',
 8, true, 7.00, '{30, 45, 60}', true),

('arabic-foundations', 'arabic', 'Arabic for Beginners (Reading, Writing & Phonics)', 'أساسيات اللغة العربية للمبتدئين',
 'A gentle, systematic start for non-Arabic speakers and reverts to build confidence letter by letter.',
 'مخصص لمن لا يعرف قراءة الحروف أو المسلمين الجدد لبناء الأساس بثقة.',
 9, true, 7.00, '{30, 45, 60}', true),

('modern-standard-arabic', 'arabic', 'Modern Standard Arabic (Fusha)', 'العربية الفصحى المعاصرة',
 'Formal academic Arabic for literature, Islamic classical texts, Quranic comprehension, and modern media.',
 'العربية الفصحى للأغراض الأكاديمية وقراءة النصوص الإسلامية والتراثية وفهم لغة القرآن والإعلام.',
 10, true, 7.00, '{30, 45, 60}', true),

('arabic-conversation', 'arabic', 'Arabic Conversation & Fluency', 'المحادثة والطلاقة باللغة العربية',
 'Interactive speaking drills to overcome hesitation, expand active vocabulary, and converse naturally in real scenarios.',
 'تدريبات شفهية وتطبيقية لكسر حاجز الخوف والتحدث بطلاقة في مختلف المواقف اليومية.',
 11, true, 7.00, '{30, 45, 60}', true),

('egyptian-arabic', 'arabic', 'Egyptian Colloquial Arabic (Ammiya)', 'اللهجة المصرية الحوارية',
 'Learn the most widely understood spoken dialect across the Arab world for daily family, cultural, and travel interaction.',
 'تعلم اللهجة الأكثر فهماً وانتشاراً في العالم العربي للتواصل العائلي والسياحة والثقافة.',
 12, true, 7.00, '{30, 45, 60}', true),

('english', 'english', 'English Language Support', 'اللغة الإنجليزية والتواصل',
 'Personalized English speaking, conversational confidence, and grammar support taught by an IELTS C1 certified instructor.',
 'تطوير مهارات التحدث والمحادثة وبناء الثقة في التواصل باللغة الإنجليزية مع معلم حاصل على C1 في IELTS.',
 13, true, 10.00, '{30, 45, 60}', true)
ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    title = EXCLUDED.title,
    arabic_title = EXCLUDED.arabic_title,
    short_description = EXCLUDED.short_description,
    arabic_description = EXCLUDED.arabic_description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    hourly_rate_usd = EXCLUDED.hourly_rate_usd,
    supported_durations = EXCLUDED.supported_durations,
    trial_allowed = EXCLUDED.trial_allowed;

-- Migrate any legacy references in bookings, leads, student_goals to canonical IDs
UPDATE public.bookings SET service_id = 'quran-reading' WHERE service_id IN ('quran_reading');
UPDATE public.bookings SET service_id = 'quran-memorization' WHERE service_id IN ('quran_memorization');
UPDATE public.bookings SET service_id = 'quran-revision' WHERE service_id IN ('quran_revision');
UPDATE public.bookings SET service_id = 'islamic-studies' WHERE service_id IN ('islamic_studies', 'islamic-studies-general');
UPDATE public.bookings SET service_id = 'arabic-foundations' WHERE service_id IN ('arabic');
UPDATE public.bookings SET service_id = 'modern-standard-arabic' WHERE service_id IN ('modern_standard_arabic');
UPDATE public.bookings SET service_id = 'arabic-conversation' WHERE service_id IN ('arabic_conversation');
UPDATE public.bookings SET service_id = 'egyptian-arabic' WHERE service_id IN ('egyptian_arabic');
UPDATE public.bookings SET service_id = 'english' WHERE service_id IN ('english-coaching');

UPDATE public.leads SET service_interest_id = 'quran-reading' WHERE service_interest_id IN ('quran_reading');
UPDATE public.leads SET service_interest_id = 'quran-memorization' WHERE service_interest_id IN ('quran_memorization');
UPDATE public.leads SET service_interest_id = 'quran-revision' WHERE service_interest_id IN ('quran_revision');
UPDATE public.leads SET service_interest_id = 'islamic-studies' WHERE service_interest_id IN ('islamic_studies', 'islamic-studies-general');
UPDATE public.leads SET service_interest_id = 'arabic-foundations' WHERE service_interest_id IN ('arabic');
UPDATE public.leads SET service_interest_id = 'modern-standard-arabic' WHERE service_interest_id IN ('modern_standard_arabic');
UPDATE public.leads SET service_interest_id = 'arabic-conversation' WHERE service_interest_id IN ('arabic_conversation');
UPDATE public.leads SET service_interest_id = 'egyptian-arabic' WHERE service_interest_id IN ('egyptian_arabic');
UPDATE public.leads SET service_interest_id = 'english' WHERE service_interest_id IN ('english-coaching');

-- Delete obsolete legacy service records that are now fully canonicalized
DELETE FROM public.services WHERE id IN ('quran_reading', 'quran_memorization', 'quran_revision', 'islamic_studies', 'arabic', 'modern_standard_arabic', 'arabic_conversation', 'egyptian_arabic');

-- 7. OVERHAUL: CHECK TRIAL ELIGIBILITY RPC (HARDENED)
CREATE OR REPLACE FUNCTION public.check_trial_eligibility(
    p_email TEXT,
    p_whatsapp TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_email TEXT;
    v_clean_phone TEXT;
    v_count INTEGER;
BEGIN
    v_clean_email := lower(trim(COALESCE(p_email, '')));
    IF v_clean_email = '' OR position('@' in v_clean_email) = 0 THEN
        RETURN false;
    END IF;

    v_clean_phone := regexp_replace(COALESCE(p_whatsapp, ''), '[^0-9+]', '', 'g');

    -- Check if non-cancelled trial exists for normalized email or phone
    SELECT COUNT(*)
    INTO v_count
    FROM public.bookings
    WHERE booking_type = 'trial'
      AND status IN ('pending', 'confirmed', 'rescheduled', 'completed')
      AND (
          lower(trim(contact_email)) = v_clean_email
          OR (
              v_clean_phone <> ''
              AND length(v_clean_phone) >= 7
              AND regexp_replace(COALESCE(contact_whatsapp, ''), '[^0-9+]', '', 'g') = v_clean_phone
          )
      );

    RETURN (v_count = 0);
END;
$$;

-- 8. FIX #4 & #10 — AUTHORITATIVE ATOMIC BOOKING FUNCTION (WITH CONCURRENCY & PRICING HARDENING)
CREATE OR REPLACE FUNCTION public.create_booking_atomic(p_booking JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_contact_name TEXT;
    v_contact_email TEXT;
    v_contact_whatsapp TEXT;
    v_parent_name TEXT;
    v_audience TEXT;
    v_service_id TEXT;
    v_booking_type TEXT;
    v_duration INTEGER;
    v_scheduled_start TIMESTAMPTZ;
    v_scheduled_end TIMESTAMPTZ;
    v_timezone TEXT;
    v_cairo_time_display TEXT;
    v_goal TEXT;
    v_notes TEXT;
    v_ref_code TEXT;
    v_management_token TEXT;
    v_service RECORD;
    v_calculated_fee NUMERIC(6, 2);
    v_lead_id UUID;
    v_booking_id UUID;
    v_rem_24h TIMESTAMPTZ;
    v_rem_1h TIMESTAMPTZ;
    v_trial_eligible BOOLEAN;
BEGIN
    -- Extract and sanitize inputs
    v_contact_name := trim(COALESCE(p_booking->>'contact_name', ''));
    v_contact_email := lower(trim(COALESCE(p_booking->>'contact_email', '')));
    v_contact_whatsapp := trim(COALESCE(p_booking->>'contact_whatsapp', ''));
    v_parent_name := trim(COALESCE(p_booking->>'parent_name', ''));
    v_audience := COALESCE(p_booking->>'audience', 'adult');
    v_service_id := trim(COALESCE(p_booking->>'service_id', ''));
    v_booking_type := COALESCE(p_booking->>'booking_type', 'trial');
    v_duration := COALESCE((p_booking->>'duration_minutes')::INTEGER, 30);
    v_scheduled_start := (p_booking->>'scheduled_start')::TIMESTAMPTZ;
    v_scheduled_end := (p_booking->>'scheduled_end')::TIMESTAMPTZ;
    v_timezone := trim(COALESCE(p_booking->>'student_timezone', 'UTC'));
    v_cairo_time_display := trim(COALESCE(p_booking->>'cairo_time_display', ''));
    v_goal := trim(COALESCE(p_booking->>'goal', ''));
    v_notes := trim(COALESCE(p_booking->>'notes', ''));

    -- 1. Strict Server-Side Validation
    IF v_contact_name = '' OR length(v_contact_name) < 2 THEN
        RAISE EXCEPTION 'Student name is required.';
    END IF;

    IF v_contact_email = '' OR position('@' in v_contact_email) = 0 THEN
        RAISE EXCEPTION 'A valid contact email address is required.';
    END IF;

    IF v_audience = 'child' AND (v_parent_name = '' OR length(v_parent_name) < 2) THEN
        RAISE EXCEPTION 'Parent or guardian name is required for child learners.';
    END IF;

    IF v_scheduled_start IS NULL OR v_scheduled_end IS NULL THEN
        RAISE EXCEPTION 'Invalid lesson schedule: start and end times must be valid UTC timestamps.';
    END IF;

    IF v_scheduled_start <= now() THEN
        RAISE EXCEPTION 'Scheduled lesson time must be in the future.';
    END IF;

    IF v_duration NOT IN (30, 45, 60) THEN
        RAISE EXCEPTION 'Lesson duration must be 30, 45, or 60 minutes.';
    END IF;

    -- Strict duration-to-end check
    IF v_scheduled_end <> (v_scheduled_start + (v_duration || ' minutes')::INTERVAL) THEN
        RAISE EXCEPTION 'Scheduled end timestamp must match scheduled start plus exact duration.';
    END IF;

    -- 2. Strict Service & Authoritative Pricing Check (FIX #4: NO DEFAULT $7 FALLBACK)
    SELECT *
    INTO v_service
    FROM public.services
    WHERE id = v_service_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service "%" does not exist in the official curriculum.', v_service_id;
    END IF;

    IF NOT v_service.is_active THEN
        RAISE EXCEPTION 'The selected service "%" is currently inactive.', v_service.title;
    END IF;

    IF v_duration <> ALL(v_service.supported_durations) THEN
        RAISE EXCEPTION 'The selected duration of % minutes is not supported for service "%".', v_duration, v_service.title;
    END IF;

    IF v_booking_type = 'trial' AND NOT v_service.trial_allowed THEN
        RAISE EXCEPTION 'Complimentary free trials are not permitted for service "%".', v_service.title;
    END IF;

    -- Authoritative server pricing calculation
    IF v_booking_type = 'trial' THEN
        v_calculated_fee := 0.00;
    ELSE
        IF v_duration = 30 THEN
            v_calculated_fee := round(v_service.hourly_rate_usd * 0.55, 2);
        ELSIF v_duration = 45 THEN
            v_calculated_fee := round(v_service.hourly_rate_usd * 0.80, 2);
        ELSE
            v_calculated_fee := v_service.hourly_rate_usd;
        END IF;
    END IF;

    -- 3. Free Trial Rule Enforcement (Pre-Check UX + Database Unique Index)
    IF v_booking_type = 'trial' THEN
        v_trial_eligible := public.check_trial_eligibility(v_contact_email, v_contact_whatsapp);
        IF NOT v_trial_eligible THEN
            RAISE EXCEPTION 'Our records indicate a free trial session has already been booked with this contact information. Each student is eligible for one complimentary trial. You may book a regular lesson or message Mahmoud on WhatsApp.';
        END IF;
    END IF;

    -- 4. Secure Reference Code & Management Token Generation
    LOOP
        v_ref_code := 'MHM-' || substring(upper(md5(random()::text || clock_timestamp()::text)) from 1 for 6);
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.bookings WHERE reference_code = v_ref_code);
    END LOOP;

    v_management_token := encode(gen_random_bytes(24), 'hex');

    -- 5. Leads Deterministic Upsert (FIX #3)
    INSERT INTO public.leads (
        name, email, whatsapp, learner_type, service_interest_id,
        goal, source, status, notes
    ) VALUES (
        v_contact_name, v_contact_email, NULLIF(v_contact_whatsapp, ''), v_audience, v_service.id,
        v_goal, 'web_booking_modal',
        CASE WHEN v_booking_type = 'trial' THEN 'trial_booked' ELSE 'lead' END,
        CASE WHEN v_audience = 'child' THEN 'Parent: ' || v_parent_name ELSE v_notes END
    )
    ON CONFLICT (lower(trim(email))) DO UPDATE SET
        name = EXCLUDED.name,
        whatsapp = COALESCE(EXCLUDED.whatsapp, public.leads.whatsapp),
        status = CASE WHEN v_booking_type = 'trial' THEN 'trial_booked' ELSE public.leads.status END,
        updated_at = timezone('utc'::text, now())
    RETURNING id INTO v_lead_id;

    -- 6. Insert Booking Record (Concurrency Protected by Exclusion Constraint and Partial Unique Indexes)
    BEGIN
        INSERT INTO public.bookings (
            reference_code, management_token, lead_id, service_id, booking_type, duration_minutes,
            scheduled_start, scheduled_end, student_timezone, cairo_time_display,
            status, contact_name, contact_email, contact_whatsapp, parent_name,
            fee_amount_usd, zoom_meeting_link, notes
        ) VALUES (
            v_ref_code, v_management_token, v_lead_id, v_service.id, v_booking_type, v_duration,
            v_scheduled_start, v_scheduled_end, v_timezone, v_cairo_time_display,
            'confirmed', v_contact_name, v_contact_email, NULLIF(v_contact_whatsapp, ''), NULLIF(v_parent_name, ''),
            v_calculated_fee, 'https://zoom.us/j/mahmoud-teaching-room', v_notes
        )
        RETURNING id INTO v_booking_id;
    EXCEPTION
        WHEN exclusion_violation THEN
            RAISE EXCEPTION 'The selected time slot is no longer available. Please select another time.';
        WHEN unique_violation THEN
            IF SQLERRM LIKE '%idx_bookings_unique_active_trial%' THEN
                RAISE EXCEPTION 'Our records indicate a free trial session has already been booked with this contact information. Each student is eligible for one complimentary trial. You may book a regular lesson or message Mahmoud on WhatsApp.';
            ELSE
                RAISE EXCEPTION 'Booking conflict detected. Please retry or choose another slot.';
            END IF;
    END;

    -- 7. Schedule Automated Reminders (24h and 1h before start)
    v_rem_24h := v_scheduled_start - INTERVAL '24 hours';
    v_rem_1h := v_scheduled_start - INTERVAL '1 hour';

    IF v_rem_24h > now() THEN
        INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for, status)
        VALUES (v_booking_id, '24h_before', v_rem_24h, 'pending');
    END IF;

    IF v_rem_1h > now() THEN
        INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for, status)
        VALUES (v_booking_id, '1h_before', v_rem_1h, 'pending');
    END IF;

    -- Return confirmed booking payload including private management token
    RETURN jsonb_build_object(
        'success', true,
        'bookingId', v_booking_id,
        'referenceCode', v_ref_code,
        'managementToken', v_management_token,
        'serviceTitle', v_service.title,
        'feeAmountUsd', v_calculated_fee,
        'scheduledStart', v_scheduled_start,
        'scheduledEnd', v_scheduled_end,
        'studentTimezone', v_timezone,
        'cairoTimeDisplay', v_cairo_time_display
    );
END;
$$;

-- 9. FIX #6 & #7 — SECURE BOOKING LOOKUP WITH DATA MINIMIZATION
-- Requires either valid management token OR matching reference + management token.
-- Reference alone NEVER returns private student details.
CREATE OR REPLACE FUNCTION public.get_booking_management(
    p_reference_code TEXT,
    p_management_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_ref TEXT;
    v_clean_token TEXT;
    v_booking RECORD;
    v_service RECORD;
BEGIN
    v_clean_ref := upper(trim(COALESCE(p_reference_code, '')));
    v_clean_token := trim(COALESCE(p_management_token, ''));

    IF v_clean_token = '' THEN
        RAISE EXCEPTION 'Unauthorized: A valid management token is required.';
    END IF;

    SELECT b.*
    INTO v_booking
    FROM public.bookings b
    WHERE b.management_token = v_clean_token
      AND (v_clean_ref = '' OR upper(b.reference_code) = v_clean_ref)
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No matching booking found for the provided management credentials.';
    END IF;

    -- Lookup service title
    SELECT s.title, s.arabic_title
    INTO v_service
    FROM public.services s
    WHERE s.id = v_booking.service_id;

    -- Return strictly minimized public data (No internal notes, lead_id, payment ID, or full email)
    RETURN jsonb_build_object(
        'reference', v_booking.reference_code,
        'managementToken', v_booking.management_token,
        'serviceId', v_booking.service_id,
        'serviceName', COALESCE(v_service.title, '1-on-1 Lesson'),
        'serviceArabicName', COALESCE(v_service.arabic_title, 'درس فردي'),
        'learnerName', v_booking.contact_name,
        'parentName', v_booking.parent_name,
        'scheduledIsoDatetime', v_booking.scheduled_start,
        'scheduledEndIsoDatetime', v_booking.scheduled_end,
        'durationMinutes', v_booking.duration_minutes,
        'timezone', v_booking.student_timezone,
        'cairoTimeDisplay', v_booking.cairo_time_display,
        'mode', v_booking.booking_type,
        'status', v_booking.status,
        'feeAmountUsd', v_booking.fee_amount_usd,
        'zoomMeetingLink', v_booking.zoom_meeting_link
    );
END;
$$;

-- Backward compatibility alias for get_booking_by_reference:
-- Only returns safe non-sensitive data if the management token is also provided, otherwise throws authorization error.
CREATE OR REPLACE FUNCTION public.get_booking_by_reference(
    p_reference_code TEXT,
    p_management_token TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN public.get_booking_management(p_reference_code, p_management_token);
END;
$$;

-- 10. FIX #8 — SECURE CANCELLATION RPC (AUTHORIZATION + 3-HOUR RULE)
CREATE OR REPLACE FUNCTION public.cancel_booking_by_management(
    p_reference_code TEXT,
    p_management_token TEXT,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_ref TEXT;
    v_clean_token TEXT;
    v_booking RECORD;
BEGIN
    v_clean_ref := upper(trim(COALESCE(p_reference_code, '')));
    v_clean_token := trim(COALESCE(p_management_token, ''));

    IF v_clean_token = '' THEN
        RAISE EXCEPTION 'Unauthorized: A valid management token is required to cancel a booking.';
    END IF;

    SELECT *
    INTO v_booking
    FROM public.bookings
    WHERE management_token = v_clean_token
      AND (v_clean_ref = '' OR upper(reference_code) = v_clean_ref)
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No matching booking found for the provided management credentials.';
    END IF;

    IF v_booking.status = 'cancelled' THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Booking ' || v_booking.reference_code || ' is already cancelled.'
        );
    END IF;

    IF v_booking.status = 'completed' THEN
        RAISE EXCEPTION 'Completed lessons cannot be cancelled.';
    END IF;

    -- Master Spec Section 21: 3-Hour Cancellation Rule
    IF v_booking.scheduled_start < (now() + INTERVAL '3 hours') THEN
        RAISE EXCEPTION 'Self-service cancellation is not permitted within 3 hours of the lesson. Please contact Mahmoud directly on WhatsApp.';
    END IF;

    -- Mark booking cancelled
    UPDATE public.bookings
    SET status = 'cancelled',
        cancellation_reason = COALESCE(p_reason, 'Cancelled by student through portal'),
        updated_at = timezone('utc'::text, now())
    WHERE id = v_booking.id;

    -- Cancel pending reminders
    UPDATE public.reminders
    SET status = 'cancelled'
    WHERE booking_id = v_booking.id AND status = 'pending';

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Booking ' || v_booking.reference_code || ' has been successfully cancelled.'
    );
END;
$$;

-- Backward compatibility wrapper for cancel_booking_by_reference
CREATE OR REPLACE FUNCTION public.cancel_booking_by_reference(
    p_reference_code TEXT,
    p_reason TEXT DEFAULT NULL,
    p_management_token TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN public.cancel_booking_by_management(p_reference_code, p_management_token, p_reason);
END;
$$;

-- 11. FIX #8 — SECURE RESCHEDULE RPC (AUTHORIZATION + 3-HOUR RULE + CONCURRENCY PROTECTION)
CREATE OR REPLACE FUNCTION public.reschedule_booking_by_management(
    p_reference_code TEXT,
    p_management_token TEXT,
    p_new_start TIMESTAMPTZ,
    p_new_end TIMESTAMPTZ,
    p_cairo_time_display TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_ref TEXT;
    v_clean_token TEXT;
    v_booking RECORD;
    v_rem_24h TIMESTAMPTZ;
    v_rem_1h TIMESTAMPTZ;
BEGIN
    v_clean_ref := upper(trim(COALESCE(p_reference_code, '')));
    v_clean_token := trim(COALESCE(p_management_token, ''));

    IF v_clean_token = '' THEN
        RAISE EXCEPTION 'Unauthorized: A valid management token is required to reschedule a booking.';
    END IF;

    SELECT *
    INTO v_booking
    FROM public.bookings
    WHERE management_token = v_clean_token
      AND (v_clean_ref = '' OR upper(reference_code) = v_clean_ref)
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No matching booking found for the provided management credentials.';
    END IF;

    IF v_booking.status = 'cancelled' THEN
        RAISE EXCEPTION 'Cannot reschedule a cancelled booking. Please book a new lesson.';
    END IF;

    IF v_booking.status = 'completed' THEN
        RAISE EXCEPTION 'Completed lessons cannot be rescheduled.';
    END IF;

    -- Master Spec Section 21: 3-Hour Rule on current scheduled time
    IF v_booking.scheduled_start < (now() + INTERVAL '3 hours') THEN
        RAISE EXCEPTION 'Self-service rescheduling is not permitted within 3 hours of the lesson. Please contact Mahmoud directly on WhatsApp.';
    END IF;

    IF p_new_start <= now() THEN
        RAISE EXCEPTION 'The new lesson time must be in the future.';
    END IF;

    -- Duration integrity verification
    IF p_new_end <> (p_new_start + (v_booking.duration_minutes || ' minutes')::INTERVAL) THEN
        RAISE EXCEPTION 'New schedule end must match start plus exact lesson duration (% minutes).', v_booking.duration_minutes;
    END IF;

    -- Update booking (PostgreSQL exclusion constraint catches any concurrent overlap)
    BEGIN
        UPDATE public.bookings
        SET scheduled_start = p_new_start,
            scheduled_end = p_new_end,
            cairo_time_display = COALESCE(p_cairo_time_display, v_booking.cairo_time_display),
            status = 'rescheduled',
            updated_at = timezone('utc'::text, now())
        WHERE id = v_booking.id;
    EXCEPTION
        WHEN exclusion_violation THEN
            RAISE EXCEPTION 'The newly selected time slot is already booked. Please choose another time.';
    END;

    -- Reschedule reminders atomically
    DELETE FROM public.reminders WHERE booking_id = v_booking.id;

    v_rem_24h := p_new_start - INTERVAL '24 hours';
    v_rem_1h := p_new_start - INTERVAL '1 hour';

    IF v_rem_24h > now() THEN
        INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for, status)
        VALUES (v_booking.id, '24h_before', v_rem_24h, 'pending');
    END IF;

    IF v_rem_1h > now() THEN
        INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for, status)
        VALUES (v_booking.id, '1h_before', v_rem_1h, 'pending');
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Booking ' || v_booking.reference_code || ' has been successfully rescheduled.',
        'newStart', p_new_start,
        'newEnd', p_new_end
    );
END;
$$;

-- Backward compatibility wrapper for reschedule_booking_by_reference
CREATE OR REPLACE FUNCTION public.reschedule_booking_by_reference(
    p_reference_code TEXT,
    p_new_start TIMESTAMPTZ,
    p_new_end TIMESTAMPTZ,
    p_cairo_time_display TEXT DEFAULT NULL,
    p_management_token TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN public.reschedule_booking_by_management(p_reference_code, p_management_token, p_new_start, p_new_end, p_cairo_time_display);
END;
$$;
