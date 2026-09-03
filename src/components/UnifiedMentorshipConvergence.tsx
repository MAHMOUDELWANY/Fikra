import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Check, ArrowRight, ShieldCheck, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface UnifiedMentorshipConvergenceProps {
  lang: Language;
  onOpenTrialModal: () => void;
}

export const UnifiedMentorshipConvergence: React.FC<UnifiedMentorshipConvergenceProps> = ({
  lang,
  onOpenTrialModal,
}) => {
  const isEn = lang === 'en';
  const isRtl = lang === 'ar';
  const sectionRef = useRef<HTMLDivElement>(null);

  // Allow manual toggle or scroll-driven state
  const [manualUnified, setManualUnified] = useState<boolean | null>(null);

  // Scroll Progress for sticky container
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  // Separate Cards (Top 3) animations
  // When scroll progresses: they move toward center, scale down, and fade out as unified card emerges
  const separateCardsOpacity = useTransform(smoothProgress, [0, 0.4, 0.65], [1, 0.85, 0]);
  const separateCardsScale = useTransform(smoothProgress, [0, 0.45, 0.65], [1, 0.94, 0.88]);
  const separateCardsY = useTransform(smoothProgress, [0, 0.45, 0.65], [0, 15, 35]);

  // Card convergence translations
  const leftCardX = useTransform(smoothProgress, [0.1, 0.55], [0, isRtl ? -60 : 60]);
  const rightCardX = useTransform(smoothProgress, [0.1, 0.55], [0, isRtl ? 60 : -60]);

  // SVG Connector Lines animation (pathLength 0 to 1 as cards converge)
  const lineProgress = useTransform(smoothProgress, [0.2, 0.6], [0, 1]);
  const nodeOpacity = useTransform(smoothProgress, [0.25, 0.45, 0.7], [0, 1, 0]);
  const nodeScale = useTransform(smoothProgress, [0.25, 0.45, 0.7], [0.6, 1, 0.9]);

  // Unified Single Card animation (Emerges at ~0.55, fully locked at 0.75)
  const unifiedCardOpacity = useTransform(smoothProgress, [0.45, 0.7], [0, 1]);
  const unifiedCardScale = useTransform(smoothProgress, [0.45, 0.75], [0.88, 1]);
  const unifiedCardY = useTransform(smoothProgress, [0.45, 0.75], [40, 0]);

  return (
    <section
      ref={sectionRef}
      id="unified-mentorship"
      className="relative bg-[#F8F6F0] dark:bg-[#1A161E] py-20 lg:py-32 border-b border-[#D5D0CA]/80 dark:border-[#3E3545] transition-colors"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-[#87A878]/10 dark:bg-[#87A878]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Sticky Narrative (Mirrors 00:01 in video) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            
            {/* Index Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#87A878]/15 dark:bg-[#87A878]/25 border border-[#87A878]/30 text-[#446237] dark:text-[#A3BF96] text-xs font-semibold tracking-wide">
              <span className="font-mono text-[11px] font-bold">01</span>
              <span>
                {isEn ? 'One Mentorship Instead of Scattered Bills' : 'معلم مباشر واحد بدلاً من تشتت الاشتراكات'}
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#362E3B] dark:text-[#F5E6D3] leading-[1.18] tracking-tight">
              {isEn ? (
                <>
                  Does every new subject need a new tutor?{' '}
                  <span className="text-[#87A878] dark:text-[#A3BF96]">Not with Mahmoud.</span>
                </>
              ) : (
                <>
                  هل تحتاج إلى معلم واشتراك منفصل لكل مادة؟{' '}
                  <span className="text-[#87A878] dark:text-[#A3BF96]">مع الأستاذ محمود، الحل واحد.</span>
                </>
              )}
            </h2>

            {/* Body Copy */}
            <p className="text-base sm:text-lg text-[#362E3B]/75 dark:text-[#D5D0CA] leading-relaxed">
              {isEn
                ? 'Instead of juggling three different platforms, rotating strangers, and conflicting timezones for Quran, Arabic, and Islamic Studies—receive one cohesive, personal curriculum tailored to you or your child.'
                : 'بدلاً من إدارة ثلاث منصات مختلفة، ومعلمين غرباء يتغيرون باستمرار، ومواعيد متضاربة—احصل على منهج شخصي متكامل وشامل تحت إشراف معلم أزهري واحد يعرف مستواك ونقاط قوتك.'}
            </p>

            {/* Interactive Toggle for Direct Visual Comparison */}
            <div className="pt-2">
              <div className="inline-flex p-1 rounded-xl bg-white dark:bg-[#26202C] border border-[#D5D0CA] dark:border-[#3E3545] shadow-xs gap-1">
                <button
                  onClick={() => setManualUnified(false)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    manualUnified === false
                      ? 'bg-[#362E3B] dark:bg-white text-white dark:text-[#1E1923] shadow-xs'
                      : 'text-[#6B5B73] dark:text-[#B8A9C9] hover:text-[#362E3B]'
                  }`}
                >
                  {isEn ? 'Scattered Marketplaces' : 'المنصات المتفرقة'}
                </button>
                <button
                  onClick={() => setManualUnified(true)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    manualUnified === true || manualUnified === null
                      ? 'bg-[#87A878] text-white shadow-xs'
                      : 'text-[#6B5B73] dark:text-[#B8A9C9] hover:text-[#362E3B]'
                  }`}
                >
                  {isEn ? '★ One Mentorship' : '★ إشراف محمود الموحد'}
                </button>
              </div>
            </div>

            {/* Bottom summary note */}
            <div className="pt-4 border-t border-[#D5D0CA]/80 dark:border-[#3E3545]/80 text-xs sm:text-sm text-[#6B5B73] dark:text-[#B8A9C9]">
              {isEn ? (
                <>
                  <span className="font-semibold text-[#362E3B] dark:text-[#F5E6D3]">
                    13 disciplines.
                  </span>{' '}
                  One teacher who knows your voice. One clean direct relationship.
                </>
              ) : (
                <>
                  <span className="font-semibold text-[#362E3B] dark:text-[#F5E6D3]">
                    ١٣ تخصصاً تعليمياً.
                  </span>{' '}
                  معلم واحد يتابع صوتك وتطورك خطوة بخطوة.
                </>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: The Convergence Stage (Mirrors 00:01 - 00:04 in video) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 relative min-h-[580px] sm:min-h-[640px] flex flex-col justify-center">
            
            {/* Context Badge at top */}
            <div className="flex items-center justify-between mb-6 px-1">
              <span className="text-xs font-semibold text-[#6B5B73] dark:text-[#B8A9C9] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#D97706]" />
                {isEn ? 'Traditional fragmented model' : 'النموذج التقليدي المشتت'}
              </span>
              <span className="text-xs font-mono text-[#87A878] dark:text-[#A3BF96]">
                {manualUnified || manualUnified === null ? 'Unified Model' : '3 Disconnected Subscriptions'}
              </span>
            </div>

            {/* Stage wrapper for Card Collapse and Connector Lines */}
            <div className="relative">

              {/* ------------------------------------------------------------- */}
              {/* TOP: 3 Separate Disconnected Subscription Cards */}
              {/* ------------------------------------------------------------- */}
              <motion.div
                style={{
                  opacity: manualUnified === true ? 0 : manualUnified === false ? 1 : separateCardsOpacity,
                  scale: manualUnified === true ? 0.9 : manualUnified === false ? 1 : separateCardsScale,
                  y: manualUnified === true ? 20 : manualUnified === false ? 0 : separateCardsY,
                  pointerEvents: manualUnified === true ? 'none' : 'auto',
                }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 relative z-10"
              >
                {/* Card 1: Quran Tutor on Marketplace */}
                <motion.div
                  style={{ x: leftCardX }}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#231E2A] border border-[#D5D0CA] dark:border-[#3E3545] shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#6B5B73] dark:text-[#B8A9C9] mb-2">
                      <span>01</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[#D97706] font-semibold">
                        Separate
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-semibold text-[#362E3B] dark:text-[#F5E6D3] mb-1">
                      {isEn ? 'Quran Platform' : 'منصة تجويد متفرقة'}
                    </h3>
                    <p className="text-xs text-[#6B5B73] dark:text-[#B8A9C9] leading-relaxed mb-3">
                      {isEn ? 'Rotating strangers, marketplace commission, no long-term rapport.' : 'معلمون متغيرون وعمولات وساطة باهظة.'}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-red-500/90 dark:text-red-400/90 pt-2 border-t border-[#D5D0CA]/60 dark:border-[#3E3545]/60">
                    {isEn ? 'Separate Subscription' : 'اشتراك منفصل'}
                  </div>
                </motion.div>

                {/* Card 2: Arabic Group Academy */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#231E2A] border border-[#D5D0CA] dark:border-[#3E3545] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#6B5B73] dark:text-[#B8A9C9] mb-2">
                      <span>02</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[#D97706] font-semibold">
                        Separate
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-semibold text-[#362E3B] dark:text-[#F5E6D3] mb-1">
                      {isEn ? 'Arabic Academy' : 'أكاديمية عربية'}
                    </h3>
                    <p className="text-xs text-[#6B5B73] dark:text-[#B8A9C9] leading-relaxed mb-3">
                      {isEn ? 'Mass zoom calls, rigid textbook speed, zero speaking correction.' : 'فصول جماعية وسرعة منهج ثابتة لا تراعي الفروق.'}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-red-500/90 dark:text-red-400/90 pt-2 border-t border-[#D5D0CA]/60 dark:border-[#3E3545]/60">
                    {isEn ? 'Separate Subscription' : 'اشتراك منفصل'}
                  </div>
                </div>

                {/* Card 3: Weekend Islamic School */}
                <motion.div
                  style={{ x: rightCardX }}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#231E2A] border border-[#D5D0CA] dark:border-[#3E3545] shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#6B5B73] dark:text-[#B8A9C9] mb-2">
                      <span>03</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[#D97706] font-semibold">
                        Separate
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-semibold text-[#362E3B] dark:text-[#F5E6D3] mb-1">
                      {isEn ? 'Islamic Studies' : 'مدرسة عطلة الأسبوع'}
                    </h3>
                    <p className="text-xs text-[#6B5B73] dark:text-[#B8A9C9] leading-relaxed mb-3">
                      {isEn ? 'Commute fatigue, general lecture format, no 1-on-1 Q&A space.' : 'إرهاق تنقل ومحاضرات عامة دون مساحة للأسئلة.'}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-red-500/90 dark:text-red-400/90 pt-2 border-t border-[#D5D0CA]/60 dark:border-[#3E3545]/60">
                    {isEn ? 'Separate Subscription' : 'اشتراك منفصل'}
                  </div>
                </motion.div>
              </motion.div>

              {/* ------------------------------------------------------------- */}
              {/* MIDDLE: Dynamic SVG Connector Lines Converging (Video 00:02) */}
              {/* ------------------------------------------------------------- */}
              <div className="relative h-20 sm:h-28 w-full flex items-center justify-center pointer-events-none">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 600 120"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  {/* Left Connector Curve */}
                  <motion.path
                    d="M 100 0 C 100 60, 300 60, 300 120"
                    stroke="#87A878"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    style={{
                      pathLength: manualUnified === true ? 1 : manualUnified === false ? 0 : lineProgress,
                      opacity: manualUnified === true ? 0.4 : manualUnified === false ? 0 : 0.8,
                    }}
                  />
                  {/* Center Connector Vertical */}
                  <motion.path
                    d="M 300 0 L 300 120"
                    stroke="#87A878"
                    strokeWidth="2.5"
                    style={{
                      pathLength: manualUnified === true ? 1 : manualUnified === false ? 0 : lineProgress,
                      opacity: manualUnified === true ? 0.6 : manualUnified === false ? 0 : 1,
                    }}
                  />
                  {/* Right Connector Curve */}
                  <motion.path
                    d="M 500 0 C 500 60, 300 60, 300 120"
                    stroke="#87A878"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    style={{
                      pathLength: manualUnified === true ? 1 : manualUnified === false ? 0 : lineProgress,
                      opacity: manualUnified === true ? 0.4 : manualUnified === false ? 0 : 0.8,
                    }}
                  />
                </svg>

                {/* Central Hub Node Icon [...] from video */}
                <motion.div
                  style={{
                    opacity: manualUnified === true ? 0 : manualUnified === false ? 0 : nodeOpacity,
                    scale: manualUnified === true ? 0.5 : manualUnified === false ? 0.5 : nodeScale,
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-[#87A878] text-white text-xs font-mono font-bold tracking-widest shadow-md shadow-[#87A878]/30 flex items-center gap-1"
                >
                  <span>•</span>
                  <span>•</span>
                  <span>•</span>
                </motion.div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* BOTTOM: One Unified Prestige Card (Video 00:03 - 00:04) */}
              {/* ------------------------------------------------------------- */}
              <motion.div
                style={{
                  opacity: manualUnified === false ? 0.15 : manualUnified === true ? 1 : unifiedCardOpacity,
                  scale: manualUnified === false ? 0.95 : manualUnified === true ? 1 : unifiedCardScale,
                  y: manualUnified === false ? 20 : manualUnified === true ? 0 : unifiedCardY,
                }}
                className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#26202C] border-2 border-[#87A878] shadow-2xl shadow-[#87A878]/15 dark:shadow-black/60 transition-all z-20"
              >
                {/* Floating "Direct Teacher Model" Badge */}
                <div className="absolute -top-3.5 right-6 sm:right-8 px-3.5 py-1 rounded-full bg-[#87A878] text-white text-[11px] font-semibold tracking-wide shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEn ? 'All In One Direct Mentorship' : 'منهج موحد بإشراف مباشر'}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5D0CA]/80 dark:border-[#3E3545] pb-6 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#87A878]" />
                      <span className="font-serif text-xl sm:text-2xl font-bold text-[#362E3B] dark:text-[#F5E6D3]">
                        {isEn ? 'Ustadh Mahmoud Eldwany' : 'الأستاذ محمود الدواني'}
                      </span>
                      <ShieldCheck className="w-5 h-5 text-[#87A878]" />
                    </div>
                    <p className="text-xs sm:text-sm text-[#6B5B73] dark:text-[#B8A9C9]">
                      {isEn
                        ? 'Al-Azhar University Graduate • C1 English • 3+ Years International Experience'
                        : 'خريج الأزهر الشريف • إنجليزية بطلاقة C1 • خبرة ٣+ سنوات مع طلاب الغرب'}
                    </p>
                  </div>

                  {/* Pricing / Trial pill */}
                  <div className="sm:text-right shrink-0">
                    <div className="text-xs font-mono text-[#87A878] dark:text-[#A3BF96] font-semibold uppercase tracking-wider">
                      {isEn ? 'First Session' : 'الجلسة الأولى'}
                    </div>
                    <div className="font-serif text-2xl sm:text-3xl font-bold text-[#362E3B] dark:text-[#F5E6D3]">
                      {isEn ? '100% Free' : 'مجانية تماماً'}
                    </div>
                    <div className="text-[11px] text-[#6B5B73] dark:text-[#B8A9C9]">
                      {isEn ? '30 Min Assessment & Mini Lesson' : '٣٠ دقيقة تقييم ودرس مصغر'}
                    </div>
                  </div>
                </div>

                {/* 3 Unified Pillar Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-[#F8F6F0] dark:bg-[#1E1923] border border-[#D5D0CA]/70 dark:border-[#3E3545]">
                    <div className="text-xs font-semibold text-[#446237] dark:text-[#A3BF96] mb-1 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#87A878]" />
                      <span>{isEn ? 'Quran & Tajweed' : 'القرآن والتجويد'}</span>
                    </div>
                    <div className="text-[11px] text-[#362E3B]/75 dark:text-[#D5D0CA]">
                      {isEn ? 'Reading, Hifz, Makharij & Revision' : 'القراءة، الحفظ، المخارج والمراجعة'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8F6F0] dark:bg-[#1E1923] border border-[#D5D0CA]/70 dark:border-[#3E3545]">
                    <div className="text-xs font-semibold text-[#446237] dark:text-[#A3BF96] mb-1 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#87A878]" />
                      <span>{isEn ? 'Arabic Language' : 'اللغة العربية'}</span>
                    </div>
                    <div className="text-[11px] text-[#362E3B]/75 dark:text-[#D5D0CA]">
                      {isEn ? 'Fusha & Egyptian Conversation' : 'الفصحى والمحادثة والعامية المصرية'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8F6F0] dark:bg-[#1E1923] border border-[#D5D0CA]/70 dark:border-[#3E3545]">
                    <div className="text-xs font-semibold text-[#446237] dark:text-[#A3BF96] mb-1 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#87A878]" />
                      <span>{isEn ? 'Islamic Studies' : 'الدراسات الإسلامية'}</span>
                    </div>
                    <div className="text-[11px] text-[#362E3B]/75 dark:text-[#D5D0CA]">
                      {isEn ? 'Fiqh, Aqeedah, Salah & Seerah' : 'الفقه، العقيدة، الصلاة والسيرة'}
                    </div>
                  </div>
                </div>

                {/* Call to action bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs text-[#6B5B73] dark:text-[#B8A9C9]">
                    <MessageCircle className="w-4 h-4 text-[#87A878]" />
                    <span>
                      {isEn
                        ? 'Direct WhatsApp follow-up after every lesson'
                        : 'متابعة مباشرة عبر الواتساب بعد كل جلسة'}
                    </span>
                  </div>

                  <button
                    onClick={onOpenTrialModal}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#87A878] hover:bg-[#729263] text-white font-medium text-xs sm:text-sm shadow-md shadow-[#87A878]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{isEn ? 'Book Free 30-Min Trial' : 'احجز جلستك التجريبية مجاناً'}</span>
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                </div>

              </motion.div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
