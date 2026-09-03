-- Enable pgcrypto for secure hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Add management_token_hash column to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS management_token_hash TEXT;

-- For existing records (since this is pre-production), hash the plaintext token
UPDATE public.bookings 
SET management_token_hash = crypt(management_token, gen_salt('bf'))
WHERE management_token IS NOT NULL AND management_token_hash IS NULL;

-- Keep management_token for a moment to prevent view breakage but nullify it to secure data
UPDATE public.bookings SET management_token = NULL WHERE management_token IS NOT NULL;

-- 1. Redefine create_booking_atomic
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
    v_management_token_hash TEXT;
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
    -- Normalize phone: keep only + and digits
    v_contact_whatsapp := regexp_replace(trim(COALESCE(p_booking->>'contact_whatsapp', '')), '[^0-9+]', '', 'g');
    v_parent_name := trim(COALESCE(p_booking->>'parent_name', ''));
    v_audience := COALESCE(p_booking->>'audience', 'adult');
    v_service_id := trim(COALESCE(p_booking->>'service_id', ''));
    v_booking_type := COALESCE(p_booking->>'booking_type', 'trial');
    v_duration := COALESCE((p_booking->>'duration_minutes')::INTEGER, 30);
    v_scheduled_start := (p_booking->>'scheduled_start')::TIMESTAMPTZ;
    v_scheduled_end := (p_booking->>'scheduled_end')::TIMESTAMPTZ;
    v_timezone := trim(COALESCE(p_booking->>'student_timezone', 'UTC'));
    -- Cairo display is derived server-side to prevent client spoofing
    v_cairo_time_display := to_char(v_scheduled_start AT TIME ZONE 'Africa/Cairo', 'DD Mon YYYY, HH12:MI AM');
    v_goal := trim(COALESCE(p_booking->>'goal', ''));
    v_notes := trim(COALESCE(p_booking->>'notes', ''));

    -- 1. Strict Server-Side Validation
    IF v_contact_name = '' OR length(v_contact_name) < 2 THEN
        RAISE EXCEPTION 'Student name is required.';
    END IF;
    IF v_contact_email = '' OR position('@' in v_contact_email) = 0 THEN
        RAISE EXCEPTION 'A valid contact email address is required.';
    END IF;
    -- Valid timezone check
    BEGIN
        PERFORM now() AT TIME ZONE v_timezone;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid timezone provided.';
    END;
    IF v_audience = 'child' AND (v_parent_name = '' OR length(v_parent_name) < 2) THEN
        RAISE EXCEPTION 'Parent or guardian name is required for child learners.';
    END IF;
    IF v_scheduled_start IS NULL OR v_scheduled_end IS NULL THEN
        RAISE EXCEPTION 'Invalid lesson schedule: start and end times must be valid UTC timestamps.';
    END IF;
    IF v_scheduled_start <= now() THEN
        RAISE EXCEPTION 'Scheduled lesson time must be in the future.';
    END IF;
    IF v_scheduled_end <> (v_scheduled_start + (v_duration || ' minutes')::INTERVAL) THEN
        RAISE EXCEPTION 'Scheduled end timestamp must match scheduled start plus exact duration.';
    END IF;

    -- 2. Strict Service & Authoritative Pricing Check
    SELECT * INTO v_service FROM public.services WHERE id = v_service_id;
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
        v_ref_code := 'MHM-' || upper(encode(gen_random_bytes(3), 'hex'));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.bookings WHERE reference_code = v_ref_code);
    END LOOP;

    v_management_token := encode(gen_random_bytes(24), 'hex');
    v_management_token_hash := crypt(v_management_token, gen_salt('bf'));

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
            reference_code, management_token_hash, lead_id, service_id, booking_type, duration_minutes,
            scheduled_start, scheduled_end, student_timezone, cairo_time_display,
            status, contact_name, contact_email, contact_whatsapp, parent_name,
            fee_amount_usd, zoom_meeting_link, notes
        ) VALUES (
            v_ref_code, v_management_token_hash, v_lead_id, v_service.id, v_booking_type, v_duration,
            v_scheduled_start, v_scheduled_end, v_timezone, v_cairo_time_display,
            'confirmed', v_contact_name, v_contact_email, NULLIF(v_contact_whatsapp, ''), NULLIF(v_parent_name, ''),
            v_calculated_fee, 'pending', v_notes
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
        ON CONFLICT (booking_id, reminder_type) WHERE status = 'pending' DO NOTHING;
    END IF;

    IF v_rem_1h > now() THEN
        INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for, status)
        VALUES (v_booking_id, '1h_before', v_rem_1h, 'pending')
        ON CONFLICT (booking_id, reminder_type) WHERE status = 'pending' DO NOTHING;
    END IF;

    -- Return confirmed booking payload including private management token ONLY ONCE
    RETURN jsonb_build_object(
        'success', true,
        'bookingId', v_booking_id,
        'referenceCode', v_ref_code,
        'managementToken', v_management_token,
        'serviceName', COALESCE(v_service.title, '1-on-1 Lesson'),
        'feeAmountUsd', v_calculated_fee,
        'zoomMeetingLink', 'pending'
    );
END;
$$;

-- Revoke unnecessary access from public
REVOKE EXECUTE ON FUNCTION public.create_booking_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_booking_atomic TO anon, authenticated;

