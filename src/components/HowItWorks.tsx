import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Video, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { HOW_IT_WORKS_STEPS, ARABIC_TRANSLATIONS } from '../data/content';

interface HowItWorksProps {
  lang: Language;
  onOpenTrialModal: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang, onOpenTrialModal }) => {
  const isEn = lang === 'en';

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-[#F5E6D3] dark:bg-[#1E1923] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <div className="text-xs uppercase tracking-widest text-[#6B5B73] dark:text-[#B8A9C9] font-medium mb-3">
            {isEn ? 'The Student Journey' : ARABIC_TRANSLATIONS.nav.howItWorks}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#362E3B] dark:text-[#F5E6D3] tracking-tight mb-4">
            {isEn
              ? 'From your first trial to confident, consistent learning.'
              : 'من جلستك الأولى إلى إتقان حقيقي ومستمر.'}
          </h2>
          <p className="text-base text-[#362E3B]/75 dark:text-[#D5D0CA] leading-relaxed">
            {isEn
              ? 'A straightforward 4-step process designed to respect your time and remove all friction from starting.'
              : 'أربع خطوات واضحة وميسرة لبدء رحلتك التعليمية بدون أي تعقيد أو التزامات مسبقة.'}
          </p>
        </motion.div>

        {/* Timeline / Sequential Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="relative p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545] flex flex-col justify-between hover:border-[#87A878] transition-all group shadow-xs hover:shadow-md cursor-default"
            >
              <div>
                {/* Step Number */}
                <div className="flex items-center justify-between mb-5">
                  <motion.span
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="font-serif text-3xl font-light text-[#87A878] dark:text-[#B8A9C9] group-hover:text-[#6B5B73] dark:group-hover:text-[#F5E6D3] transition-colors"
                  >
                    {step.step}
                  </motion.span>
                  <span className="text-[11px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-[#F5E6D3] dark:bg-[#231D28] text-[#6B5B73] dark:text-[#B8A9C9] group-hover:bg-[#87A878]/20 transition-colors">
                    {step.highlight}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-medium text-[#362E3B] dark:text-[#F5E6D3] mb-3 leading-snug group-hover:text-[#6B5B73] dark:group-hover:text-[#B8A9C9] transition-colors">
                  {isEn ? step.title : step.arabicTitle}
                </h3>

                <p className="text-xs sm:text-sm text-[#362E3B]/75 dark:text-[#D5D0CA] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#D5D0CA]/60 dark:border-[#3E3545]/60 flex items-center justify-between text-xs font-medium text-[#6B5B73] dark:text-[#B8A9C9]">
                <span>{isEn ? `Stage ${index + 1}` : `المرحلة ${index + 1}`}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#87A878] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -2 }}
          className="mt-12 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#29232F] border border-[#87A878]/35 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs hover:shadow-md transition-all"
        >
          <div>
            <h4 className="font-serif text-xl font-medium text-[#362E3B] dark:text-[#F5E6D3]">
              {isEn ? 'Ready to experience Mahmoud’s teaching style?' : 'هل ترغب في تجربة أسلوب الشرح والتدريس؟'}
            </h4>
            <p className="text-xs sm:text-sm text-[#362E3B]/70 dark:text-[#D5D0CA]/80 mt-1">
              {isEn
                ? 'Your free trial is 30 minutes. No credit card, no pressure, zero obligation.'
                : 'جلستك التجريبية مدتها ٣٠ دقيقة مجانية تماماً وبدون أي بطاقة بنكية.'}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenTrialModal}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#6B5B73] hover:bg-[#584960] text-white font-medium text-sm shadow-xs hover:shadow-sm transition-all cursor-pointer group"
          >
            <Calendar className="w-4 h-4 text-[#F5E6D3] group-hover:scale-110 transition-transform" />
            <span>{isEn ? 'Book Free Trial Now' : 'احجز جلستك الآن'}</span>
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
};
