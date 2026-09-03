import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Calendar, ArrowRight, Star } from 'lucide-react';
import { PortraitImage } from './PortraitImage';
import { Language } from '../types';

interface HeroProps {
  lang: Language;
  onOpenTrialModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onOpenTrialModal }) => {
  const isEn = lang === 'en';
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax shifts as user scrolls through the hero
  const portraitY = useTransform(smoothProgress, [0, 1], [0, 45]);
  const bgScale = useTransform(smoothProgress, [0, 1], [1, 1.05]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative overflow-hidden bg-white dark:bg-[#1E1923] pt-24 pb-16 md:pt-32 md:pb-24 transition-colors"
    >
      {/* Background Split Block: Sage Green on Right Column */}
      <motion.div
        style={{ scale: bgScale }}
        className="absolute top-0 right-0 bottom-0 w-full lg:w-[46%] bg-[#87A878] dark:bg-[#33422E] -z-0 hidden lg:block origin-top-right"
      >
        {/* Chalk-style decorative white marks / doodle stars in top-right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.85, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="absolute top-12 right-12 select-none pointer-events-none"
        >
          <svg width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 4-point stars and plus marks */}
            <path d="M20 10 L22 18 L30 20 L22 22 L20 30 L18 22 L10 20 L18 18 Z" fill="white" />
            <path d="M65 15 L66.5 21 L73 22.5 L66.5 24 L65 30 L63.5 24 L57 22.5 L63.5 21 Z" fill="white" opacity="0.9" />
            <path d="M45 40 L46 45 L51 46 L46 47 L45 52 L44 47 L39 46 L44 45 Z" fill="white" opacity="0.75" />
            <path d="M78 48 L79 53 L84 54 L79 55 L78 60 L77 55 L72 54 L77 53 Z" fill="white" opacity="0.85" />
            {/* Small cross marks */}
            <path d="M35 15 L43 23 M43 15 L35 23" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
            <path d="M75 32 L81 38 M81 32 L75 38" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
            <path d="M25 45 L31 51 M31 45 L25 51" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <path d="M58 55 L64 61 M64 55 L58 61" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          </svg>
        </motion.div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Description, Buttons, Social Proof (7 cols) */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.05,
                },
              },
            }}
            className="lg:col-span-7 flex flex-col items-start text-start lg:pr-8"
          >
            {/* Eyebrow with horizontal line: "Meet With ────" */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -12 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.45 } },
              }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="text-xs uppercase tracking-wider text-[#6B5B73] dark:text-[#B8A9C9] font-semibold">
                {isEn ? 'Meet With' : 'تعرّف على'}
              </span>
              <span className="w-12 h-[1.5px] bg-[#D5D0CA] dark:bg-[#3E3545] inline-block"></span>
            </motion.div>

            {/* High-Impact Display Headline with Highlighted Sage & Lavender Accents */}
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.14] tracking-tight text-[#362E3B] dark:text-[#F5E6D3] mb-6"
            >
              {isEn ? (
                <>
                  Personal{' '}
                  <span className="text-[#87A878] dark:text-[#A3BF96] font-semibold">Quran & Arabic</span>{' '}
                  with{' '}
                  <span className="text-[#87A878] dark:text-[#A3BF96] font-semibold">Expert</span>{' '}
                  Online Guidance{' '}
                  <motion.span
                    animate={{ rotate: [0, 15, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="inline-block text-[#B8A9C9] dark:text-[#B8A9C9] text-3xl sm:text-4xl align-middle font-sans"
                  >
                    ✳
                  </motion.span>
                </>
              ) : (
                <>
                  تعليم{' '}
                  <span className="text-[#87A878] dark:text-[#A3BF96] font-semibold">القرآن والعربية</span>{' '}
                  بإشراف{' '}
                  <span className="text-[#87A878] dark:text-[#A3BF96] font-semibold">أكاديمي</span>{' '}
                  وتوجيه فردي مباشر{' '}
                  <motion.span
                    animate={{ rotate: [0, 15, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="inline-block text-[#B8A9C9] dark:text-[#B8A9C9] text-3xl sm:text-4xl align-middle font-sans"
                  >
                    ✳
                  </motion.span>
                </>
              )}
            </motion.h1>

            {/* Clear, Human Value Proposition */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="text-base sm:text-lg text-[#362E3B]/80 dark:text-[#D5D0CA] leading-relaxed max-w-xl mb-8 font-normal"
            >
              {isEn ? (
                <>
                  Dedicated one-on-one lessons for adults returning to structured learning, youth,
                  and Muslim families living in Canada, the US, the UK, and Australia. Grounded in Al-Azhar
                  scholarship and taught with calm patience in fluent C1 English.
                </>
              ) : (
                <>
                  دروس فردية مباشرة ومخصصة للكبار الساعين للتعلم المنظم، والناشئة، والعائلات
                  المسلمة في المهجر. بإشراف أزهري وبنهج يقوم على الصبر والتدرج، مع إتقان تام للإنجليزية عند الحاجة.
                </>
              )}
            </motion.p>

            {/* Action Buttons: Solid Sage "Get Started Today" + Outlined Stone "Learn More" */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10"
            >
              <motion.button
                whileHover={{ scale: 1.025, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenTrialModal}
                id="hero-get-started-btn"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#87A878] hover:bg-[#729263] text-white font-medium text-base shadow-md shadow-[#87A878]/25 transition-all cursor-pointer group"
              >
                <span>{isEn ? 'Get Started Today' : 'ابدأ جلستك الأولى'}</span>
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.98 }}
                href="#services"
                id="hero-learn-more-btn"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-[#29232F] hover:bg-[#F5E6D3] dark:hover:bg-[#342D3B] text-[#362E3B] dark:text-[#F5E6D3] border border-[#D5D0CA] dark:border-[#3E3545] font-medium text-base transition-colors"
              >
                <span>{isEn ? 'Learn More' : 'استكشف المسارات'}</span>
              </motion.a>
            </motion.div>

            {/* Social Proof Strip */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              {/* Rating Badge */}
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 bg-[#F5E6D3] dark:bg-[#29232F] px-3.5 py-2 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] cursor-default shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.25, rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <Star className="w-3.5 h-3.5 fill-[#87A878] text-[#87A878]" />
                    </motion.div>
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#362E3B] dark:text-[#F5E6D3] tracking-tight">
                  5.0 Rating
                </span>
              </motion.div>

              {/* Overlapping Student Avatars Cluster */}
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                className="flex items-center cursor-default bg-white dark:bg-[#29232F] px-3 py-1.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] shadow-xs"
              >
                <div className="flex -space-x-2.5 overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1E1923] object-cover transition-transform cursor-pointer"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                    alt="Student Maryam"
                  />
                  <motion.img
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1E1923] object-cover transition-transform cursor-pointer"
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80"
                    alt="Student Tarek"
                  />
                  <motion.img
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1E1923] object-cover transition-transform cursor-pointer"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80"
                    alt="Student Sarah"
                  />
                  <motion.img
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1E1923] object-cover transition-transform cursor-pointer"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
                    alt="Student Omar"
                  />
                </div>
                <span className="ml-2.5 px-2.5 py-1 rounded-full bg-[#87A878]/20 dark:bg-[#87A878]/30 text-[#4C6B3E] dark:text-[#A3BF96] text-xs font-semibold">
                  +30 students taught
                </span>
              </motion.div>
            </motion.div>

          </motion.div>

          {/* Right Column: Ustadh Mahmoud Portrait Overlapping Split Boundary (5 cols) */}
          <motion.div
            style={{ y: portraitY }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col items-center justify-center relative z-20 py-4 lg:py-0"
          >
            {/* Mobile sage background card for small screens */}
            <div className="absolute inset-0 bg-[#87A878] rounded-3xl -z-10 lg:hidden transform scale-95 opacity-90"></div>
            
            <PortraitImage priority={true} />
          </motion.div>

        </div>
      </div>

      {/* Playful Organic Squiggle Loop centered below Hero with animated path */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        animate={{ y: [0, -3, 0] }}
        className="w-full flex justify-center mt-12 sm:mt-16 pointer-events-none select-none"
      >
        <svg
          width="110"
          height="32"
          viewBox="0 0 110 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#87A878] dark:text-[#B8A9C9]"
        >
          {/* Organic hand-drawn looping squiggle */}
          <motion.path
            d="M5 18 C12 6, 20 6, 26 18 C32 28, 40 28, 46 18 C52 8, 60 8, 66 18 C72 28, 80 28, 86 18 C92 8, 100 8, 105 18"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </svg>
      </motion.div>
    </section>
  );
};

