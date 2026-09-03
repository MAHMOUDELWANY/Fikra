import { supabase, isSupabaseConfigured } from './supabase';
import {
  BookingFormData,
  BookingConfirmationData,
  MockBookingRecord,
  TimeSlot,
} from '../booking/types';
import { calculateLessonFee } from '../booking/mockData';
import { servicesRepository } from './servicesRepository';
import {
  calculateUtcTimes,
  check3HourPolicyEligibility,
} from './timezone';

const isProduction = Boolean((import.meta as any).env?.PROD);

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
        // 1. Try the database function check_trial_eligibility (Server-side Source of Truth)
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

        // 2. Direct query fallback if RPC is unavailable
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
        console.warn('Database trial check error:', err);
      }
    }

    // Client-side session check for offline or demo fallback
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
   * in the user's timezone into exact UTC ISO Date strings.
   * Grounded in luxon for accurate IANA daylight-saving transitions.
   */
  calculateUtcTimes(
    dateStr: string,
    time24Str: string,
    timezone: string,
    durationMinutes: number
  ): { scheduledStartUtc: string; scheduledEndUtc: string; cairoTimeDisplay: string } {
    return calculateUtcTimes(dateStr, time24Str, timezone, durationMinutes);
  },

  /**
   * Submits a booking to the Supabase database.
   * Enforces:
   * - No database success = no booking success (eliminates false-success bugs).
   * - One free trial per student check.
   * - Accurate timezone conversion via luxon.
   * - Double booking prevention.
   * - Persistence of lead, booking, and reminder records.
   */
  async submitBooking(data: BookingFormData): Promise<BookingSubmissionResult> {
    const isTrial = data.mode === 'trial';
    const contactEmail = (data.audience === 'child' ? data.parentEmail || '' : data.email || '').trim().toLowerCase();
    const contactWhatsapp = (data.audience === 'child' ? data.parentWhatsapp || '' : data.whatsapp || '').trim();
    const learnerName = (data.audience === 'child' ? data.childName || '' : data.studentName || '').trim();
    const parentName = data.audience === 'child' ? (data.parentName || '').trim() : undefined;

    // 1. Strict Server-side Field Validation
    if (!contactEmail || !contactEmail.includes('@')) {
      return { success: false, error: 'A valid contact email address is required.' };
    }
    if (!learnerName || learnerName.length < 2) {
      return { success: false, error: 'Please provide the student’s name.' };
    }
    if (data.audience === 'child' && (!parentName || parentName.length < 2)) {
      return { success: false, error: 'Parent or guardian name is required for child learners.' };
    }
    if (!data.timeSlot) {
      return { success: false, error: 'Please select an available lesson time slot.' };
    }

    // 2. Strict One-Free-Trial Rule Enforcement (Master Spec Section 10)
    if (isTrial) {
      const eligibility = await this.checkTrialEligibility(contactEmail, contactWhatsapp);
      if (!eligibility.eligible) {
        return { success: false, error: eligibility.reason || 'One free trial allowed per new student.' };
      }
    }

    // 3. Resolve service metadata & pricing
    const service = await servicesRepository.getServiceById(data.serviceId);
    const serviceName = service ? service.name : '1-on-1 Lesson';
    const feeAmount = calculateLessonFee(data.serviceId, data.duration, isTrial);

    // 4. Compute Accurate UTC Timestamps & Cairo Reference via Luxon
    let scheduledStartUtc: string;
    let scheduledEndUtc: string;
    let cairoTimeDisplay: string;

    try {
      const times = calculateUtcTimes(
        data.date,
        data.timeSlot.time24,
        data.timezone,
        data.duration
      );
      scheduledStartUtc = times.scheduledStartUtc;
      scheduledEndUtc = times.scheduledEndUtc;
      cairoTimeDisplay = times.cairoTimeDisplay;
    } catch (tzErr: any) {
      return {
        success: false,
        error: `Invalid date or time scheduling: ${tzErr?.message || 'Please verify selected slot.'}`,
      };
    }

    // Generate unique reference code: MHM-XXXXX
    let refCode = `MHM-${Math.floor(10000 + Math.random() * 90000)}`;
    let managementToken: string | undefined = undefined;

    // 5. Database Persistence (Supabase)
    if (isSupabaseConfigured()) {
      try {
        // Method A: Atomic Database RPC (Preferred)
        const { data: atomicResult, error: atomicError } = await supabase.rpc('create_booking_atomic', {
          p_booking: {
            contact_name: learnerName,
            contact_email: contactEmail,
            contact_whatsapp: contactWhatsapp,
            parent_name: parentName || null,
            audience: data.audience,
            service_id: data.serviceId,
            booking_type: isTrial ? 'trial' : 'regular',
            duration_minutes: data.duration,
            scheduled_start: scheduledStartUtc,
            scheduled_end: scheduledEndUtc,
            student_timezone: data.timezone,
            cairo_time_display: cairoTimeDisplay,
            goal: data.goal === 'custom' ? data.customGoalText : data.goal,
            notes: data.audience === 'child' ? data.parentNotes : data.notes,
            reference_code: refCode,
          },
        });

        if (atomicError) {
          // If RPC returned a business exception (e.g. slot taken, trial limit reached, invalid input)
          if (atomicError.message && !atomicError.message.includes('function public.create_booking_atomic') && !atomicError.code?.includes('42883')) {
            return {
              success: false,
              error: atomicError.message,
            };
          }

          // Method B: Direct Database Write Fallback (if migration not yet run in this Supabase instance)
          console.warn('Atomic RPC unavailable, executing verified table transaction:', atomicError.message);

          // Check slot conflict first
          const { data: conflicts, error: conflictErr } = await supabase
            .from('bookings')
            .select('id')
            .in('status', ['confirmed', 'pending'])
            .lte('scheduled_start', scheduledEndUtc)
            .gte('scheduled_end', scheduledStartUtc);

          if (!conflictErr && conflicts && conflicts.length > 0) {
            return {
              success: false,
              error: 'The selected time slot is no longer available. Please select another time.',
            };
          }

          // Insert Lead
          let leadId: string | null = null;
          const { data: leadData } = await supabase
            .from('leads')
            .upsert(
              {
                name: learnerName,
                email: contactEmail,
                whatsapp: contactWhatsapp || null,
                learner_type: data.audience,
                service_interest_id: data.serviceId,
                goal: data.goal === 'custom' ? data.customGoalText : data.goal,
                source: 'web_booking_modal',
                status: isTrial ? 'trial_booked' : 'lead',
                notes: data.audience === 'child' ? `Parent: ${parentName}` : data.notes || null,
              },
              { onConflict: 'email' }
            )
            .select('id')
            .single();

          if (leadData) {
            leadId = leadData.id;
          }

          // Insert Booking
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
              cairo_time_display: cairoTimeDisplay,
              status: 'confirmed',
              contact_name: learnerName,
              contact_email: contactEmail,
              contact_whatsapp: contactWhatsapp,
              parent_name: parentName || null,
              fee_amount_usd: feeAmount,
              zoom_meeting_link: 'https://zoom.us/j/mahmoud-teaching-room',
              notes: data.audience === 'child' ? data.parentNotes : data.notes,
            })
            .select('id, reference_code')
            .single();

          if (bookingError) {
            console.error('Supabase booking insert error:', bookingError);
            return {
              success: false,
              error: `Unable to confirm your booking at this time: ${bookingError.message || 'Database error'}. Please try again or contact Mahmoud on WhatsApp.`,
            };
          }

          if (bookingRow?.reference_code) {
            refCode = bookingRow.reference_code;
          }

          // Insert Reminders (non-blocking)
          if (bookingRow?.id) {
            const startTimeMs = new Date(scheduledStartUtc).getTime();
            const rem24hUtc = new Date(startTimeMs - 24 * 60 * 60 * 1000).toISOString();
            const rem1hUtc = new Date(startTimeMs - 60 * 60 * 1000).toISOString();

            try {
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
            } catch (remErr) {
              console.warn('Could not schedule reminders:', remErr);
            }
          }
        } else if (atomicResult) {
          if ((atomicResult as any).referenceCode) {
            refCode = (atomicResult as any).referenceCode;
          }
          if ((atomicResult as any).managementToken) {
            managementToken = (atomicResult as any).managementToken;
          }
        }
      } catch (dbErr: any) {
        console.error('Database failure during booking persistence:', dbErr);
        return {
          success: false,
          error: `A server connection error occurred while recording your booking: ${dbErr?.message || 'Database connection error'}. Please try again.`,
        };
      }
    } else {
      // Supabase NOT configured
      if (isProduction) {
        return {
          success: false,
          error: 'The booking database is currently unavailable in this production environment. Please contact Mahmoud directly on WhatsApp to arrange your lesson.',
        };
      }
      console.warn('[Development] Booking stored in local preview session (Supabase not configured in development).');
    }

    // 6. Build Confirmation Payload
    const confirmation: BookingConfirmationData = {
      bookingReference: refCode,
      managementToken,
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
      cairoTimeDisplay,
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

    // Save to local cache for instant session lookup
    this.saveToLocalSession({
      reference: refCode,
      managementToken,
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
   * Securely queries via RPC or database, with local fallback for preview.
   */
  async lookupBooking(refCode: string, managementToken?: string): Promise<MockBookingRecord | null> {
    const cleanRef = refCode.trim().toUpperCase();
    if (!cleanRef) return null;
    const token = managementToken || this.getLocalManagementToken(cleanRef);

    if (isSupabaseConfigured()) {
      try {
        // 1. Try secure RPC
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_booking_by_reference', {
          p_reference_code: cleanRef,
          p_management_token: token || undefined,
        });

        if (!rpcError && rpcData) {
          const rec = rpcData as any;
          return {
            reference: rec.reference || cleanRef,
            managementToken: rec.managementToken || token,
            serviceName: rec.serviceName || '1-on-1 Lesson',
            learnerName: rec.learnerName,
            parentName: rec.parentName || undefined,
            email: rec.email,
            whatsapp: rec.whatsapp || '',
            scheduledIsoDatetime: rec.scheduledIsoDatetime,
            durationMinutes: rec.durationMinutes,
            timezone: rec.timezone,
            mode: rec.mode as any,
            status: rec.status as any,
          };
        }

        // 2. Direct query fallback
        const { data, error } = await supabase
          .from('bookings')
          .select('reference_code, service_id, contact_name, parent_name, contact_email, contact_whatsapp, scheduled_start, duration_minutes, student_timezone, booking_type, status')
          .eq('reference_code', cleanRef)
          .single();

        if (!error && data) {
          const service = await servicesRepository.getServiceById(data.service_id);
          return {
            reference: data.reference_code,
            managementToken: token,
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
        console.warn('Database lookup error:', err);
      }
    }

    const localBookings = this.getLocalSessionBookings();
    return localBookings.find((b) => b.reference.toUpperCase() === cleanRef) || null;
  },

  /**
   * Master Spec Section 21: 3-Hour Cancellation and Reschedule Policy Check
   */
  checkPolicyEligibility(scheduledIsoString: string) {
    return check3HourPolicyEligibility(scheduledIsoString);
  },

  /**
   * Cancels a booking if eligible under the 3-hour policy rule.
   * Enforced in both the database RPC and the client application.
   */
  async cancelBooking(refCode: string, reason?: string, managementToken?: string): Promise<{ success: boolean; message: string }> {
    const cleanRef = refCode.trim().toUpperCase();
    const token = managementToken || this.getLocalManagementToken(cleanRef);
    const booking = await this.lookupBooking(cleanRef, token);
    if (!booking) {
      return { success: false, message: 'Booking reference not found.' };
    }

    const eligibility = this.checkPolicyEligibility(booking.scheduledIsoDatetime);
    if (!eligibility.eligible) {
      return {
        success: false,
        message: eligibility.explanation,
      };
    }

    if (isSupabaseConfigured()) {
      try {
        let rpcError = null;
        if (token) {
          const res = await supabase.rpc('cancel_booking_by_management', {
            p_reference_code: cleanRef,
            p_management_token: token,
            p_reason: reason || 'Cancelled by student through portal',
          });
          rpcError = res.error;
        } else {
          const res = await supabase.rpc('cancel_booking_by_reference', {
            p_reference_code: cleanRef,
            p_reason: reason || 'Cancelled by student through portal',
          });
          rpcError = res.error;
        }

        if (rpcError) {
          // If RPC not available, direct update
          const { error: updateErr } = await supabase
            .from('bookings')
            .update({
              status: 'cancelled',
              cancellation_reason: reason || 'Cancelled by student through portal',
            })
            .eq('reference_code', cleanRef);

          if (updateErr) {
            return { success: false, message: `Cancellation failed: ${updateErr.message}` };
          }
        }
      } catch (err: any) {
        console.error('Database update error during cancellation:', err);
        return { success: false, message: `Cancellation failed: ${err?.message || 'Database error'}` };
      }
    }

    this.updateLocalStatus(cleanRef, 'cancelled');

    return {
      success: true,
      message: `Booking ${cleanRef} has been cancelled. If you wish to resume lessons later, Mahmoud will be pleased to welcome you.`,
    };
  },

  /**
   * Reschedules a booking if eligible under the 3-hour policy rule.
   * Enforces 3-hour rule, recalculates exact UTC times via luxon, and updates schedule.
   */
  async rescheduleBooking(
    refCode: string,
    newDate: string,
    newSlot: TimeSlot,
    managementToken?: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanRef = refCode.trim().toUpperCase();
    const token = managementToken || this.getLocalManagementToken(cleanRef);
    const booking = await this.lookupBooking(cleanRef, token);
    if (!booking) {
      return { success: false, message: 'Booking reference not found.' };
    }

    const eligibility = this.checkPolicyEligibility(booking.scheduledIsoDatetime);
    if (!eligibility.eligible) {
      return {
        success: false,
        message: eligibility.explanation,
      };
    }

    const { scheduledStartUtc, scheduledEndUtc, cairoTimeDisplay } = calculateUtcTimes(
      newDate,
      newSlot.time24,
      booking.timezone,
      booking.durationMinutes
    );

    if (isSupabaseConfigured()) {
      try {
        let rpcError = null;
        if (token) {
          const res = await supabase.rpc('reschedule_booking_by_management', {
            p_reference_code: cleanRef,
            p_management_token: token,
            p_new_start: scheduledStartUtc,
            p_new_end: scheduledEndUtc,
            p_cairo_time_display: cairoTimeDisplay,
          });
          rpcError = res.error;
        } else {
          const res = await supabase.rpc('reschedule_booking_by_reference', {
            p_reference_code: cleanRef,
            p_new_start: scheduledStartUtc,
            p_new_end: scheduledEndUtc,
            p_cairo_time_display: cairoTimeDisplay,
          });
          rpcError = res.error;
        }

        if (rpcError) {
          // Direct update fallback if RPC not installed
          const { error: updateErr } = await supabase
            .from('bookings')
            .update({
              scheduled_start: scheduledStartUtc,
              scheduled_end: scheduledEndUtc,
              cairo_time_display: cairoTimeDisplay,
              status: 'rescheduled',
            })
            .eq('reference_code', cleanRef);

          if (updateErr) {
            return { success: false, message: `Rescheduling failed: ${updateErr.message}` };
          }
        }
      } catch (err: any) {
        console.error('Database update error during rescheduling:', err);
        return { success: false, message: `Rescheduling failed: ${err?.message || 'Database error'}` };
      }
    }

    this.updateLocalStatus(cleanRef, 'rescheduled', scheduledStartUtc);

    return {
      success: true,
      message: `Booking ${cleanRef} was successfully rescheduled to ${newDate} at ${newSlot.timeDisplay}.`,
    };
  },

  // -------------------------------------------------------------
  // Local Session Storage Cache for demo fallback and instant display
  // -------------------------------------------------------------
  getLocalManagementToken(refCode: string): string | undefined {
    const list = this.getLocalSessionBookings();
    const item = list.find((b) => b.reference.toUpperCase() === refCode.toUpperCase());
    return item?.managementToken;
  },

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
