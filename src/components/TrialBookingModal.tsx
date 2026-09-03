import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, BookingMode } from '../booking/types';
import { BookingFlow } from './booking/BookingFlow';

interface TrialBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  preselectedServiceId?: string;
  initialMode?: BookingMode;
}

export const TrialBookingModal: React.FC<TrialBookingModalProps> = ({
  isOpen,
  onClose,
  lang,
  preselectedServiceId,
  initialMode = 'trial'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-[#362E3B]/70 backdrop-blur-xs"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-3xl my-auto"
          >
            <BookingFlow
              initialServiceId={preselectedServiceId}
              initialMode={initialMode}
              lang={lang}
              onClose={onClose}
              isModalView={true}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
