import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookingFormData, BookingConfirmationData, BookingMode, Language } from '../../booking/types';
import { BOOKING_SERVICES } from '../../booking/mockData';
import { bookingService } from '../../booking/bookingService';
import { validateStep } from '../../booking/validation';
import { BookingHeader } from './BookingHeader';
import { StepServiceSelect } from './StepServiceSelect';
import { StepGoalSelect } from './StepGoalSelect';
import { StepStudentDetails } from './StepStudentDetails';
import { StepLessonType } from './StepLessonType';
import { StepDateTime } from './StepDateTime';
import { StepReviewSummary } from './StepReviewSummary';
import { BookingConfirmation } from './BookingConfirmation';
import { ManageBookingModal } from './ManageBookingModal';

interface BookingFlowProps {
  initialServiceId?: string;
  initialMode?: BookingMode;
  lang: Language;
  onClose?: () => void;
  isModalView?: boolean;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  initialServiceId,
  initialMode = 'trial',
  lang,
  onClose,
  isModalView = false
}) => {
  const isEn = lang === 'en';

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmationData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [manageModalOpen, setManageModalOpen] = useState<boolean>(false);
  const [manageRefCode, setManageRefCode] = useState<string>('');

  // Progressive Form State
  const [formData, setFormData] = useState<BookingFormData>(() => {
    let userTz = 'America/New_York';
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) userTz = detected;
    } catch {
      // Fallback
    }

    return {
      mode: initialMode,
      serviceId: initialServiceId || 'quran-reading',
      goal: '',
      customGoalText: '',
      audience: 'adult',
      studentName: '',
      email: '',
      whatsapp: '',
      ageGroup: '18-29',
      currentLevel: 'beginner',
      notes: '',
      childName: '',
      childAge: '8-11',
      parentName: '',
      parentEmail: '',
      parentWhatsapp: '',
      childLevel: 'beginner',
      parentNotes: '',
      duration: initialMode === 'trial' ? 30 : 45,
      date: '',
      timeSlot: null,
      timezone: userTz
    };
  });

  // Sync initial service changes from outside
  useEffect(() => {
    if (initialServiceId) {
      setFormData((prev) => ({ ...prev, serviceId: initialServiceId }));
    }
  }, [initialServiceId]);

  useEffect(() => {
    if (initialMode) {
      setFormData((prev) => ({
        ...prev,
        mode: initialMode,
        duration: initialMode === 'trial' ? 30 : (prev.duration || 45)
      }));
    }
  }, [initialMode]);

  const updateFormData = (fields: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setValidationError(null);
  };

  const currentService = BOOKING_SERVICES.find((s) => s.id === formData.serviceId);

  const handleNext = () => {
    const check = validateStep(step, formData, lang === 'ar');
    if (!check.isValid) {
      const firstError = Object.values(check.errors)[0];
      setValidationError(firstError);
      return;
    }

    setValidationError(null);
    if (step < 6) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleGoToStep = (targetStep: number) => {
    setValidationError(null);
    if (targetStep >= 1 && targetStep <= 6) {
      setStep(targetStep);
    }
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    setValidationError(null);
    try {
      const result = await bookingService.submitBooking(formData);
      setConfirmation(result);
    } catch (err: any) {
      setValidationError(
        err?.message ||
        (isEn
          ? 'Unable to finalize your booking right now. Please try again or contact Mahmoud on WhatsApp.'
          : 'تعذر استكمال الحجز في الوقت الحالي، يرجى إعادة المحاولة أو مراسلة محمود مباشرة.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenManageModal = (refCode: string) => {
    setManageRefCode(refCode);
    setManageModalOpen(true);
  };

  const handleResetForNewBooking = () => {
    setConfirmation(null);
    setStep(1);
    if (onClose) onClose();
  };

  return (
    <div
      className={`w-full ${
        isModalView
          ? 'bg-[#F5E6D3] dark:bg-[#231D28] text-[#362E3B] dark:text-[#D5D0CA] p-5 sm:p-8 rounded-3xl max-w-3xl mx-auto shadow-2xl border border-[#87A878]/30 max-h-[92vh] overflow-y-auto'
          : 'bg-[#F5E6D3] dark:bg-[#1E1923] text-[#362E3B] dark:text-[#D5D0CA] py-8 sm:py-12 px-4 sm:px-6'
      }`}
    >
      {/* Confirmation State */}
      {confirmation ? (
        <BookingConfirmation
          confirmation={confirmation}
          onOpenManageModal={handleOpenManageModal}
          onDone={handleResetForNewBooking}
          lang={lang}
        />
      ) : (
        /* Multi-Step Flow */
        <div>
          <BookingHeader
            step={step}
            totalSteps={6}
            mode={formData.mode}
            lang={lang}
            onBack={step > 1 ? handleBack : undefined}
            onClose={onClose}
            serviceName={isEn ? currentService?.name : currentService?.arabicName}
          />

          {/* Validation Notice if any */}
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between"
            >
              <span>{validationError}</span>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-amber-700 dark:text-amber-400 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          )}

          {/* Steps Presentation */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <StepServiceSelect
                  selectedServiceId={formData.serviceId}
                  onSelectService={(serviceId) => updateFormData({ serviceId })}
                  onNext={handleNext}
                  lang={lang}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <StepGoalSelect
                  serviceId={formData.serviceId}
                  selectedGoal={formData.goal}
                  customGoalText={formData.customGoalText}
                  onSelectGoal={(goal) => updateFormData({ goal })}
                  onChangeCustomGoal={(customGoalText) => updateFormData({ customGoalText })}
                  onNext={handleNext}
                  onBack={handleBack}
                  lang={lang}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <StepStudentDetails
                  formData={formData}
                  updateForm={updateFormData}
                  onNext={handleNext}
                  onBack={handleBack}
                  lang={lang}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <StepLessonType
                  mode={formData.mode}
                  duration={formData.duration}
                  serviceId={formData.serviceId}
                  onChangeMode={(mode) => updateFormData({ mode })}
                  onChangeDuration={(duration) => updateFormData({ duration })}
                  onNext={handleNext}
                  onBack={handleBack}
                  lang={lang}
                />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <StepDateTime
                  mode={formData.mode}
                  selectedDate={formData.date}
                  selectedSlot={formData.timeSlot}
                  timezone={formData.timezone}
                  onSelectDate={(date) => updateFormData({ date })}
                  onSelectSlot={(timeSlot) => updateFormData({ timeSlot })}
                  onSelectTimezone={(timezone) => updateFormData({ timezone })}
                  onNext={handleNext}
                  onBack={handleBack}
                  lang={lang}
                />
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <StepReviewSummary
                  formData={formData}
                  onGoToStep={handleGoToStep}
                  onSubmit={handleSubmitBooking}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                  lang={lang}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Cancellation / Rescheduling Policy Modal */}
      <ManageBookingModal
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        initialRefCode={manageRefCode}
        lang={lang}
      />
    </div>
  );
};
