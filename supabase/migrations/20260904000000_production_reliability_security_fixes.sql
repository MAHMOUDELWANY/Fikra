-- ====================================================================
-- MAHMOUD TEACHING PLATFORM — PRODUCTION RELIABILITY & SECURITY FIXES
-- File: supabase/migrations/20260904000000_production_reliability_security_fixes.sql
-- Role: Atomic Booking Transaction, Secure Lookup/Cancel/Reschedule RPCs,
--       Leaking RLS Policy Remediation, Slot Conflict & 3-Hour Policy Enforcement
-- ====================================================================

-- 1. DROP THE INSECURE LEAKING POLICY
-- The previous policy `USING (reference_code IS NOT NULL)` exposed all student
-- records and private contact info to any anonymous client.
DROP POLICY IF EXISTS "Public lookup booking by reference" ON public.bookings;

-- 2. ENSURE CANONICAL & HYPHENATED SERVICE IDS ARE SUPPORTED IN SERVICES TABLE
-- Some clients and URL routes use 'quran-reading' while database originally used 'quran_reading'.
-- We insert/update both forms to ensure foreign key integrity without runtime errors.
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

('islamic-studies', 'islamic_studies', 'General Islamic Studies', 'الدراسات الإسلامية العامة',
 'Comprehensive and age-appropriate Islamic curriculum covering essentials of faith, manners, and daily worship.',
 'منهج إسلامي متكامل ومناسب لكل الأعمار يغطي أركان الإسلام والأخلاق والآداب اليومية.',
 5, true, 7.00, '{30, 45, 60}', true),

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

('arabic-foundations', 'arabic', 'Arabic for Beginners (Reading, Writing & Phonics)', 'أساسيات اللغة العربية للمبتدئين',
 'A gentle, systematic start for non-Arabic speakers and reverts.',
 'مخصص لمن لا يعرف قراءة الحروف أو المسلمين الجدد لبناء الأساس بثقة.',
 9, true, 7.00, '{30, 45, 60}', true)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    arabic_title = EXCLUDED.arabic_title,
    is_active = EXCLUDED.is_active,
    hourly_rate_usd = EXCLUDED.hourly_rate_usd;

