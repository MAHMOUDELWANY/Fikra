import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { Language } from '../types';
import { FAQS, ARABIC_TRANSLATIONS } from '../data/content';

interface FAQSectionProps {
  lang: Language;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ lang }) => {
  const isEn = lang === 'en';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-20 md:py-28 bg-[#FFFFFF] dark:bg-[#1E1923] border-b border-[#D5D0CA] dark:border-[#3E3545] transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="text-xs uppercase tracking-widest text-[#6B5B73] dark:text-[#B8A9C9] font-medium mb-3">
            {isEn ? 'Practical Questions' : ARABIC_TRANSLATIONS.nav.faqs}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#362E3B] dark:text-[#F5E6D3] tracking-tight mb-4">
            {isEn ? 'Clear answers to common questions.' : 'إجابات واضحة لأهم التساؤلات الشائعة.'}
          </h2>
          <p className="text-base text-[#362E3B]/75 dark:text-[#D5D0CA] leading-relaxed">
            {isEn
              ? 'Everything you need to know about scheduling, the free trial, lesson lengths, and learning policies.'
              : 'كل ما تحتاج لمعرفته حول المواعيد، الجلسة التجريبية، ومدد الدروس وسياسة الحجز.'}
          </p>
        </motion.div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ scale: 1.005 }}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'bg-[#F5E6D3] dark:bg-[#29232F] border-[#87A878]/60 shadow-xs'
                    : 'bg-white dark:bg-[#231D28] border-[#D5D0CA] dark:border-[#3E3545] hover:border-[#87A878]/50'
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-start gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#87A878]"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-base sm:text-lg font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isOpen
                        ? 'bg-[#6B5B73] text-white'
                        : 'bg-[#F5E6D3] dark:bg-[#29232F] text-[#6B5B73] dark:text-[#B8A9C9]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 text-sm text-[#362E3B]/80 dark:text-[#D5D0CA] leading-relaxed border-t border-[#D5D0CA]/60 dark:border-[#3E3545]/50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
