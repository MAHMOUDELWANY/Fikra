import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, BookOpen, Compass, Languages, GraduationCap, ArrowRight } from 'lucide-react';
import { BOOKING_SERVICES } from '../../booking/mockData';
import { Language, ServiceGroupKey } from '../../booking/types';

interface StepServiceSelectProps {
  selectedServiceId: string;
  onSelectService: (serviceId: string) => void;
  onNext: () => void;
  lang: Language;
}

export const StepServiceSelect: React.FC<StepServiceSelectProps> = ({
  selectedServiceId,
  onSelectService,
  onNext,
  lang
}) => {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState<ServiceGroupKey | 'all'>('all');

  const groups: { key: ServiceGroupKey | 'all'; label: string; arabicLabel: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Disciplines', arabicLabel: 'جميع المواد', icon: <GraduationCap className="w-4 h-4" /> },
    { key: 'quran', label: 'Quran & Tajweed', arabicLabel: 'القرآن والتجويد', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'islamic_studies', label: 'Islamic Studies', arabicLabel: 'الدراسات الإسلامية', icon: <Compass className="w-4 h-4" /> },
    { key: 'arabic', label: 'Arabic Language', arabicLabel: 'اللغة العربية', icon: <Languages className="w-4 h-4" /> },
    { key: 'english', label: 'English', arabicLabel: 'اللغة الإنجليزية', icon: <GraduationCap className="w-4 h-4" /> }
  ];

  const filteredServices = activeTab === 'all'
    ? BOOKING_SERVICES
    : BOOKING_SERVICES.filter((s) => s.group === activeTab);

  const selectedService = BOOKING_SERVICES.find((s) => s.id === selectedServiceId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm sm:text-base text-[#362E3B]/80 dark:text-[#D5D0CA] leading-relaxed max-w-2xl">
          {isEn
            ? 'Choose the primary subject you would like to work on with Mahmoud. In a 1-on-1 setting, every lesson is adapted directly to your current level, whether you are starting from the alphabet or seeking advanced mastery.'
            : 'اختر المادة الأساسية التي ترغب في تعلمها مع محمود. في الدروس الفردية ١-على-١، تُصمم كل جلسة لتناسب مستواك وتطلعاتك الشخصية بدقة.'}
        </p>
      </div>

      {/* Group Navigation Filter */}
      <div className="flex flex-wrap gap-2 pb-1">
        {groups.map((grp) => {
          const isActive = activeTab === grp.key;
          return (
            <button
              key={grp.key}
              type="button"
              onClick={() => setActiveTab(grp.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#6B5B73] text-white shadow-xs'
                  : 'bg-white/80 dark:bg-[#231D28] text-[#362E3B]/70 dark:text-[#D5D0CA]/70 border border-[#D5D0CA] dark:border-[#3E3545] hover:bg-[#EDE3D4] dark:hover:bg-[#29232F]'
              }`}
            >
              {grp.icon}
              <span>{isEn ? grp.label : grp.arabicLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1.5 focus:outline-none">
        {filteredServices.map((service) => {
          const isSelected = selectedServiceId === service.id;
          return (
            <motion.div
              key={service.id}
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onSelectService(service.id)}
              className={`group p-4 sm:p-5 rounded-2xl border text-start transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#F5E6D3] dark:bg-[#29232F] border-[#87A878] ring-2 ring-[#87A878]/30 shadow-sm'
                  : 'bg-white dark:bg-[#231D28] border-[#D5D0CA] dark:border-[#3E3545] hover:border-[#87A878]/60 hover:bg-[#F5E6D3]/40 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h3 className="font-serif text-base sm:text-lg font-medium text-[#362E3B] dark:text-[#F5E6D3] group-hover:text-[#6B5B73] dark:group-hover:text-[#B8A9C9] transition-colors leading-snug">
                    {isEn ? service.name : service.arabicName}
                  </h3>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? 'bg-[#87A878] text-white'
                        : 'border border-[#D5D0CA] dark:border-[#3E3545] text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>

                <p className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/80 leading-relaxed mb-3">
                  {isEn ? service.tagline : service.arabicTagline}
                </p>
              </div>

              <div className="pt-2 border-t border-[#D5D0CA]/60 dark:border-[#3E3545]/60 flex items-center justify-between text-[11px] text-[#362E3B]/60 dark:text-[#D5D0CA]/60">
                <span>
                  {isEn ? 'Available lengths:' : 'المدد المتاحة:'} 30, 45, 60m
                </span>
                <span className="font-medium text-[#6B5B73] dark:text-[#B8A9C9]">
                  {isEn ? `Rate baseline: $${service.hourlyRateUsd}/hr` : `المعدل الأساسي: $${service.hourlyRateUsd}/ساعة`}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Confirmation Bar & Next Action */}
      <div className="pt-4 border-t border-[#D5D0CA] dark:border-[#3E3545] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/70 text-center sm:text-start">
          {selectedService ? (
            <span>
              {isEn ? 'Selected: ' : 'تم اختيار: '}
              <strong className="text-[#362E3B] dark:text-[#F5E6D3]">
                {isEn ? selectedService.name : selectedService.arabicName}
              </strong>
            </span>
          ) : (
            <span>{isEn ? 'Please choose a subject to proceed.' : 'يرجى اختيار المادة للمتابعة.'}</span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={!selectedServiceId}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#6B5B73] hover:bg-[#584960] text-white text-sm font-medium shadow-xs disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <span>{isEn ? 'Next: Define Your Goal' : 'التالي: حدد هدفك'}</span>
          <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>
    </div>
  );
};
