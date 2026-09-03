import { BookingFormData } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateStep(step: number, data: BookingFormData, isArabic = false): ValidationResult {
  const errors: Record<string, string> = {};

  switch (step) {
    case 1: // Service Selection
      if (!data.serviceId) {
        errors.serviceId = isArabic
          ? 'يرجى اختيار المادة التي ترغب في دراستها أولاً.'
          : 'Please select what you would like to study with Mahmoud.';
      }
      break;

    case 2: // Goal Selection
      if (!data.goal && !data.customGoalText.trim()) {
        errors.goal = isArabic
          ? 'اختر هدفاً مقترحاً أو اكتب باختصار ما تأمل تحقيقه لتخصيص الجلسة.'
          : 'Please select a suggested goal or write a short note about what you hope to achieve.';
      }
      break;

    case 3: // Student / Parent Details
      if (data.audience === 'child') {
        if (!data.childName.trim()) {
          errors.childName = isArabic ? 'يرجى إدخال اسم الطفل الكريم.' : 'Please enter the student / child’s name.';
        }
        if (!data.childAge.trim()) {
          errors.childAge = isArabic ? 'يرجى تحديد الفئة العمرية للطفل.' : 'Please choose an age group for the child.';
        }
        if (!data.parentName.trim()) {
          errors.parentName = isArabic ? 'يرجى إدخال اسم ولي الأمر الكريم للتواصل.' : 'Please enter parent / guardian’s name.';
        }
        if (!data.parentEmail.trim()) {
          errors.parentEmail = isArabic ? 'البريد الإلكتروني مطلوب لاستلام رابط زووم.' : 'Email address is required to receive the Zoom lesson link.';
        } else if (!isValidEmail(data.parentEmail)) {
          errors.parentEmail = isArabic ? 'يرجى التأكد من كتابة البريد الإلكتروني بشكل صحيح (مثال: name@example.com).' : 'Please enter a valid email address (e.g. name@example.com).';
        }
      } else {
        // Adult
        if (!data.studentName.trim()) {
          errors.studentName = isArabic ? 'يرجى إدخال اسمك الكريم لنتمكن من مخاطبتك.' : 'Please enter your full name so Mahmoud knows who he is meeting.';
        }
        if (!data.email.trim()) {
          errors.email = isArabic ? 'البريد الإلكتروني مطلوب لإرسال رابط الدرس والتأكيد.' : 'Email is required to send your Zoom lesson link and confirmation.';
        } else if (!isValidEmail(data.email)) {
          errors.email = isArabic ? 'يرجى التأكد من كتابة البريد الإلكتروني بشكل صحيح (مثال: name@example.com).' : 'Please enter a valid email address (e.g. name@example.com).';
        }
      }
      break;

    case 4: // Lesson Type & Duration
      if (!data.duration) {
        errors.duration = isArabic ? 'يرجى اختيار مدة الدرس المناسبة لك.' : 'Please select your preferred lesson duration.';
      }
      break;

    case 5: // Date & Time
      if (!data.date) {
        errors.date = isArabic ? 'يرجى اختيار اليوم المناسب من التقويم.' : 'Please pick a date from the calendar.';
      }
      if (!data.timeSlot) {
        errors.timeSlot = isArabic ? 'يرجى اختيار الوقت المناسب لك في هذا اليوم.' : 'Please select a suitable starting time for your session.';
      }
      break;

    default:
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
