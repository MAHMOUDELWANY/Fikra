import fs from 'fs';
let content = fs.readFileSync('src/booking/bookingService.ts', 'utf8');

content = content.replace(/async lookupBooking[\s\S]*?checkPolicyEligibility/, `async lookupBooking(refCode: string, managementToken?: string): Promise<MockBookingRecord | null> {
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
  checkPolicyEligibility`);

fs.writeFileSync('src/booking/bookingService.ts', content);
