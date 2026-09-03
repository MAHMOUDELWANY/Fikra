import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight, ArrowLeft, Clock, Gift, CalendarCheck, HelpCircle, MessageSquare } from 'lucide-react';
import { BookingMode, Language, LessonDuration } from '../../booking/types';
import { BOOKING_SERVICES, calculateLessonFee } from '../../booking/mockData';

interface StepLessonTypeProps {
  mode: BookingMode;
  duration: LessonDuration;
  serviceId: string;
  onChangeMode: (mode: BookingMode) => void;
  onChangeDuration: (duration: LessonDuration) => void;
  onNext: () => void;
  onBack: () => void;
  lang: Language;
}

export const StepLessonType: React.FC<StepLessonTypeProps> = ({
  mode,
  duration,
  serviceId,
  onChangeMode,
  onChangeDuration,
  onNext,
  onBack,
  lang
}) => {
  const isEn = lang === 'en';
  const service = BOOKING_SERVICES.find((s) => s.id === serviceId) || BOOKING_SERVICES[0];

  const durations: { length: LessonDuration; label: string; arabicLabel: string; note: string; arabicNote: string }[] = [
    {
      length: 30,
      label: '30 Minutes',
      arabicLabel: '٣٠ دقيقة',
      note: 'Optimal for young children, focused Noorani Qaidah, or daily Tajweed drill.',
      arabicNote: 'مثالية للأطفال الصغار، القاعدة النورانية، أو التدريب اليومي السريع.'
    },
    {
      length: 45,
      label: '45 Minutes',
      arabicLabel: '٤٥ دقيقة',
      note: 'Balanced depth for Quran recitation combined with Tajweed corrections.',
      arabicNote: 'مدة متوازنة تجمع بين التلاوة القرآنية والتصحيح التجويدي الهادئ.'
    },
    {
      length: 60,
      label: '60 Minutes',
      arabicLabel: '٦٠ دقيقة',
      note: 'Comprehensive session for Arabic grammar, Islamic Studies, or dual-discipline learning.',
      arabicNote: 'جلسة شاملة وموسعة لقواعد النحو، أو الدراسات الإسلامية ومناقشاتها.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Mode Choice (Free Trial vs Regular) */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/70 dark:text-[#D5D0CA]/70 mb-2.5">
          {isEn ? 'Choose Your Booking Type' : 'نوع الحجز المطلوب'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Free Trial Card */}
          <motion.div
            whileHover={{ scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => {
              onChangeMode('trial');
              if (duration > 45) onChangeDuration(30);
            }}
            className={`p-4 sm:p-5 rounded-2xl border text-start transition-all cursor-pointer relative ${
              mode === 'trial'
                ? 'bg-[#F5E6D3] dark:bg-[#29232F] border-[#87A878] ring-2 ring-[#87A878]/30 shadow-xs'
                : 'bg-white dark:bg-[#231D28] border-[#D5D0CA] dark:border-[#3E3545] hover:bg-[#F5E6D3]/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#87A878]/20 text-[#87A878]">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                    {isEn ? 'Free Trial Session' : 'جلسة تجريبية مجانية'}
                  </h4>
                  <span className="text-xs font-semibold text-[#87A878]">
                    {isEn ? '$0.00 • No card required' : 'مجاناً (٠.٠٠ دولار)'}
                  </span>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  mode === 'trial'
                    ? 'bg-[#87A878] text-white'
                    : 'border border-[#D5D0CA] dark:border-[#3E3545]'
                }`}
              >
                {mode === 'trial' && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            <p className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/80 leading-relaxed mb-3">
              {isEn
                ? 'A 30-minute introductory meeting to get to know each other, evaluate current ability, experience Mahmoud’s teaching style, and receive an honest learning plan.'
                : 'لقاء تعريفي مدته ٣٠ دقيقة للتعارف وتقييم المستوى وتجربة أسلوب الشرح والحصول على خطة تعليمية مقترحة.'}
            </p>

            <div className="text-[11px] text-[#6B5B73] dark:text-[#B8A9C9] font-medium">
              {isEn ? '• One free trial per new student' : '• جلسة تجريبية واحدة لكل طالب جديد'}
            </div>
          </motion.div>

          {/* Regular Lesson Card */}
          <motion.div
            whileHover={{ scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => onChangeMode('regular')}
            className={`p-4 sm:p-5 rounded-2xl border text-start transition-all cursor-pointer relative ${
              mode === 'regular'
                ? 'bg-[#F5E6D3] dark:bg-[#29232F] border-[#6B5B73] ring-2 ring-[#6B5B73]/30 shadow-xs'
                : 'bg-white dark:bg-[#231D28] border-[#D5D0CA] dark:border-[#3E3545] hover:bg-[#F5E6D3]/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#6B5B73]/15 text-[#6B5B73] dark:text-[#B8A9C9]">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                    {isEn ? 'Regular 1-on-1 Lesson' : 'درس فردي منتظم'}
                  </h4>
                  <span className="text-xs font-semibold text-[#6B5B73] dark:text-[#B8A9C9]">
                    {isEn
                      ? `From $${calculateLessonFee(serviceId, 30, false)} • 30, 45, or 60 min`
                      : `يبدأ من $${calculateLessonFee(serviceId, 30, false)} • ٣٠ أو ٤٥ أو ٦٠ دقيقة`}
                  </span>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  mode === 'regular'
                    ? 'bg-[#6B5B73] text-white'
                    : 'border border-[#D5D0CA] dark:border-[#3E3545]'
                }`}
              >
                {mode === 'regular' && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            <p className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/80 leading-relaxed mb-3">
              {isEn
                ? 'Dedicated curriculum lesson for continuing students or those who wish to start scheduled instruction right away. Simple pay-per-lesson or monthly continuity.'
                : 'درس منهجي متكامل للطلاب الراغبين في بدء الخطة المباشرة. دفع بالدرس أو باقات شهرية ميسرة.'}
            </p>

            <div className="text-[11px] text-[#87A878] font-medium">
              {isEn ? '• Standard 1-on-1 personalized pace' : '• تدريس فردي مخصص بالكامل'}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lesson Duration Selection */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/70 dark:text-[#D5D0CA]/70">
            {isEn ? 'Select Preferred Lesson Duration' : 'اختر مدة الدرس المناسبة'}
          </label>
          <span className="text-xs text-[#362E3B]/60 dark:text-[#D5D0CA]/60 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#87A878]" />
            {mode === 'trial'
              ? isEn ? 'Trial standard: 30 min (up to 45 min max)' : 'المدة للتجربة: ٣٠ دقيقة (بحد أقصى ٤٥ دقيقة)'
              : isEn ? 'Standard durations: 30, 45, 60 min' : 'المدد المعتمدة: ٣٠، ٤٥، ٦٠ دقيقة'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {durations.map((d) => {
            const isSelected = duration === d.length;
            const fee = calculateLessonFee(serviceId, d.length, mode === 'trial');
            const isDisabled = mode === 'trial' && d.length === 60; // Master Spec: 60 min is NOT a trial option (max trial is 45 min)

            return (
              <button
                key={d.length}
                type="button"
                disabled={isDisabled}
                onClick={() => onChangeDuration(d.length)}
                className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed bg-black/5 dark:bg-white/5 border-transparent'
                    : isSelected
                    ? 'bg-[#F5E6D3] dark:bg-[#29232F] border-[#87A878] ring-1 ring-[#87A878] shadow-xs'
                    : 'bg-white dark:bg-[#231D28] border-[#D5D0CA] dark:border-[#3E3545] hover:bg-[#F5E6D3]/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif text-base font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                      {isEn ? d.label : d.arabicLabel}
                    </span>
                    <span className={`text-xs font-semibold ${mode === 'trial' ? 'text-[#87A878]' : 'text-[#6B5B73] dark:text-[#B8A9C9]'}`}>
                      {mode === 'trial' ? (isEn ? 'FREE' : 'مجاناً') : `$${fee}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#362E3B]/65 dark:text-[#D5D0CA]/70 leading-relaxed">
                    {isEn ? d.note : d.arabicNote}
                  </p>
                </div>

                {isDisabled && (
                  <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-400">
                    {isEn ? 'Max trial length is 45 min' : 'الحد الأقصى للتجربة ٤٥ دقيقة'}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Request for Sessions > 60 min note */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#231D28] border border-[#D5D0CA] dark:border-[#3E3545] text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/70 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-[#87A878] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span>
            {isEn
              ? '60 minutes is the standard maximum duration to protect focus and vocal clarity. If you need intensive multi-hour sessions or family blocks, please '
              : '٦٠ دقيقة هي الحد الأقصى للجلسات العادية حفاظاً على جودة التركيز والصوت. إذا كنت بحاجة لجلسات مكثفة أطول أو ترتيب عائلي، يرجى '}
          </span>
          <a
            href="https://wa.me/201099616802?text=Assalamu%20Alaikum%20Ustadh%20Mahmoud,%20I%20would%20like%20to%20request%20an%20extended%20lesson%20session%20(longer%20than%2060%20minutes)."
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6B5B73] dark:text-[#B8A9C9] font-medium underline hover:text-[#87A878]"
          >
            {isEn ? 'request an extended session directly with Mahmoud' : 'مراسلة محمود مباشرة لترتيبها'}
          </a>
          .
        </div>
      </div>

      {/* Controls */}
      <div className="pt-4 border-t border-[#D5D0CA] dark:border-[#3E3545] flex items-center justify-between gap-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-[#362E3B]/80 dark:text-[#D5D0CA]/80 hover:bg-[#EDE3D4] dark:hover:bg-[#29232F] transition-colors cursor-pointer"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          <span>{isEn ? 'Back to Student Details' : 'الرجوع للبيانات'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#6B5B73] hover:bg-[#584960] text-white text-sm font-medium shadow-xs transition-all cursor-pointer"
        >
          <span>{isEn ? 'Next: Pick Date & Time' : 'التالي: اختيار التاريخ والوقت'}</span>
          <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>
    </div>
  );
};