-- 2. Redefine get_booking_management
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

    -- Lookup the record
    SELECT *
    INTO v_booking
    FROM public.bookings
    WHERE upper(reference_code) = v_clean_ref
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No matching booking found for the provided management credentials.';
    END IF;

    -- Secure authentication via hash comparison
    IF v_booking.management_token_hash IS NULL OR crypt(v_clean_token, v_booking.management_token_hash) <> v_booking.management_token_hash THEN
        RAISE EXCEPTION 'No matching booking found for the provided management credentials.';
    END IF;

    -- Lookup service title
    SELECT s.title, s.arabic_title
    INTO v_service
    FROM public.services s
    WHERE s.id = v_booking.service_id;

    RETURN jsonb_build_object(
        'reference', v_booking.reference_code,
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
        'zoomMeetingLink', COALESCE(NULLIF(v_booking.zoom_meeting_link, ''), 'pending')
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_booking_management FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booking_management TO anon, authenticated;

-- 3. Redefine get_booking_by_reference (same as above but does not return plaintext token anyway)
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

REVOKE EXECUTE ON FUNCTION public.get_booking_by_reference FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booking_by_reference TO anon, authenticated;

-- 4. Redefine cancel_booking_by_management
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
    v_booking RECORD;
BEGIN
    v_clean_ref := upper(trim(COALESCE(p_reference_code, '')));
    v_clean_token := trim(COALESCE(p_management_token, ''));

    IF v_clean_ref = '' OR v_clean_token = '' THEN
        RAISE EXCEPTION 'Unauthorized: Valid management token required.';
    END IF;

    SELECT id, status, scheduled_start, management_token_hash
    INTO v_booking
    FROM public.bookings
    WHERE upper(reference_code) = v_clean_ref;

    IF NOT FOUND OR v_booking.management_token_hash IS NULL OR crypt(v_clean_token, v_booking.management_token_hash) <> v_booking.management_token_hash THEN
        RAISE EXCEPTION 'No matching booking found for the provided management credentials.';
    END IF;

    IF v_booking.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Booking is already cancelled.');
    END IF;

    IF v_booking.scheduled_start - INTERVAL '3 hours' <= now() THEN
        RAISE EXCEPTION 'Cancellations must be made at least 3 hours before the scheduled lesson time.';
    END IF;

    UPDATE public.bookings
    SET status = 'cancelled',
        cancellation_reason = p_reason,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_booking.id;

    -- Clean up pending reminders
    UPDATE public.reminders
    SET status = 'cancelled',
        updated_at = timezone('utc'::text, now())
    WHERE booking_id = v_booking.id AND status = 'pending';

    RETURN jsonb_build_object('success', true, 'message', 'Booking successfully cancelled.');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cancel_booking_by_management FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_booking_by_management TO anon, authenticated;

-- 5. Redefine reschedule_booking_by_management
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
    WHERE upper(reference_code) = v_clean_ref;

    IF NOT FOUND OR v_booking.management_token_hash IS NULL OR crypt(v_clean_token, v_booking.management_token_hash) <> v_booking.management_token_hash THEN
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

    IF p_new_end <> (p_new_start + (v_booking.duration_minutes || ' minutes')::INTERVAL) THEN
        RAISE EXCEPTION 'Scheduled end timestamp must match scheduled start plus exact original duration.';
    END IF;

    BEGIN
        UPDATE public.bookings
        SET scheduled_start = p_new_start,
            scheduled_end = p_new_end,
            -- Re-derive cairo display server-side instead of trusting client
            cairo_time_display = COALESCE(to_char(p_new_start AT TIME ZONE 'Africa/Cairo', 'DD Mon YYYY, HH12:MI AM'), cairo_time_display),
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
        ON CONFLICT (booking_id, reminder_type) WHERE status = 'pending' DO NOTHING;
    END IF;

    IF v_rem_1h > now() THEN
        INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for, status)
        VALUES (v_booking.id, '1h_before', v_rem_1h, 'pending')
        ON CONFLICT (booking_id, reminder_type) WHERE status = 'pending' DO NOTHING;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Booking successfully rescheduled.');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reschedule_booking_by_management FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reschedule_booking_by_management TO anon, authenticated;

-- 6. Fix Trial Eligibility Normalization & Privileges
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
    v_clean_phone := regexp_replace(trim(COALESCE(p_whatsapp, '')), '[^0-9+]', '', 'g');

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

    RETURN v_count = 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_trial_eligibility FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_trial_eligibility TO anon, authenticated;

-- 7. Improved Lead Deduplication
-- Normalizing existing leads first
UPDATE public.leads
SET email = lower(trim(email)),
    whatsapp = NULLIF(regexp_replace(trim(COALESCE(whatsapp, '')), '[^0-9+]', '', 'g'), '');

-- We want to preserve the newest lead (or the one that has booked a trial) 
-- and delete older duplicates, but only if they are true duplicates.
-- By grouping by email, we can delete the older ones.
WITH RankedLeads AS (
    SELECT id, email,
           ROW_NUMBER() OVER (PARTITION BY lower(trim(email)) ORDER BY created_at DESC) as rnk
    FROM public.leads
),
SurvivingLeads AS (
    SELECT email, id as survivor_id
    FROM RankedLeads
    WHERE rnk = 1
)
-- Re-point bookings from older duplicate leads to the newest surviving lead
UPDATE public.bookings b
SET lead_id = s.survivor_id
FROM public.leads l
JOIN SurvivingLeads s ON lower(trim(l.email)) = lower(trim(s.email))
WHERE b.lead_id = l.id AND l.id != s.survivor_id;

-- Now safe to delete duplicates
WITH RankedLeads AS (
    SELECT id, email,
           ROW_NUMBER() OVER (PARTITION BY lower(trim(email)) ORDER BY created_at DESC) as rnk
    FROM public.leads
)
DELETE FROM public.leads
WHERE id IN (
    SELECT id FROM RankedLeads WHERE rnk > 1
);

-- Note: The unique index on lower(email) was already created in phase1_6, 
-- but ensuring data integrity here is safe.
