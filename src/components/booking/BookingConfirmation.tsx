import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Globe,
  Video,
  MessageCircle,
  Download,
  Share2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { BookingConfirmationData, Language } from '../../booking/types';

interface BookingConfirmationProps {
  confirmation: BookingConfirmationData;
  onOpenManageModal?: (refCode: string) => void;
  onDone: () => void;
  lang: Language;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  confirmation,
  onOpenManageModal,
  onDone,
  lang
}) => {
  const isEn = lang === 'en';
  const [downloadedIcs, setDownloadedIcs] = useState(false);

  // Generate downloadable .ics calendar file
  const handleDownloadIcs = () => {
    try {
      const [year, month, day] = confirmation.date.split('-');
      const [timeH, timeM] = (confirmation.timeDisplay.includes('PM') && !confirmation.timeDisplay.startsWith('12')
        ? parseInt(confirmation.timeDisplay) + 12
        : parseInt(confirmation.timeDisplay)
      ).toString().padStart(2, '0');

      const dtStart = `${year}${month}${day}T100000Z`; // UTC placeholder
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Mahmoud Teaching Platform//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${confirmation.bookingReference}@mahmoud-teaching.com`,
        `SUMMARY:1-on-1 Lesson with Mahmoud - ${confirmation.serviceName}`,
        `DESCRIPTION:1-on-1 lesson with Mahmoud.\\nLearner: ${confirmation.learnerName}\\nDuration: ${confirmation.durationMinutes} min\\nReference: ${confirmation.bookingReference}\\nZoom meeting room credentials will be shared prior to session.`,
        `LOCATION:Zoom Online Classroom`,
        `STATUS:CONFIRMED`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `lesson-with-mahmoud-${confirmation.bookingReference}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadedIcs(true);
    } catch {
      // Ignore
    }
  };

  const whatsappPrefilledText = encodeURIComponent(
    `Assalamu Alaikum Ustadh Mahmoud, I have just booked my ${
      confirmation.isFreeTrial ? 'Free Trial' : '1-on-1 Lesson'
    } for ${confirmation.serviceName}.\nBooking Ref: ${confirmation.bookingReference}\nDate: ${
      confirmation.date
    } at ${confirmation.timeDisplay} (${confirmation.timezone})\nLearner: ${
      confirmation.learnerName
    }`
  );

  const whatsappLink = `https://wa.me/201099616802?text=${whatsappPrefilledText}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 max-w-2xl mx-auto py-2"
    >
      {/* Top Banner Celebration */}
      <div className="text-center space-y-3 pb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-[#87A878]/20 text-[#87A878] flex items-center justify-center mx-auto"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EDE3D4] dark:bg-[#29232F] text-[#6B5B73] dark:text-[#B8A9C9] border border-[#87A878]/30">
          {isEn ? `Booking Reference: ${confirmation.bookingReference}` : `رقم الحجز المرجعي: ${confirmation.bookingReference}`}
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#362E3B] dark:text-[#F5E6D3]">
          {confirmation.isFreeTrial
            ? isEn ? 'Your Free Trial is Booked' : 'تم تأكيد حجز جلستك التجريبية'
            : isEn ? 'Your Lesson is Scheduled' : 'تم تأكيد حجز درسك بنجاح'}
        </h2>

        <p className="text-sm text-[#362E3B]/80 dark:text-[#D5D0CA] max-w-lg mx-auto leading-relaxed">
          {isEn
            ? `Assalamu Alaikum ${confirmation.learnerName}. Mahmoud is looking forward to meeting you. A confirmation summary has been logged for your local schedule.`
            : `السلام عليكم ${confirmation.learnerName}. يتطلع الأستاذ محمود للقائك في الموعد المحدد.`}
        </p>
      </div>

      {/* Appointment Detail Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#231D28] border border-[#87A878]/30 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#D5D0CA] dark:border-[#3E3545]">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#EDE3D4] dark:bg-[#1E1923] text-[#87A878]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-semibold text-[#362E3B]/55 dark:text-[#D5D0CA]/55 block">
                {isEn ? 'Date' : 'التاريخ'}
              </span>
              <span className="text-sm font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                {confirmation.date}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#EDE3D4] dark:bg-[#1E1923] text-[#87A878]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-semibold text-[#362E3B]/55 dark:text-[#D5D0CA]/55 block">
                {isEn ? 'Time (Your Local Time)' : 'الوقت (بتوقيتك المحلي)'}
              </span>
              <span className="text-sm font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                {confirmation.timeDisplay}
              </span>
              <span className="text-[11px] text-[#362E3B]/60 dark:text-[#D5D0CA]/60 block">
                {confirmation.timezone} ({confirmation.durationMinutes} min)
              </span>
            </div>
          </div>
        </div>

        {/* Zoom & Preparation Info */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9]">
            <Video className="w-4 h-4 text-[#87A878]" />
            <span>{isEn ? 'Live Classroom & Zoom Details' : 'تفاصيل قاعة الدرس (زووم)'}</span>
          </div>

          <ul className="space-y-2 text-xs text-[#362E3B]/80 dark:text-[#D5D0CA]/80">
            {confirmation.zoomDetails.instructions.map((inst, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#87A878] mt-1.5 shrink-0" />
                <span>{inst}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Philosophy Reassurance / Post-Trial Human Expectation */}
      <div className="p-5 rounded-3xl bg-[#EDE3D4] dark:bg-[#231D28] border border-[#87A878]/30 space-y-2">
        <div className="flex items-center gap-2 font-serif text-sm font-medium text-[#362E3B] dark:text-[#F5E6D3]">
          <Sparkles className="w-4 h-4 text-[#87A878]" />
          <span>
            {confirmation.isFreeTrial
              ? isEn ? 'What to Expect in Your Free Trial' : 'ماذا ينتظرك في الجلسة التجريبية؟'
              : isEn ? 'What to Expect Next' : 'الخطوات القادمة'}
          </span>
        </div>

        <p className="text-xs text-[#362E3B]/80 dark:text-[#D5D0CA]/80 leading-relaxed">
          {confirmation.isFreeTrial
            ? isEn
              ? 'The trial is a relaxed chance for us to meet, assess where you or your child currently stand, and demonstrate the teaching method through a brief sample lesson. If it feels like a natural fit, Mahmoud will share an honest learning roadmap. There is zero obligation to commit.'
              : 'الجلسة التجريبية فرصة هادئة للتعارف وتحديد المستوى الفعلي وتجربة أسلوب التدريس في درس مصغر. إذا شعرت بالارتياح، سيقترح محمود خطة دراسية مناسبة دون أي إلزام مسبق.'
            : isEn
              ? 'Please have your Mushaf or learning materials ready. Mahmoud will send a polite reminder 24 hours and 1 hour before your scheduled lesson.'
              : 'يرجى تحضير المصحف أو كراس الملاحظات. سيصلك تذكير قبل موعد الدرس بـ ٢٤ ساعة وساعة واحدة.'}
        </p>
      </div>

      {/* Actions: Add to Calendar, WhatsApp Confirmation, and Manage Booking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#87A878] hover:bg-[#6F907D] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{isEn ? 'Say Salam on WhatsApp' : 'إرسال تأكيد لمحمود على واتساب'}</span>
        </a>

        <button
          type="button"
          onClick={handleDownloadIcs}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-[#231D28] border border-[#D5D0CA] dark:border-[#3E3545] text-xs font-semibold text-[#362E3B] dark:text-[#F5E6D3] hover:bg-[#EDE3D4] dark:hover:bg-[#1E1923] transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#87A878]" />
          <span>{downloadedIcs ? (isEn ? 'Calendar File Downloaded' : 'تم تنزيل ملف التقويم') : (isEn ? 'Add to Calendar (.ics)' : 'إضافة للتقويم')}</span>
        </button>
      </div>

      {/* Policy Foundation: Reschedule or Cancel Link */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => onOpenManageModal && onOpenManageModal(confirmation.bookingReference)}
          className="text-xs text-[#6B5B73] dark:text-[#B8A9C9] hover:underline font-medium cursor-pointer"
        >
          {isEn
            ? 'Need to reschedule or check cancellation eligibility? Manage here.'
            : 'هل تحتاج لتعديل الموعد أو مراجعة الحجز؟ انقر هنا للإدارة.'}
        </button>
      </div>

      {/* Return to Site */}
      <div className="pt-3 flex justify-center">
        <button
          type="button"
          onClick={onDone}
          className="px-6 py-2.5 rounded-xl text-xs font-medium text-[#362E3B]/70 dark:text-[#D5D0CA]/70 hover:bg-[#EDE3D4] dark:hover:bg-[#29232F] transition-colors cursor-pointer"
        >
          {isEn ? 'Done & Return to Homepage' : 'تم والعودة للموقع'}
        </button>
      </div>
    </motion.div>
  );
};
