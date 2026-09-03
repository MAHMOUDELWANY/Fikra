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
  referenceCode?: string;
  managementToken?: string;
  message?: string;
  bookingDetails?: any;
  error?: string;
}

export const bookingRepository = {
  mockBookingStore: [] as MockBookingRecord[],

  async checkTrialEligibility(email: string, whatsapp?: string): Promise<TrialEligibilityResult> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = whatsapp ? whatsapp.replace(/[^0-9+]/g, '') : '';

    if (!cleanEmail) {
      return { eligible: false, reason: 'A valid email address is required to verify trial eligibility.' };
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('check_trial_eligibility', {
          p_email: cleanEmail,
          p_whatsapp: cleanPhone || undefined,
        });

        if (!rpcError && typeof rpcResult === 'boolean') {
          if (!rpcResult) {
            return {
              eligible: false,
              reason: 'Our records indicate a free trial session has already been booked with this contact information. Each student is eligible for one complimentary trial. You may book a regular lesson or contact Mahmoud directly on WhatsApp for manual assistance.',
            };
          }
          return { eligible: true };
        }
      } catch (err) {
        console.warn('Supabase trial eligibility check failed, failing closed for safety.');
        return { eligible: false, reason: 'Unable to verify trial eligibility due to a server error. Please try again later.' };
      }
    }

    if (isProduction && !isSupabaseConfigured()) {
      return { eligible: false, reason: 'Service is currently unavailable. Please try again later.' };
    }

    return { eligible: true };
  },

  calculateUtcTimes(dateStr: string, time24Str: string, timezone: string, durationMinutes: number) {
    return calculateUtcTimes(dateStr, time24Str, timezone, durationMinutes);
  },

  async submitBooking(data: BookingFormData): Promise<BookingSubmissionResult> {
    const isTrial = data.mode === 'trial';
    const contactEmail = (data.audience === 'child' ? data.parentEmail || '' : data.email || '').trim().toLowerCase();
    const contactWhatsapp = (data.audience === 'child' ? data.parentWhatsapp || '' : data.whatsapp || '').trim();
    const learnerName = (data.audience === 'child' ? data.childName || '' : data.studentName || '').trim();
    const parentName = data.audience === 'child' ? (data.parentName || '').trim() : undefined;

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

    if (isTrial) {
      const eligibility = await this.checkTrialEligibility(contactEmail, contactWhatsapp);
      if (!eligibility.eligible) {
        return { success: false, error: eligibility.reason || 'One free trial allowed per new student.' };
      }
    }

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
      return { success: false, error: `Invalid date or time scheduling: ${tzErr?.message || 'Please verify selected slot.'}` };
    }

    if (isSupabaseConfigured()) {
      try {
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
          },
        });

        if (atomicError) {
          return { success: false, error: atomicError.message || 'Booking failed due to server error.' };
        }

        if (atomicResult) {
          const serviceName = atomicResult.serviceName || '1-on-1 Lesson';
          const bookingResult = {
            id: atomicResult.bookingId,
            reference: atomicResult.referenceCode,
            managementToken: atomicResult.managementToken,
            mode: isTrial ? 'trial' : 'regular',
            serviceName,
            studentName: learnerName,
            feeAmountUsd: atomicResult.feeAmountUsd,
            zoomMeetingLink: atomicResult.zoomMeetingLink || 'https://zoom.us/j/mahmoud-teaching-room',
            scheduledIsoDatetime: scheduledStartUtc,
            scheduledEndIsoDatetime: scheduledEndUtc,
            durationMinutes: data.duration,
            timezone: data.timezone,
            cairoTimeDisplay,
            status: 'confirmed',
            email: contactEmail,
            whatsapp: contactWhatsapp
          };
          return {
            success: true,
            referenceCode: atomicResult.referenceCode,
            managementToken: atomicResult.managementToken,
            message: 'Your booking has been successfully secured.',
            bookingDetails: bookingResult as any
          };
        }
      } catch (err: any) {
        console.error('Supabase atomic booking error:', err);
        return { success: false, error: 'Database service is currently unavailable. Please try again later or contact Mahmoud directly.' };
      }
    }

    if (isProduction && !isSupabaseConfigured()) {
      return { success: false, error: 'Database service is currently unavailable in production. Please try again later.' };
    }

    return { success: false, error: 'Cannot process booking locally.' };
  },

  checkPolicyEligibility(scheduledIsoDatetime: string) {
    return check3HourPolicyEligibility(scheduledIsoDatetime);
  },

  async lookupBooking(cleanRef: string, managementToken?: string) {
    if (isSupabaseConfigured()) {
      try {
        if (!managementToken) return null;
        
        const { data, error } = await supabase.rpc('get_booking_management', {
          p_reference_code: cleanRef,
          p_management_token: managementToken,
        });

        if (error || !data) return null;

        return {
          id: data.reference,
          reference: data.reference,
          managementToken: managementToken,
          mode: data.mode,
          serviceName: data.serviceName,
          studentName: data.learnerName,
          feeAmountUsd: data.feeAmountUsd,
          zoomMeetingLink: data.zoomMeetingLink,
          scheduledIsoDatetime: data.scheduledIsoDatetime,
          scheduledEndIsoDatetime: data.scheduledEndIsoDatetime,
          durationMinutes: data.durationMinutes,
          timezone: data.timezone,
          cairoTimeDisplay: data.cairoTimeDisplay,
          status: data.status,
          email: 'hidden',
        };
      } catch (err) {
        console.error('Database lookup failed:', err);
        return null;
      }
    }
    
    if (isProduction && !isSupabaseConfigured()) return null;
    return null;
  },

  async cancelBooking(cleanRef: string, token: string, reason?: string) {
    if (isSupabaseConfigured()) {
      try {
        if (!token) return { success: false, message: 'Unauthorized: Valid management token required.' };
        
        const { error: rpcError } = await supabase.rpc('cancel_booking_by_management', {
          p_reference_code: cleanRef,
          p_management_token: token,
          p_reason: reason || 'Cancelled by student through portal',
        });
        
        if (rpcError) return { success: false, message: `Cancellation failed: ${rpcError.message}` };
        
        return { success: true, message: `Booking ${cleanRef} has been cancelled.` };
      } catch (err: any) {
        return { success: false, message: `Cancellation failed: ${err?.message || 'Database error'}` };
      }
    }
    
    if (isProduction && !isSupabaseConfigured()) {
      return { success: false, message: 'Database service is currently unavailable in production. Please try again later.' };
    }
    return { success: false, message: 'Local cancel not supported.' };
  },

  async rescheduleBooking(cleanRef: string, token: string, newDate: string, newTime24: string, timezone: string, durationMinutes: number) {
    let scheduledStartUtc: string;
    let scheduledEndUtc: string;
    let cairoTimeDisplay: string;
    
    try {
      const times = calculateUtcTimes(newDate, newTime24, timezone, durationMinutes);
      scheduledStartUtc = times.scheduledStartUtc;
      scheduledEndUtc = times.scheduledEndUtc;
      cairoTimeDisplay = times.cairoTimeDisplay;
    } catch (e) {
      return { success: false, message: 'Invalid new date/time.' };
    }

    if (isSupabaseConfigured()) {
      try {
        if (!token) return { success: false, message: 'Unauthorized: Valid management token required.' };
        
        const { error: rpcError } = await supabase.rpc('reschedule_booking_by_management', {
          p_reference_code: cleanRef,
          p_management_token: token,
          p_new_start: scheduledStartUtc,
          p_new_end: scheduledEndUtc,
          p_cairo_time_display: cairoTimeDisplay,
        });

        if (rpcError) return { success: false, message: `Reschedule failed: ${rpcError.message}` };
        return { success: true, message: 'Booking successfully rescheduled.' };
      } catch (err: any) {
        return { success: false, message: `Reschedule failed: ${err?.message || 'Database error'}` };
      }
    }
    
    if (isProduction && !isSupabaseConfigured()) {
      return { success: false, message: 'Database service is currently unavailable in production. Please try again later.' };
    }
    return { success: false, message: 'Local reschedule not supported.' };
  }
};
