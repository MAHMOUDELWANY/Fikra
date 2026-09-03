import fs from 'fs';
let content = fs.readFileSync('src/booking/bookingService.ts', 'utf8');

content = content.replace(/async submitBooking[\s\S]*?async lookupBooking/, `async submitBooking(data: BookingFormData): Promise<BookingConfirmationData> {
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
      timeDisplay: data.timeSlot.display,
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

  async lookupBooking`);

content = content.replace(/async rescheduleBooking[\s\S]*?async cancelBooking/, `async rescheduleBooking(
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

  async cancelBooking`);

fs.writeFileSync('src/booking/bookingService.ts', content);
