import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageCircle, X, CheckCircle2 } from 'lucide-react';
import { BookingMode, Language } from '../../booking/types';

interface BookingHeaderProps {
  step: number;
  totalSteps: number;
  mode: BookingMode;
  lang: Language;
  onBack?: () => void;
  onClose?: () => void;
  serviceName?: string;
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({
  step,
  totalSteps,
  mode,
  lang,
  onBack,
  onClose,
  serviceName
}) => {
  const isEn = lang === 'en';

  const stepTitles = isEn
    ? [
        'Select Your Subject',
        'Your Learning Goals',
        'About You & Level',
        'Lesson Type & Length',
        'Choose Date & Time',
        'Review & Confirmation'
      ]
    : [
        'اختر مادتك التعليمية',
        'أهدافك ومستواك',
        'بياناتك ومستواك الحالي',
        'نوع الدرس ومدته',
        'اختر الموعد المناسب',
        'المراجعة والتأكيد'
      ];

  const currentStepTitle = stepTitles[step - 1] || '';

  return (
    <div className="pb-6 border-b border-[#D5D0CA] dark:border-[#3E3545]/80 mb-6 sm:mb-8">
      {/* Top Bar: Back, Status Tag, and Close */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {step > 1 && onBack && (
            <motion.button
              whileHover={{ scale: 1.05, x: isEn ? -2 : 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#362E3B] dark:text-[#F5E6D3] bg-[#EDE3D4] dark:bg-[#29232F] hover:bg-[#D5D0CA] dark:hover:bg-[#342D3B] transition-colors cursor-pointer"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              <span>{isEn ? 'Back' : 'رجوع'}</span>
            </motion.button>
          )}

          {/* Mode Pill Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
              mode === 'trial'
                ? 'bg-[#87A878]/20 text-[#87A878] dark:text-[#87A878] border border-[#87A878]/30'
                : 'bg-[#6B5B73]/15 text-[#6B5B73] dark:text-[#B8A9C9] border border-[#6B5B73]/30'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {mode === 'trial'
                ? isEn
                  ? 'Free 30-Min Trial Session'
                  : 'جلسة تجريبية مجانية (٣٠ دقيقة)'
                : isEn
                ? 'Regular 1-on-1 Lesson'
                : 'درس فردي منتظم'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtle WhatsApp Assistance Path */}
          <a
            href="https://wa.me/201099616802?text=Assalamu%20Alaikum%20Ustadh%20Mahmoud,%20I%20have%20a%20question%20regarding%20booking%20a%20lesson."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/70 hover:text-[#87A878] dark:hover:text-[#87A878] transition-colors"
            title={isEn ? 'Ask a quick question first' : 'اسأل سؤالاً سريعاً على واتساب'}
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#87A878]" />
            <span>{isEn ? 'Ask Mahmoud on WhatsApp' : 'تواصل مع محمود على واتساب'}</span>
          </a>

          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-full text-[#362E3B]/60 dark:text-[#D5D0CA]/60 hover:bg-[#EDE3D4] dark:hover:bg-[#29232F] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Step Title & Progress Track */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9] block mb-0.5">
            {isEn ? `Step ${step} of ${totalSteps}` : `الخطوة ${step} من ${totalSteps}`}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#362E3B] dark:text-[#F5E6D3]">
            {currentStepTitle}
          </h2>
        </div>

        {serviceName && step > 1 && (
          <div className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/70 bg-white/60 dark:bg-[#1E1923]/60 px-2.5 py-1 rounded-md border border-[#D5D0CA]/60 dark:border-[#3E3545]/60 self-start sm:self-auto">
            <span className="text-[#362E3B]/50 dark:text-[#D5D0CA]/50">{isEn ? 'Selected: ' : 'المادة: '}</span>
            <span className="font-medium text-[#362E3B] dark:text-[#F5E6D3]">{serviceName}</span>
          </div>
        )}
      </div>

      {/* Modern, calm visual progress line */}
      <div className="w-full bg-[#D5D0CA]/60 dark:bg-[#3E3545] h-1.5 rounded-full overflow-hidden">
        <motion.div
          className="bg-[#6B5B73] dark:bg-[#B8A9C9] h-full rounded-full"
          initial={false}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
};
