import { DateTime } from 'luxon';

/**
 * Timezone & Schedule Foundation for Mahmoud Teaching Platform
 * 
 * Master Spec Rules (Section 18 & 21):
 * - Students see and select times in their local IANA timezone.
 * - Mahmoud manages his teaching calendar in Cairo time (Africa/Cairo).
 * - All internal and database scheduling is stored in timezone-aware UTC ISO-8601.
 * - Daylight-saving transitions across US, UK, Canada, Australia, and Egypt
 *   must be computed accurately from the IANA timezone database.
 */

export interface CalculatedTimes {
  scheduledStartUtc: string;
  scheduledEndUtc: string;
  cairoTimeDisplay: string;
  localTimeDisplay: string;
}

export interface PolicyCheckResult {
  eligible: boolean;
  hoursRemaining: number;
  explanation: string;
}

/**
 * Interprets a student's chosen local date (YYYY-MM-DD) and local time (HH:MM)
 * within their specific IANA timezone, and converts it to absolute UTC timestamps.
 * 
 * Never constructs naive UTC dates like Date.UTC(year, month, day, hours, minutes).
 */
export function calculateUtcTimes(
  dateStr: string,
  time24Str: string,
  timezone: string,
  durationMinutes: number
): CalculatedTimes {
  if (!dateStr || !time24Str) {
    throw new Error('Date and time are required for scheduling.');
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = time24Str.split(':').map(Number);

  if (!year || !month || !day || isNaN(hour) || isNaN(minute)) {
    throw new Error(`Invalid date or time format: ${dateStr} ${time24Str}`);
  }

  // Validate or fallback timezone safely
  const effectiveZone = timezone && DateTime.now().setZone(timezone).isValid
    ? timezone
    : 'America/New_York';

  // Construct local DateTime strictly inside the student's IANA timezone
  const localDateTime = DateTime.fromObject(
    { year, month, day, hour, minute, second: 0, millisecond: 0 },
    { zone: effectiveZone }
  );

  if (!localDateTime.isValid) {
    throw new Error(`Invalid local date/time: ${localDateTime.invalidExplanation || 'Unknown error'}`);
  }

  // Convert to absolute UTC
  const startUtc = localDateTime.toUTC();
  const endUtc = startUtc.plus({ minutes: durationMinutes });

  // Calculate equivalent Cairo time (Africa/Cairo) for Mahmoud's teaching schedule
  const cairoDateTime = localDateTime.setZone('Africa/Cairo');
  const cairoTimeDisplay = cairoDateTime.toFormat('hh:mm a') + ' Cairo';
  const localTimeDisplay = localDateTime.toFormat('hh:mm a');

  return {
    scheduledStartUtc: startUtc.toISO()!,
    scheduledEndUtc: endUtc.toISO()!,
    cairoTimeDisplay,
    localTimeDisplay,
  };
}

/**
 * Computes the Cairo equivalent time for a given local time slot.
 */
export function calculateCairoEquivalent(
  dateStr: string,
  time24Str: string,
  timezone: string
): string {
  try {
    const times = calculateUtcTimes(dateStr, time24Str, timezone, 30);
    return times.cairoTimeDisplay;
  } catch {
    return 'Cairo Time';
  }
}

/**
 * Evaluates the 3-Hour Cancellation and Rescheduling Policy (Master Spec Section 21)
 * accurately against current UTC time.
 */
export function check3HourPolicyEligibility(scheduledIsoString: string): PolicyCheckResult {
  const scheduledTime = DateTime.fromISO(scheduledIsoString, { zone: 'utc' });
  if (!scheduledTime.isValid) {
    return {
      eligible: false,
      hoursRemaining: 0,
      explanation: 'Invalid lesson schedule date.',
    };
  }

  const now = DateTime.now().toUTC();
  const diffHours = scheduledTime.diff(now, 'hours').hours;
  const roundedHours = Math.round(diffHours * 10) / 10;

  if (roundedHours >= 3.0) {
    return {
      eligible: true,
      hoursRemaining: roundedHours,
      explanation: `Your session is scheduled in ${roundedHours} hours. You are within the window for self-service cancellation or rescheduling.`,
    };
  } else if (roundedHours > 0) {
    return {
      eligible: false,
      hoursRemaining: roundedHours,
      explanation: `Only ${roundedHours} hours remain before your session (less than the 3-hour self-service window). Please contact Mahmoud directly on WhatsApp so he can assist you personally.`,
    };
  } else {
    return {
      eligible: false,
      hoursRemaining: 0,
      explanation: 'This lesson time has already passed.',
    };
  }
}

/**
 * Formats a UTC ISO timestamp into a human-readable local time string.
 */
export function formatToLocal(
  isoString: string,
  timezone: string,
  format = 'yyyy-MM-dd hh:mm a'
): string {
  const dt = DateTime.fromISO(isoString, { zone: 'utc' }).setZone(timezone);
  return dt.isValid ? dt.toFormat(format) : isoString;
}
