import React from 'react';
import { motion } from 'motion/react';
import { Calendar, CheckCircle2, ShieldAlert, Sparkles, MessageCircle } from 'lucide-react';
import { Language } from '../types';
import { ARABIC_TRANSLATIONS } from '../data/content';

interface FreeTrialSectionProps {
  lang: Language;
  onOpenTrialModal: () => void;
}

export const FreeTrialSection: React.FC<FreeTrialSectionProps> = ({ lang, onOpenTrialModal }) => {
  const isEn = lang === 'en';

  return (
    <section
      id="free-trial"
      className="py-20 md:py-28 bg-[#FFFFFF] dark:bg-[#1E1923] border-b border-[#D5D0CA] dark:border-[#3E3545] transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl bg-[#F5E6D3] dark:bg-[#29232F] border border-[#87A878]/35 p-8 sm:p-12 md:p-14 shadow-xs relative overflow-hidden"
        >
          
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-widest text-[#6B5B73] dark:text-[#B8A9C9] font-medium mb-4">
              {isEn ? 'No-Risk Introduction' : 'جلسة تعارف وتقييم مجانية'}
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#362E3B] dark:text-[#F5E6D3] tracking-tight leading-tight mb-6">
              {isEn
                ? 'Experience your first 30-minute lesson free of charge.'
                : ARABIC_TRANSLATIONS.trial.title}
            </h2>

            <p className="text-base sm:text-lg text-[#362E3B]/80 dark:text-[#D5D0CA] leading-relaxed mb-8">
              {isEn
                ? 'Choosing a teacher for yourself or your child is a personal decision. This session gives you a real feel for my demeanor, patience, and explanation style before you commit to anything.'
                : ARABIC_TRANSLATIONS.trial.subtitle}
            </p>

            {/* Key Outcomes in the Trial */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="group p-5 rounded-2xl bg-white dark:bg-[#231D28] border border-[#D5D0CA] dark:border-[#3E3545] hover:border-[#87A878] transition-all cursor-default shadow-2xs hover:shadow-sm"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9] mb-1 group-hover:text-[#87A878] transition-colors">
                  1. Get to Know You
                </div>
                <p className="text-xs text-[#362E3B]/75 dark:text-[#D5D0CA]/85 leading-relaxed">
                  {isEn
                    ? 'We discuss your background, previous learning, and specific goals.'
                    : 'نتعرف على أهدافك وما ترغب في تحقيقه بدقة.'}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="group p-5 rounded-2xl bg-white dark:bg-[#231D28] border border-[#D5D0CA] dark:border-[#3E3545] hover:border-[#87A878] transition-all cursor-default shadow-2xs hover:shadow-sm"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9] mb-1 group-hover:text-[#87A878] transition-colors">
                  2. Level Assessment
                </div>
                <p className="text-xs text-[#362E3B]/75 dark:text-[#D5D0CA]/85 leading-relaxed">
                  {isEn
                    ? 'Gentle diagnostic exercises to see where your strengths and gaps are.'
                    : 'تقييم مريح لمستواك الحالي بدون أي ضغط.'}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="group p-5 rounded-2xl bg-white dark:bg-[#231D28] border border-[#D5D0CA] dark:border-[#3E3545] hover:border-[#87A878] transition-all cursor-default shadow-2xs hover:shadow-sm"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9] mb-1 group-hover:text-[#87A878] transition-colors">
                  3. Mini-Lesson & Plan
                </div>
                <p className="text-xs text-[#362E3B]/75 dark:text-[#D5D0CA]/85 leading-relaxed">
                  {isEn
                    ? 'A live sample lesson and a clear, recommended weekly study roadmap.'
                    : 'شرح عينة حية وتقديم خطة تعليمية مقترحة تناسبك.'}
                </p>
              </motion.div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenTrialModal}
                id="free-trial-main-cta"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#6B5B73] hover:bg-[#584960] text-white font-medium text-base shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <Calendar className="w-5 h-5 text-[#F5E6D3] group-hover:scale-110 transition-transform" />
                <span>{isEn ? 'Book Free 30-Min Trial' : 'احجز جلستك المجانية الآن'}</span>
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                href="https://wa.me/201099616802?text=Assalamu%20Alaikum%20Ustadh%20Mahmoud,%20I%20have%20a%20question%20before%20booking%20a%20free%20trial."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-[#231D28] hover:bg-[#EDE3D4] dark:hover:bg-[#342D3B] text-[#362E3B] dark:text-[#F5E6D3] border border-[#D5D0CA] dark:border-[#3E3545] text-sm font-medium transition-all shadow-2xs hover:shadow-xs group"
              >
                <MessageCircle className="w-4 h-4 text-[#87A878] group-hover:scale-110 transition-transform" />
                <span>{isEn ? 'Message on WhatsApp First' : 'تحدث معي على واتساب أولاً'}</span>
              </motion.a>
            </div>

            {/* Free Trial Repeat Policy note */}
            <div className="flex items-center gap-2 text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/75">
              <ShieldAlert className="w-3.5 h-3.5 text-[#87A878] shrink-0" />
              <span>
                {isEn
                  ? 'Policy: One free trial per new student. Default duration is 30 minutes (up to 45 mins max). No credit card required.'
                  : ARABIC_TRANSLATIONS.trial.policy}
              </span>
            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
};