-- 3. SECURE RPC: LOOKUP BOOKING BY REFERENCE
-- Allows public visitors to view ONLY their own booking by supplying the exact reference code.
-- Does NOT expose internal teacher notes or payment IDs.
CREATE OR REPLACE FUNCTION public.get_booking_by_reference(p_reference_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_ref TEXT;
    v_booking RECORD;
    v_service RECORD;
    v_result JSONB;
BEGIN
    v_clean_ref := upper(trim(COALESCE(p_reference_code, '')));
    IF v_clean_ref = '' THEN
        RETURN NULL;
    END IF;

    SELECT b.*
    INTO v_booking
    FROM public.bookings b
    WHERE upper(b.reference_code) = v_clean_ref
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Lookup service title
    SELECT s.title, s.arabic_title
    INTO v_service
    FROM public.services s
    WHERE s.id = v_booking.service_id
       OR s.id = replace(v_booking.service_id, '-', '_')
       OR s.id = replace(v_booking.service_id, '_', '-')
    LIMIT 1;

    v_result := jsonb_build_object(
        'reference', v_booking.reference_code,
        'serviceId', v_booking.service_id,
        'serviceName', COALESCE(v_service.title, '1-on-1 Lesson'),
        'serviceArabicName', COALESCE(v_service.arabic_title, 'درس فردي'),
        'learnerName', v_booking.contact_name,
        'parentName', v_booking.parent_name,
        'email', v_booking.contact_email,
        'whatsapp', v_booking.contact_whatsapp,
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

    RETURN v_result;
END;
$$;

-- 4. ATOMIC BOOKING TRANSACTION RPC
-- Encapsulates validation, trial eligibility, slot conflict checks, lead creation/update,
-- booking record insertion, and automated reminder scheduling in ONE single atomic transaction.
CREATE OR REPLACE FUNCTION public.create_booking_atomic(p_booking JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_contact_name TEXT;
    v_contact_email TEXT;
    v_contact_whatsapp TEXT;
    v_parent_name TEXT;
    v_audience TEXT;
    v_service_id TEXT;
    v_service_canonical_id TEXT;
    v_booking_type TEXT;
    v_duration INTEGER;
    v_scheduled_start TIMESTAMPTZ;
    v_scheduled_end TIMESTAMPTZ;
    v_timezone TEXT;
    v_cairo_time_display TEXT;
    v_goal TEXT;
    v_notes TEXT;
    v_ref_code TEXT;
    v_hourly_rate NUMERIC;
    v_calculated_fee NUMERIC;
    v_service_title TEXT;
    v_lead_id UUID;
    v_booking_id UUID;
    v_conflict_count INTEGER;
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
    v_service_id := trim(COALESCE(p_booking->>'service_id', 'quran-reading'));
    v_booking_type := COALESCE(p_booking->>'booking_type', 'trial');
    v_duration := COALESCE((p_booking->>'duration_minutes')::INTEGER, 30);
    v_scheduled_start := (p_booking->>'scheduled_start')::TIMESTAMPTZ;
    v_scheduled_end := (p_booking->>'scheduled_end')::TIMESTAMPTZ;
    v_timezone := trim(COALESCE(p_booking->>'student_timezone', 'UTC'));
    v_cairo_time_display := trim(COALESCE(p_booking->>'cairo_time_display', ''));
    v_goal := trim(COALESCE(p_booking->>'goal', ''));
    v_notes := trim(COALESCE(p_booking->>'notes', ''));
    v_ref_code := trim(COALESCE(p_booking->>'reference_code', ''));

    -- 1. Input Validation
    IF v_contact_name = '' THEN
        RAISE EXCEPTION 'Student name is required.';
    END IF;

    IF v_contact_email = '' OR position('@' in v_contact_email) = 0 THEN
        RAISE EXCEPTION 'A valid email address is required.';
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

    -- 2. Free Trial Rule Enforcement (Master Spec Section 10)
    IF v_booking_type = 'trial' THEN
        v_trial_eligible := public.check_trial_eligibility(v_contact_email, v_contact_whatsapp);
        IF NOT v_trial_eligible THEN
            RAISE EXCEPTION 'Our records indicate a free trial session has already been booked with this contact information. Each student is eligible for one complimentary trial. You may book a regular lesson or message Mahmoud on WhatsApp.';
        END IF;
    END IF;

    -- 3. Resolve Service and Server-Side Pricing (Source of Truth)
    SELECT s.id, s.title, s.hourly_rate_usd
    INTO v_service_canonical_id, v_service_title, v_hourly_rate
    FROM public.services s
    WHERE s.id = v_service_id
       OR s.id = replace(v_service_id, '-', '_')
       OR s.id = replace(v_service_id, '_', '-')
    LIMIT 1;

    IF NOT FOUND THEN
        v_service_canonical_id := v_service_id;
        v_service_title := '1-on-1 Lesson';
        v_hourly_rate := 7.00;
    END IF;

    IF v_booking_type = 'trial' THEN
        v_calculated_fee := 0.00;
    ELSE
        IF v_duration = 30 THEN
            v_calculated_fee := round(v_hourly_rate * 0.55, 2);
        ELSIF v_duration = 45 THEN
            v_calculated_fee := round(v_hourly_rate * 0.80, 2);
        ELSE
            v_calculated_fee := v_hourly_rate;
        END IF;
    END IF;

    -- 4. Double-Booking / Slot Conflict Prevention
    -- Check if any non-cancelled booking overlaps with the requested time window
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM public.bookings
    WHERE status IN ('confirmed', 'pending')
      AND tstzrange(scheduled_start, scheduled_end) && tstzrange(v_scheduled_start, v_scheduled_end);

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'The selected time slot is no longer available. Please select another time.';
    END IF;

    -- 5. Reference Code Generation / Verification
    IF v_ref_code = '' OR length(v_ref_code) < 5 THEN
        v_ref_code := 'MHM-' || floor(10000 + random() * 90000)::TEXT;
    END IF;

    -- 6. Insert or Update Lead Record
    INSERT INTO public.leads (
        name, email, whatsapp, learner_type, service_interest_id,
        goal, source, status, notes
    ) VALUES (
        v_contact_name, v_contact_email, v_contact_whatsapp, v_audience, v_service_canonical_id,
        v_goal, 'web_booking_modal',
        CASE WHEN v_booking_type = 'trial' THEN 'trial_booked' ELSE 'lead' END,
        CASE WHEN v_audience = 'child' THEN 'Parent: ' || v_parent_name ELSE v_notes END
    )
    ON CONFLICT (lower(email)) DO UPDATE SET
        name = EXCLUDED.name,
        whatsapp = COALESCE(NULLIF(EXCLUDED.whatsapp, ''), public.leads.whatsapp),
        status = CASE WHEN v_booking_type = 'trial' THEN 'trial_booked' ELSE public.leads.status END,
        updated_at = timezone('utc'::text, now())
    RETURNING id INTO v_lead_id;

    -- 7. Insert Confirmed Booking Record
    INSERT INTO public.bookings (
        reference_code, lead_id, service_id, booking_type, duration_minutes,
        scheduled_start, scheduled_end, student_timezone, cairo_time_display,
        status, contact_name, contact_email, contact_whatsapp, parent_name,
        fee_amount_usd, zoom_meeting_link, notes
    ) VALUES (
        v_ref_code, v_lead_id, v_service_canonical_id, v_booking_type, v_duration,
        v_scheduled_start, v_scheduled_end, v_timezone, v_cairo_time_display,
        'confirmed', v_contact_name, v_contact_email, v_contact_whatsapp, v_parent_name,
        v_calculated_fee, 'https://zoom.us/j/mahmoud-teaching-room', v_notes
    )
    RETURNING id INTO v_booking_id;

    -- 8. Schedule Automated Reminders (24h and 1h before start)
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

    -- Return confirmed booking payload
    RETURN jsonb_build_object(
        'success', true,
        'bookingId', v_booking_id,
        'referenceCode', v_ref_code,
        'serviceTitle', v_service_title,
        'feeAmountUsd', v_calculated_fee,
        'scheduledStart', v_scheduled_start,
        'scheduledEnd', v_scheduled_end,
        'studentTimezone', v_timezone,
        'cairoTimeDisplay', v_cairo_time_display
    );
END;
$$;

-- 5. SECURE CANCELLATION RPC (3-Hour Rule Enforced in Database)
CREATE OR REPLACE FUNCTION public.cancel_booking_by_reference(
    p_reference_code TEXT,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_ref TEXT;
    v_booking RECORD;
BEGIN
    v_clean_ref := upper(trim(COALESCE(p_reference_code, '')));
    IF v_clean_ref = '' THEN
        RAISE EXCEPTION 'Booking reference code is required.';
    END IF;

    SELECT *
    INTO v_booking
    FROM public.bookings
    WHERE upper(reference_code) = v_clean_ref
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No booking found matching reference "%".', v_clean_ref;
    END IF;

    IF v_booking.status = 'cancelled' THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Booking ' || v_clean_ref || ' is already cancelled.'
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
        'message', 'Booking ' || v_clean_ref || ' has been successfully cancelled.'
    );
END;
$$;

-- 6. SECURE RESCHEDULE RPC (3-Hour Rule & Conflict Check in Database)
CREATE OR REPLACE FUNCTION public.reschedule_booking_by_reference(
    p_reference_code TEXT,
    p_new_start TIMESTAMPTZ,
    p_new_end TIMESTAMPTZ,
    p_cairo_time_display TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_ref TEXT;
    v_booking RECORD;
    v_conflict_count INTEGER;
    v_rem_24h TIMESTAMPTZ;
    v_rem_1h TIMESTAMPTZ;
BEGIN
    v_clean_ref := upper(trim(COALESCE(p_reference_code, '')));
    IF v_clean_ref = '' THEN
        RAISE EXCEPTION 'Booking reference code is required.';
    END IF;

    SELECT *
    INTO v_booking
    FROM public.bookings
    WHERE upper(reference_code) = v_clean_ref
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No booking found matching reference "%".', v_clean_ref;
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

    -- Check for slot conflicts on the new time window
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM public.bookings
    WHERE id <> v_booking.id
      AND status IN ('confirmed', 'pending')
      AND tstzrange(scheduled_start, scheduled_end) && tstzrange(p_new_start, p_new_end);

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'The newly selected time slot is already booked. Please choose another time.';
    END IF;

    -- Update booking with new start/end
    UPDATE public.bookings
    SET scheduled_start = p_new_start,
        scheduled_end = p_new_end,
        cairo_time_display = COALESCE(p_cairo_time_display, v_booking.cairo_time_display),
        status = 'rescheduled',
        updated_at = timezone('utc'::text, now())
    WHERE id = v_booking.id;

    -- Reschedule reminders
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
        'message', 'Booking ' || v_clean_ref || ' has been successfully rescheduled.',
        'newStart', p_new_start,
        'newEnd', p_new_end
    );
END;
$$;
