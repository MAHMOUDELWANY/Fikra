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
    return generateMockAvailability();
  },

  /**
   * Submits a new booking (Free Trial or Regular 1-on-1).
   * Validates business rules, enforces one-free-trial rule,
   * and persists booking & lead records in Supabase.
   */
  async submitBooking(data: BookingFormData): Promise<BookingConfirmationData> {
    const result = await bookingRepository.submitBooking(data);
    if (!result.success || !result.confirmation) {
      throw new Error(result.error || 'Unable to complete your booking. Please try again.');
    }
    return result.confirmation;
  },

  /**
   * Looks up a booking by reference code.
   */
  async lookupBooking(refCode: string): Promise<MockBookingRecord | null> {
    return bookingRepository.lookupBooking(refCode);
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
  async rescheduleBooking(refCode: string, newDate: string, newSlot: TimeSlot): Promise<{ success: boolean; message: string }> {
    return bookingRepository.rescheduleBooking(refCode, newDate, newSlot);
  },

  /**
   * Cancels an eligible booking.
   */
  async cancelBooking(refCode: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return bookingRepository.cancelBooking(refCode, reason);
  },

  /**
   * Returns sample bookings for interactive testing in the UI.
   */
  getTestBookings(): MockBookingRecord[] {
    const sessionItems = bookingRepository.getLocalSessionBookings();
    return [...sessionItems, ...getSampleExistingBookings()];
  }
};

