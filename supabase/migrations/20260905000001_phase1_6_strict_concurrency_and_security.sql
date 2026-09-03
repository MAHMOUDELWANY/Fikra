-- ====================================================================
-- PHASE 1.6: STRICT CONCURRENCY & SECURITY HARDENING
-- ====================================================================

-- 1. Double Booking Prevention via Exclusion Constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- We only want to prevent overlap for ACTIVE bookings.
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_no_overlap_excl;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_no_overlap_excl
EXCLUDE USING gist (
  tstzrange(scheduled_start, scheduled_end, '[)') WITH &&
)
WHERE (status IN ('pending', 'confirmed', 'rescheduled'));

-- 2. Concurrency-Safe Free Trial Enforcement
-- We should add a unique index to prevent a second trial booking for the same normalized email/whatsapp.

-- Drop any previous trial index
DROP INDEX IF EXISTS public.idx_bookings_unique_active_trial_email;
DROP INDEX IF EXISTS public.idx_bookings_unique_active_trial_whatsapp;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_one_trial_email 
ON public.bookings (lower(contact_email)) 
WHERE (booking_type = 'trial' AND status IN ('pending', 'confirmed', 'rescheduled', 'completed'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_one_trial_whatsapp 
ON public.bookings (contact_whatsapp) 
WHERE (booking_type = 'trial' AND status IN ('pending', 'confirmed', 'rescheduled', 'completed') AND contact_whatsapp IS NOT NULL);

-- 3. FIX LEAD EMAIL UNIQUENESS
-- Safely deduplicate leads first
DELETE FROM public.leads a USING public.leads b
WHERE lower(a.email) = lower(b.email) AND a.created_at < b.created_at;

-- Create Unique Index matching exact ON CONFLICT semantics
DROP INDEX IF EXISTS public.idx_leads_unique_lower_email;
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_unique_lower_email ON public.leads (lower(email));


-- 4. FIX REMINDERS UNIQUENESS
-- Prevent multiple reminders of the same type for the same booking
CREATE UNIQUE INDEX IF NOT EXISTS idx_reminders_booking_type 
ON public.reminders (booking_id, reminder_type)
WHERE status = 'pending';


-- ====================================================================
-- STRICT ATOMIC BOOKING FUNCTION
-- ====================================================================

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

    -- Strict duration-to-end check
    IF v_scheduled_end <> (v_scheduled_start + (v_duration || ' minutes')::INTERVAL) THEN
        RAISE EXCEPTION 'Scheduled end timestamp must match scheduled start plus exact duration.';
    END IF;

    -- 2. Strict Service & Authoritative Pricing Check
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

    -- 3. Secure Reference Code & Management Token Generation
    LOOP
        v_ref_code := 'MHM-' || substring(upper(md5(random()::text || clock_timestamp()::text)) from 1 for 6);
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.bookings WHERE reference_code = v_ref_code);
    END LOOP;

    v_management_token := encode(gen_random_bytes(24), 'hex');

    -- 4. Leads Deterministic Upsert
    INSERT INTO public.leads (
        name, email, whatsapp, learner_type, service_interest_id,
        goal, source, status, notes
    ) VALUES (
        v_contact_name, v_contact_email, NULLIF(v_contact_whatsapp, ''), v_audience, v_service.id,
        v_goal, 'web_booking_modal',
        CASE WHEN v_booking_type = 'trial' THEN 'trial_booked' ELSE 'lead' END,
        CASE WHEN v_audience = 'child' THEN 'Parent: ' || v_parent_name ELSE v_notes END
    )
    ON CONFLICT (lower(email)) DO UPDATE SET
        name = EXCLUDED.name,
        whatsapp = COALESCE(EXCLUDED.whatsapp, public.leads.whatsapp),
        status = CASE WHEN v_booking_type = 'trial' THEN 'trial_booked' ELSE public.leads.status END,
        updated_at = timezone('utc'::text, now())
    RETURNING id INTO v_lead_id;

    -- 5. Insert Booking Record
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
            IF SQLERRM LIKE '%idx_bookings_one_trial%' THEN
                RAISE EXCEPTION 'Our records indicate a free trial session has already been booked with this contact information. Each student is eligible for one complimentary trial. You may book a regular lesson or message Mahmoud on WhatsApp.';
            ELSE
                RAISE EXCEPTION 'Booking conflict detected. Please retry or choose another slot.';
            END IF;
    END;

    -- 6. Schedule Automated Reminders (24h and 1h before start)
    v_rem_24h := v_scheduled_start - INTERVAL '24 hours';
    v_rem_1h := v_scheduled_start - INTERVAL '1 hour';

    IF v_rem_24h > now() THEN
        INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for, status)
        VALUES (v_booking_id, '24h_before', v_rem_24h, 'pending')
        ON CONFLICT (booking_id, reminder_type) DO NOTHING;
    END IF;

    IF v_rem_1h > now() THEN
        INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for, status)
        VALUES (v_booking_id, '1h_before', v_rem_1h, 'pending')
        ON CONFLICT (booking_id, reminder_type) DO NOTHING;
    END IF;

    -- Return confirmed booking payload including private management token
    RETURN jsonb_build_object(
        'success', true,
        'bookingId', v_booking_id,
        'referenceCode', v_ref_code,
        'managementToken', v_management_token,
        'serviceName', COALESCE(v_service.title, '1-on-1 Lesson'),
        'feeAmountUsd', v_calculated_fee,
        'zoomMeetingLink', 'https://zoom.us/j/mahmoud-teaching-room'
    );
