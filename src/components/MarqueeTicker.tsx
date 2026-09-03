import React from 'react';
import { Sparkles, ShieldCheck, Globe, BookOpen, MessageSquare, Clock, Star, Award } from 'lucide-react';
import { Language } from '../types';

interface MarqueeTickerProps {
  lang: Language;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ lang }) => {
  const isEn = lang === 'en';

  const items = isEn
    ? [
        { icon: BookOpen, text: 'Quran Reading & Makharij' },
        { icon: Sparkles, text: 'Tajweed Rules & Application' },
        { icon: ShieldCheck, text: 'Al-Azhar University Graduate' },
        { icon: Star, text: 'Quran Memorization (Hifz)' },
        { icon: Globe, text: 'Modern Standard Arabic (Fusha)' },
        { icon: MessageSquare, text: 'Egyptian Colloquial Arabic' },
        { icon: Award, text: 'IELTS C1 English Certified' },
        { icon: Clock, text: 'Canada, US & UK Timezones' },
        { icon: Sparkles, text: 'Islamic Studies, Fiqh & Aqeedah' },
        { icon: ShieldCheck, text: 'Direct 1-on-1 • Zero Marketplace Markups' },
      ]
    : [
        { icon: BookOpen, text: 'قراءة القرآن ومخارج الحروف' },
        { icon: Sparkles, text: 'أحكام التجويد النظرية والعملية' },
        { icon: ShieldCheck, text: 'خريج جامعة الأزهر الشريف' },
        { icon: Star, text: 'حفظ ومراجعة القرآن الكريم' },
        { icon: Globe, text: 'اللغة العربية الفصحى' },
        { icon: MessageSquare, text: 'العامية المصرية والمحادثة' },
        { icon: Award, text: 'شهادة إتقان الإنجليزية C1' },
        { icon: Clock, text: 'مواعيد ملائمة لكندا وأمريكا وأوروبا' },
        { icon: Sparkles, text: 'الفقه والعقيدة والسيرة النبوية' },
        { icon: ShieldCheck, text: 'تعليم فردي مباشر دون منصات وسيطة' },
      ];

  // Duplicate for seamless infinite loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div
      id="marquee-ticker"
      className="relative overflow-hidden bg-white dark:bg-[#1A161E] border-y border-[#D5D0CA]/80 dark:border-[#3E3545] py-3 select-none transition-colors"
    >
      {/* Gradient Fades on edges for smooth appearance */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white dark:from-[#1A161E] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white dark:from-[#1A161E] to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {duplicatedItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 mx-4 sm:mx-6 px-3.5 py-1.5 rounded-full bg-[#F5E6D3]/40 dark:bg-[#26202C] border border-[#D5D0CA]/60 dark:border-[#3E3545] text-xs sm:text-sm font-medium text-[#362E3B] dark:text-[#F5E6D3] whitespace-nowrap"
            >
              <Icon className="w-3.5 h-3.5 text-[#87A878] dark:text-[#A3BF96] shrink-0" />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 45s linear infinite;
        }
        [dir="rtl"] .animate-marquee {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
};
