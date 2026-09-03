import React from 'react';
import { motion } from 'motion/react';
import {
  Check,
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  User,
  Mail,
  Phone,
  BookOpen,
  Target,
  ShieldCheck,
  Edit2,
  Lock,
  Sparkles
} from 'lucide-react';
import { BookingFormData, Language } from '../../booking/types';
import { BOOKING_SERVICES, calculateLessonFee, MAJOR_TIMEZONES } from '../../booking/mockData';

interface StepReviewSummaryProps {
  formData: BookingFormData;
  onGoToStep: (step: number) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  lang: Language;
}

export const StepReviewSummary: React.FC<StepReviewSummaryProps> = ({
  formData,
  onGoToStep,
  onSubmit,
  onBack,
  isSubmitting,
  lang
}) => {
  const isEn = lang === 'en';
  const service = BOOKING_SERVICES.find((s) => s.id === formData.serviceId) || BOOKING_SERVICES[0];
  const isChild = formData.audience === 'child';
  const isTrial = formData.mode === 'trial';
  const fee = calculateLessonFee(formData.serviceId, formData.duration, isTrial);

  const matchedTz = MAJOR_TIMEZONES.find((t) => t.value === formData.timezone);
  const tzName = matchedTz ? matchedTz.label : formData.timezone;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[#362E3B]/80 dark:text-[#D5D0CA] leading-relaxed max-w-2xl">
          {isEn
            ? 'Please take a moment to review your lesson details before confirming. You can adjust any section by clicking the edit icon.'
            : 'يرجى مراجعة تفاصيل درسك بعناية قبل التأكيد النهائي. يمكنك تعديل أي قسم بالنقر على زر التعديل.'}
        </p>
      </div>

      {/* Main Review Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#231D28] border border-[#87A878]/30 shadow-xs space-y-5">
        {/* Service & Goal */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#D5D0CA] dark:border-[#3E3545]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9]">
              <BookOpen className="w-3.5 h-3.5 text-[#87A878]" />
              <span>{isEn ? 'Selected Discipline' : 'المادة المختارة'}</span>
            </div>
            <h3 className="font-serif text-lg font-medium text-[#362E3B] dark:text-[#F5E6D3]">
              {isEn ? service.name : service.arabicName}
            </h3>
            <div className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/80">
              <span className="font-medium text-[#362E3B] dark:text-white">
                {isEn ? 'Goal: ' : 'الهدف: '}
              </span>
              <span>{formData.goal || formData.customGoalText}</span>
            </div>
            {formData.customGoalText && formData.goal && (
              <p className="text-xs italic bg-[#F5E6D3]/40 dark:bg-[#1E1923] p-2 rounded-lg text-[#362E3B]/75 dark:text-[#D5D0CA]/80 mt-1">
                “{formData.customGoalText}”
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onGoToStep(1)}
            className="p-1.5 rounded-lg text-[#362E3B]/60 dark:text-[#D5D0CA]/60 hover:bg-[#EDE3D4] dark:hover:bg-[#29232F] transition-colors cursor-pointer shrink-0"
            title={isEn ? 'Edit Subject' : 'تعديل المادة'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Schedule & Timezone */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#D5D0CA] dark:border-[#3E3545]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9]">
              <Calendar className="w-3.5 h-3.5 text-[#87A878]" />
              <span>{isEn ? 'Scheduled Date & Time' : 'الموعد والتوقيت'}</span>
            </div>
            <div className="text-base font-serif font-medium text-[#362E3B] dark:text-[#F5E6D3] flex flex-wrap items-center gap-2">
              <span>{formData.date}</span>
              <span>•</span>
              <span className="text-[#87A878] font-semibold">{formData.timeSlot?.timeDisplay}</span>
            </div>
            <div className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/70 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                {tzName}
              </span>
              <span>•</span>
              <span>
                {isEn ? `Duration: ${formData.duration} Minutes` : `المدة: ${formData.duration} دقيقة`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onGoToStep(5)}
            className="p-1.5 rounded-lg text-[#362E3B]/60 dark:text-[#D5D0CA]/60 hover:bg-[#EDE3D4] dark:hover:bg-[#29232F] transition-colors cursor-pointer shrink-0"
            title={isEn ? 'Edit Schedule' : 'تعديل الموعد'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Learner Details & Communication */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#D5D0CA] dark:border-[#3E3545]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9]">
              <User className="w-3.5 h-3.5 text-[#87A878]" />
              <span>{isEn ? 'Student & Contact' : 'بيانات الطالب والتواصل'}</span>
            </div>

            <div className="text-sm font-medium text-[#362E3B] dark:text-[#F5E6D3]">
              {isChild ? (
                <span>
                  {formData.childName}{' '}
                  <span className="text-xs text-[#362E3B]/60 dark:text-[#D5D0CA]/60">
                    ({isEn ? `Child, Age ${formData.childAge}` : `طفل، العمر ${formData.childAge}`} • Parent: {formData.parentName})
                  </span>
                </span>
              ) : (
                <span>
                  {formData.studentName}{' '}
                  <span className="text-xs text-[#362E3B]/60 dark:text-[#D5D0CA]/60">
                    ({isEn ? `Adult, Age ${formData.ageGroup}` : `بالغ، الفئة ${formData.ageGroup}`})
                  </span>
                </span>
              )}
            </div>

            <div className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/70 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#87A878]" />
                {isChild ? formData.parentEmail : formData.email}
              </span>
              {(isChild ? formData.parentWhatsapp : formData.whatsapp) && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#87A878]" />
                  {isChild ? formData.parentWhatsapp : formData.whatsapp}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onGoToStep(3)}
            className="p-1.5 rounded-lg text-[#362E3B]/60 dark:text-[#D5D0CA]/60 hover:bg-[#EDE3D4] dark:hover:bg-[#29232F] transition-colors cursor-pointer shrink-0"
            title={isEn ? 'Edit Student Details' : 'تعديل البيانات'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Investment / Fee Structure */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#362E3B]/60 dark:text-[#D5D0CA]/60 block">
              {isEn ? 'Session Investment' : 'رسوم الجلسة'}
            </span>
            <span className="text-xs text-[#362E3B]/60 dark:text-[#D5D0CA]/60">
              {isTrial
                ? isEn ? 'Free introductory assessment session' : 'جلسة تعارف وتقييم مجانية تماماً'
                : isEn ? 'Pay per lesson / no lock-in' : 'دفع لكل درس دون التزام مقيد'}
            </span>
          </div>

          <div className="text-end">
            <span className="font-serif text-2xl font-bold text-[#87A878] dark:text-[#87A878]">
              {isTrial ? (isEn ? 'FREE ($0.00)' : 'مجاناً ($٠.٠٠)') : `$${fee.toFixed(2)} USD`}
            </span>
          </div>
        </div>
      </div>

      {/* Cancellation / Rescheduling Policy Notice (Master Spec Section 21) */}
      <div className="p-4 rounded-2xl bg-[#EDE3D4] dark:bg-[#29232F] border border-[#87A878]/30 flex items-start gap-3 text-xs text-[#362E3B]/80 dark:text-[#D5D0CA]/80">
        <ShieldCheck className="w-5 h-5 text-[#87A878] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#362E3B] dark:text-[#F5E6D3] block mb-0.5">
            {isEn ? 'Cancellation & Rescheduling Policy' : 'سياسة الإلغاء وتغيير الموعد'}
          </strong>
          <span>
            {isEn
              ? 'You can easily reschedule or cancel anytime up to 3 hours before your lesson. For requests within the 3-hour window, please contact Mahmoud directly on WhatsApp.'
              : 'يمكنك تعديل الموعد أو الإلغاء بكل سهولة حتى ٣ ساعات قبل بدء الدرس. في حال رغبتك بالتعديل خلال الساعات الثلاث السابقة للدرس، يُرجى مراسلة محمود مباشرة على واتساب.'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="pt-4 border-t border-[#D5D0CA] dark:border-[#3E3545] flex items-center justify-between gap-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          type="button"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-[#362E3B]/80 dark:text-[#D5D0CA]/80 hover:bg-[#EDE3D4] dark:hover:bg-[#29232F] transition-colors cursor-pointer"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          <span>{isEn ? 'Back to Schedule' : 'الرجوع للموعد'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#6B5B73] hover:bg-[#584960] text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{isEn ? 'Finalizing Your Booking...' : 'جارٍ تأكيد حجزك...'}</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>
                {isTrial
                  ? isEn ? 'Confirm Free Trial' : 'تأكيد حجز الجلسة المجانية'
                  : isEn ? 'Confirm 1-on-1 Lesson' : 'تأكيد حجز الدرس الفردي'}
              </span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