END;
$$;

-- OVERRIDE get_booking_management TO MAKE TOKEN MANDATORY
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

    IF v_clean_ref = '' OR v_clean_token = '' THEN
        RAISE EXCEPTION 'Unauthorized: Both reference code and management token are required.';
    END IF;

    -- Strict lookup requiring exact token match
    SELECT *
    INTO v_booking
    FROM public.bookings
    WHERE upper(reference_code) = v_clean_ref
      AND management_token = v_clean_token
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No matching booking found for the provided management credentials.';
    END IF;

    -- Lookup service title
    SELECT s.title, s.arabic_title
    INTO v_service
    FROM public.services s
    WHERE s.id = v_booking.service_id;

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

-- REDEFINE get_booking_by_reference TO REQUIRE TOKEN
CREATE OR REPLACE FUNCTION public.get_booking_by_reference(
    p_reference_code TEXT,
    p_management_token TEXT
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


CREATE OR REPLACE FUNCTION public.cancel_booking_by_management(
    p_reference_code TEXT,
    p_management_token TEXT,
    p_reason TEXT DEFAULT 'Cancelled by student through portal'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_ref TEXT;
    v_clean_token TEXT;
    v_booking_id UUID;
    v_status TEXT;
    v_scheduled_start TIMESTAMPTZ;
BEGIN
    v_clean_ref := upper(trim(COALESCE(p_reference_code, '')));
    v_clean_token := trim(COALESCE(p_management_token, ''));

    IF v_clean_ref = '' OR v_clean_token = '' THEN
        RAISE EXCEPTION 'Unauthorized: Valid management token required.';
    END IF;

    SELECT id, status, scheduled_start
    INTO v_booking_id, v_status, v_scheduled_start
    FROM public.bookings
    WHERE upper(reference_code) = v_clean_ref
      AND management_token = v_clean_token;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No matching booking found for the provided management credentials.';
    END IF;

    IF v_status = 'cancelled' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Booking is already cancelled.');
    END IF;

    IF v_scheduled_start - INTERVAL '3 hours' <= now() THEN
        RAISE EXCEPTION 'Cancellations must be made at least 3 hours before the scheduled lesson time.';
    END IF;

    UPDATE public.bookings
    SET status = 'cancelled',
        cancellation_reason = p_reason,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_booking_id;

    -- Clean up pending reminders
    UPDATE public.reminders
    SET status = 'cancelled',
        updated_at = timezone('utc'::text, now())
    WHERE booking_id = v_booking_id AND status = 'pending';

    RETURN jsonb_build_object('success', true, 'message', 'Booking successfully cancelled.');
END;
$$;

CREATE OR REPLACE FUNCTION public.reschedule_booking_by_management(
    p_reference_code TEXT,
    p_management_token TEXT,
    p_new_start TIMESTAMPTZ,
    p_new_end TIMESTAMPTZ,
    p_cairo_time_display TEXT
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

    IF v_clean_ref = '' OR v_clean_token = '' THEN
        RAISE EXCEPTION 'Unauthorized: Valid management token required.';
    END IF;

    SELECT *
    INTO v_booking
    FROM public.bookings
    WHERE upper(reference_code) = v_clean_ref
      AND management_token = v_clean_token;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No matching booking found for the provided management credentials.';
    END IF;

    IF v_booking.status = 'cancelled' THEN
        RAISE EXCEPTION 'Cannot reschedule a cancelled booking. Please create a new booking.';
    END IF;

    IF v_booking.scheduled_start - INTERVAL '3 hours' <= now() THEN
        RAISE EXCEPTION 'Rescheduling must be done at least 3 hours before the current scheduled lesson time.';
    END IF;

    IF p_new_start <= now() THEN
        RAISE EXCEPTION 'New scheduled time must be in the future.';
    END IF;

    -- Strict duration match check
    IF p_new_end <> (p_new_start + (v_booking.duration_minutes || ' minutes')::INTERVAL) THEN
        RAISE EXCEPTION 'Scheduled end timestamp must match scheduled start plus exact original duration.';
    END IF;

    BEGIN
        UPDATE public.bookings
        SET scheduled_start = p_new_start,
            scheduled_end = p_new_end,
            cairo_time_display = COALESCE(p_cairo_time_display, cairo_time_display),
            status = CASE WHEN status = 'pending' THEN 'pending' ELSE 'rescheduled' END,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_booking.id;
    EXCEPTION
        WHEN exclusion_violation THEN
            RAISE EXCEPTION 'The new time slot is not available. Please select another time.';
    END;

    -- Reschedule reminders
    UPDATE public.reminders
    SET status = 'cancelled', updated_at = now()
    WHERE booking_id = v_booking.id AND status = 'pending';

    v_rem_24h := p_new_start - INTERVAL '24 hours';
    v_rem_1h := p_new_start - INTERVAL '1 hour';

    IF v_rem_24h > now() THEN
        INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for, status)
        VALUES (v_booking.id, '24h_before', v_rem_24h, 'pending')
        ON CONFLICT (booking_id, reminder_type) DO NOTHING;
    END IF;

    IF v_rem_1h > now() THEN
        INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for, status)
        VALUES (v_booking.id, '1h_before', v_rem_1h, 'pending')
        ON CONFLICT (booking_id, reminder_type) DO NOTHING;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Booking successfully rescheduled.');
END;
$$;


-- OVERRIDE check_trial_eligibility TO EXCLUDE CANCELLED
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
    v_clean_phone := regexp_replace(COALESCE(p_whatsapp, ''), '[^0-9+]', '', 'g');

    -- Check if non-cancelled trial exists for normalized email or phone
    SELECT COUNT(*)
    INTO v_count
    FROM public.bookings
    WHERE booking_type = 'trial'
      AND status IN ('pending', 'confirmed', 'rescheduled', 'completed')
      AND (
          lower(trim(contact_email)) = v_clean_email
          OR
          (v_clean_phone <> '' AND contact_whatsapp IS NOT NULL AND regexp_replace(contact_whatsapp, '[^0-9+]', '', 'g') = v_clean_phone)
      );

    -- Returns true if eligible (no active/completed trials found)
    RETURN v_count = 0;
END;
$$;
