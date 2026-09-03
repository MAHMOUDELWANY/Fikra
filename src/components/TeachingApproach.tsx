import React from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { TEACHING_PILLARS, ARABIC_TRANSLATIONS } from '../data/content';

interface TeachingApproachProps {
  lang: Language;
}

export const TeachingApproach: React.FC<TeachingApproachProps> = ({ lang }) => {
  const isEn = lang === 'en';

  return (
    <section
      id="approach"
      className="py-20 md:py-28 bg-[#FFFFFF] dark:bg-[#1E1923] border-b border-[#D5D0CA] dark:border-[#3E3545] transition-colors"
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
            {isEn ? 'Teaching Philosophy' : 'منهجية التعليم'}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#362E3B] dark:text-[#F5E6D3] tracking-tight mb-4">
            {isEn
              ? 'Personalized teaching adapted to your level, pace, and life.'
              : 'تعليم شخصي يتكيف مع مستواك، سرعتك، وتفاصيل حياتك.'}
          </h2>
          <p className="text-base text-[#362E3B]/75 dark:text-[#D5D0CA] leading-relaxed">
            {isEn
              ? 'Effective learning does not come from memorizing rules in isolation. It comes from patient practice with a teacher who listens closely and corrects with kindness.'
              : 'التعلم الحقيقي لا يأتي من حفظ القواعد نظرياً، بل من الممارسة الصبورة مع معلم يستمع باهتمام ويصحح برفق.'}
          </p>
        </motion.div>

        {/* 4 Teaching Pillars with 3D Perspective Physics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{ perspective: '1200px' }}>
          {TEACHING_PILLARS.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24, rotateX: 6 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                y: -6,
                rotateX: 3,
                rotateY: index % 2 === 0 ? 3 : -3,
                scale: 1.02,
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className="group p-8 sm:p-10 rounded-2xl bg-[#F5E6D3] dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545] hover:border-[#87A878] transition-all flex flex-col justify-between cursor-default shadow-xs hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20"
            >
              <div>
                <motion.div
                  whileHover={{ scale: 1.15, x: 4 }}
                  className="inline-block font-serif text-3xl font-light text-[#87A878] dark:text-[#B8A9C9] mb-4 transition-transform group-hover:text-[#6B5B73] dark:group-hover:text-[#F5E6D3]"
                >
                  0{index + 1}
                </motion.div>
                <h3 className="font-serif text-xl font-medium text-[#362E3B] dark:text-[#F5E6D3] mb-3 group-hover:text-[#6B5B73] dark:group-hover:text-[#B8A9C9] transition-colors">
                  {isEn ? pillar.title : pillar.arabicTitle}
                </h3>
                <p className="text-sm text-[#362E3B]/80 dark:text-[#D5D0CA] leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#D5D0CA] dark:border-[#3E3545]/60 text-xs text-[#6B5B73] dark:text-[#B8A9C9] font-medium tracking-wider uppercase flex items-center justify-between">
                <span>{isEn ? `Foundational Pillar 0${index + 1}` : `الركن التعليمي ٠${index + 1}`}</span>
                <span className="w-2 h-2 rounded-full bg-[#87A878] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
