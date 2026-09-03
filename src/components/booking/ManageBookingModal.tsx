import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  RefreshCw,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { bookingService } from '../../booking/bookingService';
import { MockBookingRecord, Language, TimeSlot } from '../../booking/types';

interface ManageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRefCode?: string;
  lang: Language;
}

export const ManageBookingModal: React.FC<ManageBookingModalProps> = ({
  isOpen,
  onClose,
  initialRefCode = '',
  lang
}) => {
  const isEn = lang === 'en';

  const [refCode, setRefCode] = useState(initialRefCode);
  const [booking, setBooking] = useState<MockBookingRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('2026-09-08');
  const [newTime, setNewTime] = useState('11:45 AM');

  // Test bookings available
  const sampleBookings = bookingService.getTestBookings();

  useEffect(() => {
    if (initialRefCode) {
      setRefCode(initialRefCode);
      handleSearch(initialRefCode);
    }
  }, [initialRefCode]);

  const handleSearch = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;
    setLoading(true);
    setSearchError(null);
    setActionSuccess(null);
    setIsRescheduling(false);

    try {
      const found = await bookingService.lookupBooking(codeToSearch);
      if (found) {
        setBooking(found);
      } else {
        setBooking(null);
        setSearchError(
          isEn
            ? `No booking found for reference "${codeToSearch}". Please check your code.`
            : `لم يتم العثور على حجز بالرمز "${codeToSearch}". يرجى التحقق من الرمز.`
        );
      }
    } catch {
      setSearchError(isEn ? 'Error retrieving booking.' : 'حدث خطأ أثناء البحث عن الحجز.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    setLoading(true);
    const res = await bookingService.cancelBooking(booking.reference);
    setLoading(false);
    if (res.success) {
      setActionSuccess(res.message);
      setBooking({ ...booking, status: 'cancelled' });
    } else {
      setSearchError(res.message);
    }
  };

  const handleReschedule = async () => {
    if (!booking) return;
    setLoading(true);
    const mockSlot: TimeSlot = {
      id: `${newDate}-resched`,
      time24: '11:45',
      timeDisplay: newTime,
      period: 'morning',
      available: true,
      cairoTimeEquiv: '06:45 PM'
    };
    const res = await bookingService.rescheduleBooking(booking.reference, newDate, mockSlot);
    setLoading(false);
    if (res.success) {
      setActionSuccess(res.message);
      setIsRescheduling(false);
      setBooking({
        ...booking,
        scheduledIsoDatetime: `${newDate}T11:45:00.000Z`,
        status: 'rescheduled'
      });
    } else {
      setSearchError(res.message);
    }
  };

  // Eligibility evaluation (Master Spec Section 21: 3-hour rule)
  const eligibility = booking
    ? bookingService.checkPolicyEligibility(booking.scheduledIsoDatetime)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#362E3B]/70 backdrop-blur-xs"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="w-full max-w-xl bg-[#F5E6D3] dark:bg-[#231D28] rounded-3xl border border-[#87A878]/30 shadow-2xl p-6 sm:p-7 text-[#362E3B] dark:text-[#F5E6D3] max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D5D0CA] dark:border-[#3E3545]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#87A878]" />
                <h3 className="font-serif text-lg sm:text-xl font-medium">
                  {isEn ? 'Manage or Reschedule Booking' : 'إدارة أو تعديل موعد الحجز'}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-[#362E3B]/60 dark:text-[#D5D0CA]/60 hover:bg-[#EDE3D4] dark:hover:bg-[#29232F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Policy Reminder */}
            <div className="py-3 text-xs text-[#362E3B]/75 dark:text-[#D5D0CA]/75 leading-relaxed bg-[#EDE3D4]/60 dark:bg-[#1E1923] p-3 rounded-xl border border-[#87A878]/20 my-3">
              <strong className="text-[#362E3B] dark:text-[#F5E6D3]">
                {isEn ? 'Cancellation & Rescheduling Rule: ' : 'سياسة التعديل والإلغاء: '}
              </strong>
              {isEn
                ? 'Students may cancel or reschedule up to 3 hours before the lesson. Within 3 hours, self-service changes are closed and you must contact Mahmoud directly.'
                : 'يمكنك تعديل الموعد أو الإلغاء ذاتياً حتى ٣ ساعات قبل الدرس. خلال الساعات الثلاث السابقة، يُرجى التواصل مع محمود مباشرة على واتساب.'}
            </div>

            {/* Quick Demo Selector for Reviewers */}
            <div className="mb-4">
              <span className="text-[11px] uppercase font-semibold text-[#362E3B]/60 dark:text-[#D5D0CA]/60 block mb-1.5">
                {isEn ? 'Interactive Policy Testing (Click to Test):' : 'اختبار السياسة تفاعلياً (انقر للتجربة):'}
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleBookings.map((b) => {
                  const check = bookingService.checkPolicyEligibility(b.scheduledIsoDatetime);
                  return (
                    <button
                      key={b.reference}
                      type="button"
                      onClick={() => {
                        setRefCode(b.reference);
                        handleSearch(b.reference);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-[#D5D0CA] dark:border-[#3E3545] bg-white dark:bg-[#1E1923] text-xs hover:bg-[#EDE3D4] transition-colors cursor-pointer text-start"
                    >
                      <span className="font-semibold">{b.reference}</span>{' '}
                      <span className={check.eligible ? 'text-[#87A878]' : 'text-amber-700 dark:text-amber-400'}>
                        ({check.eligible ? (isEn ? '>3h away • Eligible' : '>٣ ساعات • متاح') : (isEn ? '<3h away • Restricted' : '<٣ ساعات • مقيد')})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#362E3B]/50 dark:text-[#D5D0CA]/50" />
                <input
                  type="text"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  placeholder={isEn ? 'Enter Booking Reference (e.g. MHM-84291)' : 'أدخل رقم الحجز (مثال: MHM-84291)'}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-white dark:bg-[#1E1923] text-xs text-[#362E3B] dark:text-[#F5E6D3] uppercase font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSearch(refCode)}
                disabled={loading || !refCode.trim()}
                className="px-4 py-2 rounded-xl bg-[#6B5B73] hover:bg-[#584960] text-white text-xs font-medium cursor-pointer disabled:opacity-50"
              >
                {loading ? (isEn ? 'Checking...' : 'فحص...') : (isEn ? 'Look Up' : 'بحث')}
              </button>
            </div>

            {searchError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/40 text-xs text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Booking Result & Policy Evaluation */}
            {booking && eligibility && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E1923] border border-[#87A878]/30 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#362E3B]/50 dark:text-[#D5D0CA]/50">
                      {booking.reference} • {booking.mode === 'trial' ? 'Free Trial' : '1-on-1 Lesson'}
                    </span>
                    <h4 className="font-serif text-base font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                      {booking.serviceName}
                    </h4>
                    <p className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/70">
                      {booking.learnerName} {booking.parentName ? `(Parent: ${booking.parentName})` : ''}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      booking.status === 'confirmed'
                        ? 'bg-[#87A878]/20 text-[#87A878]'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                        : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-[#362E3B]/80 dark:text-[#D5D0CA]/80 space-y-1 bg-[#F5E6D3]/40 dark:bg-[#29232F] p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#87A878]" />
                    <span>Scheduled for: {new Date(booking.scheduledIsoDatetime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#87A878]" />
                    <span>Timezone: {booking.timezone} ({booking.durationMinutes} min)</span>
                  </div>
                </div>

                {/* POLICY EVALUATION STATUS */}
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    eligibility.eligible
                      ? 'bg-[#87A878]/10 border-[#87A878]/40 text-[#362E3B] dark:text-[#F5E6D3]'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    {eligibility.eligible ? (
                      <CheckCircle2 className="w-4 h-4 text-[#87A878]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                    <span>
                      {eligibility.eligible
                        ? isEn ? 'Eligible for Self-Service Changes' : 'مؤهل للتعديل والإلغاء الذاتي'
                        : isEn ? 'Within 3-Hour Window (Self-Service Disabled)' : 'خلال نافذة ٣ ساعات (التعديل الذاتي مغلق)'}
                    </span>
                  </div>
                  <p className="text-[11px]">{eligibility.explanation}</p>
                </div>

                {/* Reschedule View if Active */}
                {isRescheduling && (
                  <div className="p-3.5 rounded-xl bg-[#EDE3D4] dark:bg-[#29232F] border border-[#87A878]/30 space-y-3">
                    <h5 className="font-serif text-xs font-semibold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9]">
                      {isEn ? 'Choose New Date & Starting Time' : 'اختر التاريخ والموعد الجديد'}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-[#362E3B]/70 dark:text-[#D5D0CA]/70 mb-1">
                          {isEn ? 'New Date' : 'التاريخ الجديد'}
                        </label>
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D5D0CA] dark:border-[#3E3545] bg-white dark:bg-[#1E1923] text-xs text-[#362E3B] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-[#362E3B]/70 dark:text-[#D5D0CA]/70 mb-1">
                          {isEn ? 'New Time Slot' : 'الوقت الجديد'}
                        </label>
                        <select
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D5D0CA] dark:border-[#3E3545] bg-white dark:bg-[#1E1923] text-xs text-[#362E3B] dark:text-white"
                        >
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:45 AM">11:45 AM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="05:00 PM">05:00 PM</option>
                          <option value="06:30 PM">06:30 PM</option>
                          <option value="08:00 PM">08:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsRescheduling(false)}
                        className="px-3 py-1.5 rounded-lg text-xs hover:bg-[#D5D0CA] transition-colors"
                      >
                        {isEn ? 'Cancel' : 'إلغاء'}
                      </button>
                      <button
                        type="button"
                        onClick={handleReschedule}
                        className="px-4 py-1.5 rounded-lg bg-[#6B5B73] text-white text-xs font-medium cursor-pointer"
                      >
                        {isEn ? 'Save New Schedule' : 'حفظ الموعد الجديد'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Self-Service Actions (If Eligible) */}
                {eligibility.eligible && booking.status === 'confirmed' && !isRescheduling && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(true)}
                      className="px-4 py-2 rounded-xl bg-[#6B5B73] hover:bg-[#584960] text-white text-xs font-medium cursor-pointer"
                    >
                      {isEn ? 'Reschedule Lesson' : 'تغيير موعد الدرس'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40 text-xs font-medium hover:bg-red-100 cursor-pointer"
                    >
                      {isEn ? 'Cancel Booking' : 'إلغاء الحجز'}
                    </button>
                  </div>
                )}

                {/* Contact Mahmoud Directly Action (If < 3 Hours) */}
                {!eligibility.eligible && (
                  <div className="pt-1">
                    <a
                      href={`https://wa.me/201099616802?text=${encodeURIComponent(
                        `Assalamu Alaikum Ustadh Mahmoud, regarding my booking ${booking.reference} for ${booking.serviceName} scheduled in ${eligibility.hoursRemaining} hours, I need to request an urgent change.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#87A878] hover:bg-[#6F907D] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{isEn ? 'Contact Mahmoud Directly on WhatsApp' : 'مراسلة محمود مباشرة على واتساب'}</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
