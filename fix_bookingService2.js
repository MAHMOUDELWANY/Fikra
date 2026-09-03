import fs from 'fs';
let content = fs.readFileSync('src/booking/bookingService.ts', 'utf8');

content = content.replace(/async cancelBooking[\s\S]*?async cancelBooking\(refCode, reason, managementToken\);/, `async cancelBooking(refCode: string, reason?: string, managementToken?: string): Promise<{ success: boolean; message: string }> {
    return bookingRepository.cancelBooking(refCode, managementToken || '', reason);`);

content = content.replace(/bookingRepository\.cancelBooking\(refCode, reason, managementToken\);/, `bookingRepository.cancelBooking(refCode, managementToken || '', reason);`);

fs.writeFileSync('src/booking/bookingService.ts', content);
