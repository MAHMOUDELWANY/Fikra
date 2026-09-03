import React from 'react';
import { motion } from 'motion/react';
import { Quote, MapPin, Clock, BookOpen } from 'lucide-react';
import { Language } from '../types';
import { AUTHENTIC_TESTIMONIALS, ARABIC_TRANSLATIONS } from '../data/content';

interface TestimonialsSectionProps {
  lang: Language;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ lang }) => {
  const isEn = lang === 'en';

  return (
    <section
      id="testimonials"
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
            {isEn ? 'Student & Parent Reflections' : ARABIC_TRANSLATIONS.nav.testimonials}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#362E3B] dark:text-[#F5E6D3] tracking-tight mb-4">
            {isEn ? 'Experiences from students across the globe.' : 'تجارب حقيقية لطلاب وأولياء أمور حول العالم.'}
          </h2>
          <p className="text-base text-[#362E3B]/75 dark:text-[#D5D0CA] leading-relaxed">
            {isEn
              ? 'Real feedback from international families and adult professionals who study 1-on-1 with Mahmoud.'
              : 'آراء وملاحظات من أسر ومهنيين يتعلمون مباشرة وبشكل فردي مع الأستاذ محمود.'}
          </p>
        </motion.div>

        {/* Editorial Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {AUTHENTIC_TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={{ y: -6, scale: 1.018 }}
              className="group p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545] flex flex-col justify-between relative shadow-xs hover:shadow-md hover:border-[#87A878] transition-all cursor-default"
            >
              <div>
                <motion.div whileHover={{ rotate: 10, scale: 1.15 }} className="inline-block">
                  <Quote className="w-8 h-8 text-[#87A878]/50 dark:text-[#B8A9C9]/35 group-hover:text-[#87A878] transition-colors mb-4" />
                </motion.div>
                <p className="font-serif text-base sm:text-lg text-[#362E3B] dark:text-[#F5E6D3] leading-relaxed italic">
                  “{testimonial.quote}”
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-[#D5D0CA] dark:border-[#3E3545]/60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#362E3B] dark:text-white group-hover:text-[#6B5B73] dark:group-hover:text-[#B8A9C9] transition-colors">
                      {testimonial.author}
                    </h3>
                    <p className="text-xs text-[#6B5B73] dark:text-[#B8A9C9] font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/80">
                    <MapPin className="w-3.5 h-3.5 text-[#87A878]" />
                    <span>{testimonial.location}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#362E3B]/70 dark:text-[#D5D0CA]/80">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#87A878]" />
                    {testimonial.subject}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#87A878]" />
                    {testimonial.durationWithMahmoud}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
