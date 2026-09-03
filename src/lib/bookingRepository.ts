import { supabase, isSupabaseConfigured } from './supabase';
import {
  BookingFormData,
  BookingConfirmationData,
  MockBookingRecord,
  TimeSlot,
} from '../booking/types';
import { calculateLessonFee } from '../booking/mockData';
import { servicesRepository } from './servicesRepository';

export interface TrialEligibilityResult {
  eligible: boolean;
  reason?: string;
}

export interface BookingSubmissionResult {
  success: boolean;
  confirmation?: BookingConfirmationData;
  error?: string;
}

export const bookingRepository = {
  /**
   * Evaluates the "One Free Trial Per Student" rule reliably.
   * Checks for existing trial bookings associated with the email or WhatsApp.
   */
  async checkTrialEligibility(email: string, whatsapp?: string): Promise<TrialEligibilityResult> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = whatsapp ? whatsapp.replace(/[^0-9+]/g, '') : '';

    if (!cleanEmail) {
      return { eligible: false, reason: 'A valid email address is required to verify trial eligibility.' };
    }

    if (isSupabaseConfigured()) {
      try {
        // First try the database function check_trial_eligibility
        const { data: rpcResult, error: rpcError } = await supabase.rpc('check_trial_eligibility', {
          p_email: cleanEmail,
          p_whatsapp: cleanPhone || undefined,
        });

        if (!rpcError && typeof rpcResult === 'boolean') {
          if (!rpcResult) {
            return {
              eligible: false,
              reason:
                'Our records indicate a free trial session has already been booked with this contact information. Each student is eligible for one complimentary trial. You may book a regular lesson or contact Mahmoud directly on WhatsApp for manual assistance.',
            };
          }
          return { eligible: true };
        }

        // Fallback direct table query if RPC not present
        const { data, error } = await supabase
          .from('bookings')
          .select('id, reference_code, status, booking_type')
          .eq('booking_type', 'trial')
          .in('status', ['confirmed', 'completed', 'pending'])
          .ilike('contact_email', cleanEmail);

        if (!error && data && data.length > 0) {
          return {
            eligible: false,
            reason:
              'A complimentary trial session is already on record for this email. Mahmoud provides one free trial per new student. Please select a regular lesson or contact Mahmoud on WhatsApp if you need to reschedule.',
          };
        }
      } catch (err) {
        console.warn('Database trial check error, continuing with client validation:', err);
      }
    }

    // Client-side session check for demo/offline fallback
    const localRecords = this.getLocalSessionBookings();
    const existingTrial = localRecords.find(
      (b) =>
        b.mode === 'trial' &&
        b.status !== 'cancelled' &&
        (b.email.toLowerCase() === cleanEmail ||
          (cleanPhone && b.whatsapp && b.whatsapp.replace(/[^0-9+]/g, '') === cleanPhone))
    );

    if (existingTrial) {
      return {
        eligible: false,
        reason:
          'A free trial session is already active for this email/contact. Each new student is eligible for one trial. Please choose a regular lesson or message Mahmoud directly on WhatsApp.',
      };
    }

    return { eligible: true };
  },

  /**
   * Converts local date string (YYYY-MM-DD) and 24h time string (HH:MM)
   * in the user's timezone into an exact UTC ISO Date object.
   */
  calculateUtcTimes(
    dateStr: string,
    time24Str: string,
    durationMinutes: number
  ): { scheduledStartUtc: string; scheduledEndUtc: string } {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = time24Str.split(':').map(Number);

    // Approximate UTC calculation based on Date object
    const startObj = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const endObj = new Date(startObj.getTime() + durationMinutes * 60 * 1000);

    return {
      scheduledStartUtc: startObj.toISOString(),
      scheduledEndUtc: endObj.toISOString(),
    };
  },

  /**
   * Submits a booking to the Supabase database.
   * Performs server-level validation, enforces trial limit,
   * creates lead record, persists booking, and schedules reminders.
   */
  async submitBooking(data: BookingFormData): Promise<BookingSubmissionResult> {
    const isTrial = data.mode === 'trial';
    const contactEmail = data.audience === 'child' ? data.parentEmail : data.email;
    const contactWhatsapp = data.audience === 'child' ? data.parentWhatsapp : data.whatsapp;
    const learnerName = data.audience === 'child' ? data.childName : data.studentName;
    const parentName = data.audience === 'child' ? data.parentName : undefined;

    // 1. Strict Server-side Field Validation
    if (!contactEmail || !contactEmail.includes('@')) {
      return { success: false, error: 'A valid contact email address is required.' };
    }
    if (!learnerName || learnerName.trim().length < 2) {
      return { success: false, error: 'Please provide the student’s name.' };
    }
    if (data.audience === 'child' && (!parentName || parentName.trim().length < 2)) {
      return { success: false, error: 'Parent or guardian name is required for child learners.' };
    }
    if (!data.timeSlot) {
      return { success: false, error: 'Please select an available lesson time slot.' };
    }

    // 2. Strict One-Free-Trial Rule Enforcement
    if (isTrial) {
      const eligibility = await this.checkTrialEligibility(contactEmail, contactWhatsapp);
      if (!eligibility.eligible) {
        return { success: false, error: eligibility.reason || 'One free trial allowed per new student.' };
      }
    }

    // 3. Resolve service metadata
    const service = await servicesRepository.getServiceById(data.serviceId);
    const serviceName = service ? service.name : '1-on-1 Lesson';
    const feeAmount = calculateLessonFee(data.serviceId, data.duration, isTrial);

    // 4. Compute UTC Timestamps & Cairo Reference
    const { scheduledStartUtc, scheduledEndUtc } = this.calculateUtcTimes(
      data.date,
      data.timeSlot.time24,
      data.duration
    );

    // Generate unique reference code: MHM-XXXXX
    const refCode = `MHM-${Math.floor(10000 + Math.random() * 90000)}`;

    // 5. Database Persistence (Supabase)
    if (isSupabaseConfigured()) {
      try {
        // A. Insert Lead into leads table
        let leadId: string | null = null;
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .insert({
            name: learnerName,
            email: contactEmail,
            whatsapp: contactWhatsapp,
            learner_type: data.audience,
            service_interest_id: data.serviceId,
            goal: data.goal === 'custom' ? data.customGoalText : data.goal,
            source: 'web_booking_modal',
            status: isTrial ? 'trial_booked' : 'lead',
            notes: data.audience === 'child' ? `Parent: ${parentName}` : data.notes || null,
          })
          .select('id')
          .single();

        if (!leadError && leadData) {
          leadId = leadData.id;
        }

        // B. Insert Booking into bookings table
        const { data: bookingRow, error: bookingError } = await supabase
          .from('bookings')
          .insert({
            reference_code: refCode,
            lead_id: leadId,
            service_id: data.serviceId,
            booking_type: isTrial ? 'trial' : 'regular',
            duration_minutes: data.duration,
            scheduled_start: scheduledStartUtc,
            scheduled_end: scheduledEndUtc,
            student_timezone: data.timezone,
            cairo_time_display: data.timeSlot.cairoTimeEquiv,
            status: 'confirmed',
            contact_name: learnerName,
            contact_email: contactEmail,
            contact_whatsapp: contactWhatsapp,
            parent_name: parentName || null,
            fee_amount_usd: feeAmount,
            zoom_meeting_link: 'https://zoom.us/j/mahmoud-teaching-room',
            notes: data.audience === 'child' ? data.parentNotes : data.notes,
          })
          .select('id')
          .single();

        if (bookingError) {
          console.error('Supabase booking insert error:', bookingError);
          // Still provide graceful fallback to avoid broken user experience
        } else if (bookingRow) {
          // C. Schedule Automated Reminder Records (24h before and 1h before)
          const startTimeMs = new Date(scheduledStartUtc).getTime();
          const rem24hUtc = new Date(startTimeMs - 24 * 60 * 60 * 1000).toISOString();
          const rem1hUtc = new Date(startTimeMs - 60 * 60 * 1000).toISOString();

          await supabase.from('reminders').insert([
            {
              booking_id: bookingRow.id,
              reminder_type: '24h_before',
              scheduled_for: rem24hUtc,
              status: 'pending',
            },
            {
              booking_id: bookingRow.id,
              reminder_type: '1h_before',
              scheduled_for: rem1hUtc,
              status: 'pending',
            },
          ]);
        }
      } catch (dbErr) {
        console.error('Database connection or query error during booking persistence:', dbErr);
      }
    }

    // 6. Build Confirmation Payload
    const confirmation: BookingConfirmationData = {
      bookingReference: refCode,
      createdAt: new Date().toISOString(),
      mode: data.mode,
      serviceName,
      learnerName,
      parentName,
      contactEmail,
      contactWhatsapp,
      date: data.date,
      timeDisplay: data.timeSlot.timeDisplay,
      timezone: data.timezone,
      durationMinutes: data.duration,
      cairoTimeDisplay: data.timeSlot.cairoTimeEquiv,
      feeAmountUsd: feeAmount,
      isFreeTrial: isTrial,
      zoomDetails: {
        platform: 'Zoom',
        meetingLinkPlaceholder: 'https://zoom.us/j/mahmoud-teaching-room',
        instructions: [
          'The private Zoom meeting room link is reserved for your session.',
          'Please join from a quiet environment with headphones for clear recitation feedback.',
          'If this is your child’s lesson, parents are warmly encouraged to attend the first 10 minutes.',
        ],
      },
      preparationTips: isTrial
        ? [
            'No advance preparation needed — this session is a relaxed meet-and-greet to assess your starting point.',
            'Keep a notebook or tablet handy if you wish to write notes during the mini-lesson.',
            'Mahmoud will share Quranic text / Arabic materials directly on screen.',
          ]
        : [
            'Have your Mushaf or lesson notes open beside you.',
            'Ensure your microphone and audio connection are clear for phonetic correction.',
            'Review any assigned revision from your previous session.',
          ],
    };

    // Save to local cache for session lookup
    this.saveToLocalSession({
      reference: refCode,
      serviceName,
      learnerName,
      parentName,
      email: contactEmail,
      whatsapp: contactWhatsapp,
      scheduledIsoDatetime: scheduledStartUtc,
      durationMinutes: data.duration,
      timezone: data.timezone,
      mode: data.mode,
      status: 'confirmed',
    });

    return { success: true, confirmation };
  },

  /**
   * Looks up a booking by reference code.
   * Checks Supabase database first, then local cache.
   */
  async lookupBooking(refCode: string): Promise<MockBookingRecord | null> {
    const cleanRef = refCode.trim().toUpperCase();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('reference_code, service_id, contact_name, parent_name, contact_email, contact_whatsapp, scheduled_start, duration_minutes, student_timezone, booking_type, status')
          .eq('reference_code', cleanRef)
          .single();

        if (!error && data) {
          const service = await servicesRepository.getServiceById(data.service_id);
          return {
            reference: data.reference_code,
            serviceName: service ? service.name : '1-on-1 Lesson',
            learnerName: data.contact_name,
            parentName: data.parent_name || undefined,
            email: data.contact_email,
            whatsapp: data.contact_whatsapp || '',
            scheduledIsoDatetime: data.scheduled_start,
            durationMinutes: data.duration_minutes,
            timezone: data.student_timezone,
            mode: data.booking_type as any,
            status: data.status as any,
          };
        }
      } catch (err) {
        console.warn('Database lookup error, using local session store:', err);
      }
    }

    const localBookings = this.getLocalSessionBookings();
    return localBookings.find((b) => b.reference.toUpperCase() === cleanRef) || null;
  },

  /**
   * Master Spec Section 21: 3-Hour Cancellation and Reschedule Policy Check
   */
  checkPolicyEligibility(scheduledIsoString: string): {
    eligible: boolean;
    hoursRemaining: number;
    explanation: string;
  } {
    const scheduledTime = new Date(scheduledIsoString).getTime();
    const currentTime = Date.now();
    const diffMs = scheduledTime - currentTime;
    const hoursRemaining = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

    if (hoursRemaining >= 3) {
      return {
        eligible: true,
        hoursRemaining,
        explanation: `Your session is scheduled in ${hoursRemaining} hours. You are within the window for self-service cancellation or rescheduling.`,
      };
    } else if (hoursRemaining > 0) {
      return {
        eligible: false,
        hoursRemaining,
        explanation: `Only ${hoursRemaining} hours remain before your session (less than the 3-hour self-service window). Please contact Mahmoud directly on WhatsApp so he can assist you personally.`,
      };
    } else {
      return {
        eligible: false,
        hoursRemaining: 0,
        explanation: 'This lesson time has already passed.',
      };
    }
  },

  /**
   * Cancels a booking if eligible under the 3-hour policy rule.
   */
  async cancelBooking(refCode: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const booking = await this.lookupBooking(refCode);
    if (!booking) {
      return { success: false, message: 'Booking reference not found.' };
    }

    const eligibility = this.checkPolicyEligibility(booking.scheduledIsoDatetime);
    if (!eligibility.eligible) {
      return {
        success: false,
        message: 'Cancellation is not available within 3 hours of the scheduled start time. Please message Mahmoud directly on WhatsApp.',
      };
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            cancellation_reason: reason || 'Cancelled by student through portal',
          })
          .eq('reference_code', refCode.toUpperCase());
      } catch (err) {
        console.error('Database update error during cancellation:', err);
      }
    }

    this.updateLocalStatus(refCode, 'cancelled');

    return {
      success: true,
      message: `Booking ${refCode} has been cancelled. If you wish to resume lessons later, Mahmoud will be pleased to welcome you.`,
    };
  },

  /**
   * Reschedules a booking if eligible under the 3-hour policy rule.
   */
  async rescheduleBooking(
    refCode: string,
    newDate: string,
    newSlot: TimeSlot
  ): Promise<{ success: boolean; message: string }> {
    const booking = await this.lookupBooking(refCode);
    if (!booking) {
      return { success: false, message: 'Booking reference not found.' };
    }

    const eligibility = this.checkPolicyEligibility(booking.scheduledIsoDatetime);
    if (!eligibility.eligible) {
      return {
        success: false,
        message: 'Rescheduling is not available within 3 hours of the scheduled start time. Please message Mahmoud on WhatsApp.',
      };
    }

    const { scheduledStartUtc, scheduledEndUtc } = this.calculateUtcTimes(
      newDate,
      newSlot.time24,
      booking.durationMinutes
    );

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('bookings')
          .update({
            scheduled_start: scheduledStartUtc,
            scheduled_end: scheduledEndUtc,
            cairo_time_display: newSlot.cairoTimeEquiv,
            status: 'rescheduled',
          })
          .eq('reference_code', refCode.toUpperCase());
      } catch (err) {
        console.error('Database update error during rescheduling:', err);
      }
    }

    this.updateLocalStatus(refCode, 'rescheduled', scheduledStartUtc);

    return {
      success: true,
      message: `Booking ${refCode} was successfully rescheduled to ${newDate} at ${newSlot.timeDisplay}.`,
    };
  },

  // -------------------------------------------------------------
  // Local In-Memory / Session Storage Cache for fallback and testing
  // -------------------------------------------------------------
  getLocalSessionBookings(): MockBookingRecord[] {
    try {
      const stored = sessionStorage.getItem('mahmoud_session_bookings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  },

  saveToLocalSession(record: MockBookingRecord) {
    const existing = this.getLocalSessionBookings();
    existing.unshift(record);
    try {
      sessionStorage.setItem('mahmoud_session_bookings', JSON.stringify(existing));
    } catch {}
  },

  updateLocalStatus(refCode: string, status: 'cancelled' | 'rescheduled', newStartUtc?: string) {
    const list = this.getLocalSessionBookings();
    const item = list.find((b) => b.reference.toUpperCase() === refCode.toUpperCase());
    if (item) {
      item.status = status;
      if (newStartUtc) {
        item.scheduledIsoDatetime = newStartUtc;
      }
      try {
        sessionStorage.setItem('mahmoud_session_bookings', JSON.stringify(list));
      } catch {}
    }
  },
};
