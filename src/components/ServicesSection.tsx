import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, MessageSquare, Compass, Clock, Check, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { SERVICES_DATA, ARABIC_TRANSLATIONS } from '../data/content';
import { ServiceItem, Language } from '../types';

interface ServicesSectionProps {
  lang: Language;
  onSelectServiceForTrial: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ lang, onSelectServiceForTrial }) => {
  const isEn = lang === 'en';
  const [activePillarId, setActivePillarId] = useState<'quran' | 'islamic_studies' | 'arabic' | 'english'>('quran');
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<ServiceItem | null>(SERVICES_DATA[0].services[0]);

  const activePillar = SERVICES_DATA.find((p) => p.id === activePillarId) || SERVICES_DATA[0];

  const pillarIcons = {
    quran: BookOpen,
    islamic_studies: Compass,
    arabic: Sparkles,
    english: MessageSquare
  };

  return (
    <section
      id="services"
      className="py-20 md:py-28 bg-[#FFFFFF] dark:bg-[#1E1923] border-y border-[#D5D0CA] dark:border-[#3E3545] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Refined Editorial Rhythm */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-14"
        >
          <div className="text-xs uppercase tracking-widest text-[#6B5B73] dark:text-[#B8A9C9] font-medium mb-3">
            {isEn ? 'Core Teaching Areas' : ARABIC_TRANSLATIONS.services.sectionTag}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#362E3B] dark:text-[#F5E6D3] tracking-tight mb-4">
            {isEn
              ? '13 Personalized subjects, arranged around your journey.'
              : ARABIC_TRANSLATIONS.services.title}
          </h2>
          <p className="text-base text-[#362E3B]/75 dark:text-[#D5D0CA] leading-relaxed">
            {isEn
              ? 'Every student comes with different foundations and schedules. Rather than rigid mass courses, each lesson is designed 1-on-1 to match your exact starting point.'
              : ARABIC_TRANSLATIONS.services.subtitle}
          </p>
        </motion.div>

        {/* Pillar Navigation Bar */}
        <div className="flex flex-wrap gap-2.5 pb-6 border-b border-[#D5D0CA] dark:border-[#3E3545]">
          {SERVICES_DATA.map((pillar) => {
            const Icon = pillarIcons[pillar.id];
            const isActive = activePillarId === pillar.id;

            return (
              <motion.button
                key={pillar.id}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActivePillarId(pillar.id);
                  setSelectedServiceDetail(pillar.services[0]);
                }}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#6B5B73] text-white shadow-xs'
                    : 'bg-[#F5E6D3] dark:bg-[#29232F] text-[#362E3B]/80 dark:text-[#F5E6D3]/80 hover:bg-[#EDE3D4] dark:hover:bg-[#342D3B] border border-[#D5D0CA] dark:border-[#3E3545]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#87A878] dark:text-[#B8A9C9]'}`} />
                <span>{isEn ? pillar.title : pillar.arabicTitle}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md ${
                    isActive ? 'bg-white/25 text-white' : 'bg-[#D5D0CA] dark:bg-[#3E3545] text-[#362E3B]/80 dark:text-[#F5E6D3]/80'
                  }`}
                >
                  {pillar.services.length}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Asymmetrical Master-Detail Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Services List in Current Pillar (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9] mb-2 px-1">
              {isEn ? `${activePillar.title} Services` : activePillar.arabicTitle}
            </div>

            {activePillar.services.map((service) => {
              const isSelected = selectedServiceDetail?.id === service.id;

              return (
                <motion.div
                  key={service.id}
                  whileHover={{ y: -3, scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setSelectedServiceDetail(service)}
                  className={`group p-4.5 rounded-xl border text-start transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F5E6D3] dark:bg-[#29232F] border-[#87A878] shadow-sm'
                      : 'bg-white dark:bg-[#231D28] border-[#D5D0CA] dark:border-[#3E3545] hover:border-[#87A878]/60 hover:bg-[#F5E6D3]/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg font-medium text-[#362E3B] dark:text-[#F5E6D3] group-hover:text-[#6B5B73] dark:group-hover:text-[#B8A9C9] transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/80 mt-1 line-clamp-2 leading-relaxed">
                        {service.tagline}
                      </p>
                    </div>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-[#87A878] text-white shadow-xs'
                          : 'bg-[#F5E6D3] dark:bg-[#29232F] text-[#6B5B73] dark:text-[#B8A9C9] group-hover:bg-[#87A878]/20'
                      }`}
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    </motion.span>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-[11px] text-[#362E3B]/60 dark:text-[#D5D0CA]/70">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#87A878]" />
                      {service.durations.join(' / ')} mins
                    </span>
                    <span>•</span>
                    <span>{service.recommendedFrequency}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Detailed Syllabus & Practical Information (7 cols on lg) */}
          <div className="lg:col-span-7">
            {selectedServiceDetail && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedServiceDetail.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#F5E6D3] dark:bg-[#29232F] border border-[#87A878]/35 rounded-2xl p-6 sm:p-8"
                >
                  {/* Service Header */}
                  <div className="border-b border-[#D5D0CA] dark:border-[#3E3545] pb-6 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs uppercase tracking-widest text-[#6B5B73] dark:text-[#B8A9C9] font-semibold">
                        {activePillar.title}
                      </span>
                      <span className="text-[#362E3B]/30 dark:text-[#D5D0CA]/40">•</span>
                      <span className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/80">
                        {isEn ? '1-on-1 Zoom Instruction' : 'جلسات فردية عبر زووم'}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl text-[#362E3B] dark:text-[#F5E6D3] font-medium">
                      {selectedServiceDetail.name}
                    </h3>

                    <p className="text-sm text-[#362E3B]/80 dark:text-[#D5D0CA] leading-relaxed mt-3">
                      {selectedServiceDetail.description}
                    </p>
                  </div>

                  {/* Who Is It For */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#362E3B]/90 dark:text-[#F5E6D3]/90 mb-2">
                      {isEn ? 'Who this is designed for:' : ARABIC_TRANSLATIONS.services.whoLabel}
                    </h4>
                    <p className="text-sm text-[#362E3B]/80 dark:text-[#D5D0CA] bg-white dark:bg-[#231D28] p-3.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545]">
                      {selectedServiceDetail.whoIsItFor}
                    </p>
                  </div>

                  {/* What You Will Learn / Practical Outcomes */}
                  <div className="mb-8">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#362E3B]/90 dark:text-[#F5E6D3]/90 mb-3">
                      {isEn ? 'What we focus on together:' : ARABIC_TRANSLATIONS.services.learnLabel}
                    </h4>
                    <div className="space-y-2.5">
                      {selectedServiceDetail.whatYouWillLearn.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.06 }}
                          whileHover={{ x: isEn ? 4 : -4 }}
                          className="flex items-start gap-2.5 text-sm text-[#362E3B]/85 dark:text-[#F5E6D3]/85 p-1 rounded-lg hover:bg-white/40 dark:hover:bg-[#231D28]/40 transition-colors"
                        >
                          <Check className="w-4 h-4 text-[#87A878] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Lesson Formats & Action */}
                  <div className="pt-6 border-t border-[#D5D0CA] dark:border-[#3E3545] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/80">
                        {isEn ? 'Standard Lesson Lengths:' : ARABIC_TRANSLATIONS.services.durationsLabel}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedServiceDetail.durations.map((d) => (
                          <motion.span
                            key={d}
                            whileHover={{ scale: 1.08, y: -1 }}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-[#231D28] border border-[#D5D0CA] dark:border-[#3E3545] text-[#362E3B] dark:text-[#F5E6D3] shadow-2xs cursor-default"
                          >
                            {d} mins
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSelectServiceForTrial(selectedServiceDetail.id)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#6B5B73] hover:bg-[#584960] text-white text-sm font-medium shadow-xs hover:shadow-md transition-all cursor-pointer group"
                    >
                      <Calendar className="w-4 h-4 text-[#F5E6D3] group-hover:scale-110 transition-transform" />
                      <span>{isEn ? 'Try This in Free Trial' : ARABIC_TRANSLATIONS.services.tryInTrial}</span>
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
