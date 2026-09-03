import fs from 'fs';
let content = fs.readFileSync('src/booking/bookingService.ts', 'utf8');

content = content.replace(/timeDisplay: data\.timeSlot\.display,/, 'timeDisplay: data.timeSlot.timeDisplay,');

fs.writeFileSync('src/booking/bookingService.ts', content);
