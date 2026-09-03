import React from 'react';
import { motion } from 'motion/react';
import { Globe, MessageCircle, Mail, ArrowUp } from 'lucide-react';
import { Language } from '../types';
import { ARABIC_TRANSLATIONS } from '../data/content';

interface FooterProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenTrialModal: () => void;
  onOpenManageModal?: () => void;
  onOpenTeacherModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onToggleLang,
  onOpenTrialModal,
  onOpenManageModal,
  onOpenTeacherModal
}) => {
  const isEn = lang === 'en';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FFFFFF] dark:bg-[#18141C] border-t border-[#D5D0CA] dark:border-[#3E3545] py-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#D5D0CA] dark:border-[#3E3545]">
          
          {/* Brand & Purpose (5 cols on md) */}
          <div className="md:col-span-5 space-y-4">
            <a href="#" className="font-serif text-2xl font-medium text-[#362E3B] dark:text-[#F5E6D3] tracking-tight">
              Mahmoud
            </a>
            <p className="text-xs sm:text-sm text-[#362E3B]/70 dark:text-[#D5D0CA] leading-relaxed max-w-sm">
              {isEn
                ? 'Direct 1-on-1 teaching in Quran reading, Tajweed, Arabic language, and Islamic Studies. Based in Cairo, Egypt, serving international students and Muslim families worldwide.'
                : 'تعليم فردي مباشر للقرآن الكريم، وأحكام التجويد، واللغة العربية، والدراسات الإسلامية للطلاب الدوليين والعائلات المسلمة حول العالم.'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onToggleLang}
                className="inline-flex items-center gap-1.5 text-xs text-[#6B5B73] dark:text-[#B8A9C9] hover:underline cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isEn ? 'Switch to العربية' : 'التحويل إلى English'}</span>
              </motion.button>
            </div>
          </div>

          {/* Quick Navigation (4 cols on md) */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <div className="font-semibold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9] text-xs mb-3">
                {isEn ? 'Teaching' : 'الدروس والبرامج'}
              </div>
              <ul className="space-y-2 text-[#362E3B]/75 dark:text-[#D5D0CA]/85">
                <li>
                  <a href="#services" className="hover:text-[#362E3B] dark:hover:text-white transition-colors">
                    {isEn ? 'Quran & Tajweed' : 'القرآن والتجويد'}
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-[#362E3B] dark:hover:text-white transition-colors">
                    {isEn ? 'Islamic Studies' : 'الدراسات الإسلامية'}
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-[#362E3B] dark:hover:text-white transition-colors">
                    {isEn ? 'Arabic Language' : 'اللغة العربية'}
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-[#362E3B] dark:hover:text-white transition-colors">
                    {isEn ? 'English Coaching' : 'اللغة الإنجليزية'}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-semibold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9] text-xs mb-3">
                {isEn ? 'Experience' : 'التجربة'}
              </div>
              <ul className="space-y-2 text-[#362E3B]/75 dark:text-[#D5D0CA]/85">
                <li>
                  <a href="#about" className="hover:text-[#362E3B] dark:hover:text-white transition-colors">
                    {isEn ? 'About Mahmoud' : 'عن المعلم'}
                  </a>
                </li>
                <li>
                  <a href="#approach" className="hover:text-[#362E3B] dark:hover:text-white transition-colors">
                    {isEn ? 'Our Approach' : 'المنهجية'}
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[#362E3B] dark:hover:text-white transition-colors">
                    {isEn ? 'How It Works' : 'كيف نعمل'}
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-[#362E3B] dark:hover:text-white transition-colors">
                    {isEn ? 'Student Reviews' : 'آراء الطلاب'}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Action & Contact (3 cols on md) */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-semibold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9] text-xs mb-2">
              {isEn ? 'Get Started' : 'ابدأ الآن'}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenTrialModal}
              className="w-full py-2.5 px-4 rounded-xl bg-[#6B5B73] hover:bg-[#584960] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              {isEn ? 'Book Free 30-Min Trial' : 'احجز جلسة تجريبية مجانية'}
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              href="https://wa.me/201099616802"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] text-xs text-[#362E3B] dark:text-[#D5D0CA] hover:bg-[#F5E6D3] dark:hover:bg-[#29232F] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#87A878]" />
              <span>WhatsApp: +20 109 961 6802</span>
            </motion.a>
          </div>

        </div>

        {/* Bottom Credits & Policies */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#362E3B]/60 dark:text-[#D5D0CA]/60">
          <div>
            © {new Date().getFullYear()} Mahmoud. {isEn ? 'Personal Teaching Practice. All rights reserved.' : 'جميع الحقوق محفوظة للأستاذ محمود.'}
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>{isEn ? '3-Hour Reschedule Policy' : 'إعادة الجدولة حتى ٣ ساعات قبل الدرس'}</span>
            <span>•</span>
            {onOpenManageModal ? (
              <button
                type="button"
                onClick={onOpenManageModal}
                className="text-[#6B5B73] dark:text-[#B8A9C9] hover:underline font-medium cursor-pointer"
              >
                {isEn ? 'Manage or Reschedule Booking' : 'إدارة أو تعديل الحجز'}
              </button>
            ) : (
              <span>{isEn ? 'Guest Booking Supported' : 'حجز مرن ومباشر'}</span>
            )}
            {onOpenTeacherModal && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={onOpenTeacherModal}
                  className="text-[#87A878] hover:underline font-medium cursor-pointer flex items-center gap-1"
                >
                  <span>{isEn ? 'Teacher Portal (Phase 3)' : 'بوابة المعلم (المرحلة ٣)'}</span>
                </button>
              </>
            )}
            <span>•</span>
            <motion.button
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="p-2 rounded-lg hover:bg-[#EDE3D4] dark:hover:bg-[#29232F] text-[#362E3B]/70 dark:text-[#D5D0CA]/70 transition-colors cursor-pointer"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

      </div>
    </footer>
  );
};
