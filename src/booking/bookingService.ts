import {
  BookingFormData,
  BookingConfirmationData,
  DayAvailability,
  MockBookingRecord,
  TimeSlot
} from './types';
import {
  generateMockAvailability,
  getSampleExistingBookings
} from './mockData';
import { bookingRepository } from '../lib/bookingRepository';

/**
 * BookingService represents the clean architecture boundary.
 * In Phase 3: It connects directly to the Supabase data foundation and
 * enforces the strict One-Free-Trial limit and UTC timestamp storage.
 */

export const bookingService = {
  /**
   * Fetches available dates and times for a given timezone.
   */
  async getAvailability(timezone: string): Promise<DayAvailability[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return generateMockAvailability(new Date(), timezone);
  },

  /**
   * Submits a new booking (Free Trial or Regular 1-on-1).
   * Validates business rules, enforces one-free-trial rule,
   * and persists booking & lead records in Supabase.
   */
  async submitBooking(data: BookingFormData): Promise<BookingConfirmationData> {
    const result = await bookingRepository.submitBooking(data);
    if (!result.success) {
      throw new Error(result.error || 'Unable to complete your booking. Please try again.');
    }
    
    const details = result.bookingDetails;
    return {
      bookingReference: result.referenceCode!,
      managementToken: result.managementToken,
      createdAt: new Date().toISOString(),
      mode: details.mode,
      serviceName: details.serviceName,
      learnerName: details.learnerName || details.studentName,
      parentName: details.parentName,
      contactEmail: details.email,
      contactWhatsapp: details.whatsapp,
      date: data.date,
      timeDisplay: data.timeSlot.timeDisplay,
      timezone: data.timezone,
      durationMinutes: data.duration,
      cairoTimeDisplay: details.cairoTimeDisplay,
      feeAmountUsd: details.feeAmountUsd,
      isFreeTrial: details.mode === 'trial',
      zoomDetails: {
        platform: 'Zoom',
        meetingLinkPlaceholder: details.zoomMeetingLink || 'https://zoom.us/j/mahmoud-teaching-room',
        instructions: [
          'Please ensure your microphone and camera are working before joining.',
          'Try to join a few minutes early to settle in.',
          'Find a quiet, well-lit place if possible.'
        ]
      }
    } as BookingConfirmationData;
  },

  async lookupBooking(refCode: string, managementToken?: string): Promise<MockBookingRecord | null> {
    const data = await bookingRepository.lookupBooking(refCode, managementToken);
    if (!data) return null;
    return {
      ...data,
      learnerName: (data as any).learnerName || (data as any).studentName || 'Student',
      whatsapp: (data as any).whatsapp || 'hidden'
    } as MockBookingRecord;
  },

  /**
   * Checks whether a booking is eligible for self-service cancellation or rescheduling.
   * Business Rule from Master Spec Section 21 (3-hour rule).
   */
  checkPolicyEligibility(scheduledIsoString: string) {
    return bookingRepository.checkPolicyEligibility(scheduledIsoString);
  },

  /**
   * Reschedules an eligible booking.
   */
  async rescheduleBooking(
    refCode: string,
    newDate: string,
    newSlot: TimeSlot,
    managementToken?: string
  ): Promise<{ success: boolean; message: string }> {
    const booking = await this.lookupBooking(refCode, managementToken);
    if (!booking) {
      return { success: false, message: 'Booking not found or unauthorized.' };
    }
    return bookingRepository.rescheduleBooking(
      refCode,
      managementToken || '',
      newDate,
      newSlot.time24,
      booking.timezone,
      booking.durationMinutes
    );
  },

  async cancelBooking(refCode: string, reason?: string, managementToken?: string): Promise<{ success: boolean; message: string }> {
    return bookingRepository.cancelBooking(refCode, managementToken || '', reason);
  },

  /**
   * Returns sample bookings for interactive testing in the UI.
   */
  getTestBookings(): MockBookingRecord[] {
    const sessionItems = bookingRepository.mockBookingStore;
    return [...sessionItems, ...getSampleExistingBookings()];
  }
};

