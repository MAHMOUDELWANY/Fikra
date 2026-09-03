import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Mic,
  Video,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Calendar,
  MessageSquare,
  Play,
  Pause,
  ChevronDown
} from 'lucide-react';
import { Language } from '../types';

interface LessonStudioShowcaseProps {
  lang: Language;
  onOpenTrialModal: () => void;
}

type StudioTab = 'quran' | 'arabic' | 'studies';

export const LessonStudioShowcase: React.FC<LessonStudioShowcaseProps> = ({
  lang,
  onOpenTrialModal,
}) => {
  const isEn = lang === 'en';
  const isRtl = lang === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<StudioTab>('quran');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(true);
  const [selectedWord, setSelectedWord] = useState<string | null>('خَفِيًّا');

  // Track scroll progress of this entire showcase container through viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Smooth out scroll physics with gentle spring
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });

  // Central studio card 3D transforms (Perspective Tilt, Scale, Parallax Y)
  // As user scrolls: tilts forward (rotateX 16deg -> 0deg -> -6deg), scales up to 1.02, glides smoothly
  const centerRotateX = useTransform(smoothProgress, [0, 0.45, 0.85, 1], [16, 0, -3, -8]);
  const centerScale = useTransform(smoothProgress, [0, 0.45, 0.8, 1], [0.93, 1.02, 1, 0.96]);
  const centerY = useTransform(smoothProgress, [0, 0.5, 1], [50, 0, -35]);

  // Left floating card (Live Tajweed / Articulation Terminal)
  // Fans out, tilts deeper, and moves with parallax
  const rawLeftX = useTransform(smoothProgress, [0, 0.5, 1], [-10, -50, -85]);
  const leftY = useTransform(smoothProgress, [0, 0.5, 1], [100, -15, -95]);
  const rawLeftRotateZ = useTransform(smoothProgress, [0, 0.5, 1], [-4, -8, -12]);
  const rawLeftRotateY = useTransform(smoothProgress, [0, 0.5, 1], [8, 14, 18]);

  // Right floating card (Student Milestone & Teacher Notes)
  // Fans out, tilts deeper, and moves with parallax
  const rawRightX = useTransform(smoothProgress, [0, 0.5, 1], [10, 50, 85]);
  const rightY = useTransform(smoothProgress, [0, 0.5, 1], [120, 10, -80]);
  const rawRightRotateZ = useTransform(smoothProgress, [0, 0.5, 1], [4, 8, 12]);
  const rawRightRotateY = useTransform(smoothProgress, [0, 0.5, 1], [-8, -14, -18]);

  // Symmetrical RTL transformations
  const leftX = useTransform(rawLeftX, (val) => (isRtl ? -val : val));
  const rightX = useTransform(rawRightX, (val) => (isRtl ? -val : val));
  const leftRotateZ = useTransform(rawLeftRotateZ, (val) => (isRtl ? -val : val));
  const rightRotateZ = useTransform(rawRightRotateZ, (val) => (isRtl ? -val : val));
  const leftRotateY = useTransform(rawLeftRotateY, (val) => (isRtl ? -val : val));
  const rightRotateY = useTransform(rawRightRotateY, (val) => (isRtl ? -val : val));

  // Floating dock scale & opacity
  const dockScale = useTransform(smoothProgress, [0.2, 0.5, 0.8], [0.92, 1, 0.95]);
  const dockY = useTransform(smoothProgress, [0.2, 0.5, 1], [25, 0, -15]);

  return (
    <section
      ref={containerRef}
      id="live-studio-showcase"
      className="relative overflow-x-clip bg-gradient-to-b from-white via-[#F8F6F0] to-[#F5E6D3] dark:from-[#1E1923] dark:via-[#19151D] dark:to-[#1E1923] py-20 lg:py-32 transition-colors border-b border-[#D5D0CA]/70 dark:border-[#3E3545]"
    >
      {/* Subtle Background Atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#87A878]/12 dark:bg-[#87A878]/5 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-[#B8A9C9]/15 dark:bg-[#B8A9C9]/5 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#87A878]/15 dark:bg-[#87A878]/25 border border-[#87A878]/30 text-[#446237] dark:text-[#A3BF96] text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEn ? 'Live 1-on-1 Studio Experience' : 'تجربة الاستوديو التعليمي المباشر'}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#362E3B] dark:text-[#F5E6D3] tracking-tight mb-5"
          >
            {isEn ? (
              <>
                Inside the private lesson.{' '}
                <span className="text-[#87A878] dark:text-[#A3BF96]">Every minute</span> tailored to your voice.
              </>
            ) : (
              <>
                داخل الجلسة التعليمية الفردية.{' '}
                <span className="text-[#87A878] dark:text-[#A3BF96]">كل دقيقة</span> مخصصة لصوتك ومستواك.
              </>
            )}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="text-base sm:text-lg text-[#362E3B]/75 dark:text-[#D5D0CA] leading-relaxed max-w-2xl mx-auto mb-8"
          >
            {isEn
              ? 'Experience how live Tajweed phonetic corrections, personalized teacher notes, and calm 1-on-1 guidance unfold in real time.'
              : 'شاهد كيف تتكامل التوجيهات الصوتية الحية لأحكام التجويد، والملاحظات الشخصية، والتدريب الهادئ في جلسة فردية مباشرة.'}
          </motion.p>

          {/* Interactive Mode Tabs for the Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#26202C] border border-[#D5D0CA] dark:border-[#3E3545] shadow-xs gap-1.5"
          >
            <button
              onClick={() => setActiveTab('quran')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'quran'
                  ? 'bg-[#87A878] text-white shadow-xs'
                  : 'text-[#362E3B]/80 dark:text-[#F5E6D3]/80 hover:bg-[#F5E6D3]/60 dark:hover:bg-[#342D3B]'
              }`}
            >
              {isEn ? 'Quran & Tajweed' : 'القرآن والتجويد'}
            </button>
            <button
              onClick={() => setActiveTab('arabic')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'arabic'
                  ? 'bg-[#87A878] text-white shadow-xs'
                  : 'text-[#362E3B]/80 dark:text-[#F5E6D3]/80 hover:bg-[#F5E6D3]/60 dark:hover:bg-[#342D3B]'
              }`}
            >
              {isEn ? 'Arabic Language' : 'اللغة العربية'}
            </button>
            <button
              onClick={() => setActiveTab('studies')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'studies'
                  ? 'bg-[#87A878] text-white shadow-xs'
                  : 'text-[#362E3B]/80 dark:text-[#F5E6D3]/80 hover:bg-[#F5E6D3]/60 dark:hover:bg-[#342D3B]'
              }`}
            >
              {isEn ? 'Islamic Studies' : 'الدراسات الإسلامية'}
            </button>
          </motion.div>
        </div>

        {/* 3D Perspective Stage Wrapper */}
        <div
          style={{ perspective: '1200px' }}
          className="relative min-h-[620px] sm:min-h-[670px] lg:min-h-[720px] flex items-center justify-center py-6"
        >

          {/* ========================================================================= */}
          {/* LEFT FLOATING 3D CARD: Live Tajweed Correction & Articulation Terminal */}
          {/* ========================================================================= */}
          <motion.div
            style={{
              x: leftX,
              y: leftY,
              rotateZ: leftRotateZ,
              rotateY: leftRotateY,
              transformStyle: 'preserve-3d',
            }}
            whileHover={{ scale: 1.04, rotateZ: isRtl ? 5 : -5, zIndex: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`absolute top-6 sm:top-10 ${
              isRtl ? 'right-1 sm:right-4 lg:-right-6' : 'left-1 sm:left-4 lg:-left-6'
            } z-20 w-[260px] sm:w-[310px] lg:w-[350px] rounded-2xl bg-[#26202C] dark:bg-[#1A161E] text-white p-4 sm:p-6 shadow-2xl shadow-[#26202C]/40 border border-[#87A878]/30 backdrop-blur-md cursor-grab active:cursor-grabbing select-none`}
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E57373]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD54F]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#81C784]" />
                <span className="ml-2 text-[11px] font-mono text-white/50 tracking-tight">
                  live_makharij_check.azhar
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#87A878] bg-[#87A878]/15 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#87A878] animate-pulse" />
                LIVE
              </span>
            </div>

            {/* Terminal Body with Live Recitation Assessment */}
            <div className="space-y-3 text-xs font-mono text-white/85">
              <div className="text-white/40">// Surah Al-Fatiha • Verse 7</div>
              
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-2">
                <div className="text-[#A3BF96] font-semibold flex items-center justify-between">
                  <span>[Makhraj Check]</span>
                  <span className="text-[10px] text-white/50">Edge of Tongue</span>
                </div>
                <div className="font-serif text-right text-lg text-[#F5E6D3] dir-rtl leading-relaxed font-bold">
                  غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ
                </div>
                <p className="text-[11px] text-white/70 leading-normal font-sans">
                  <span className="text-[#FFD54F] font-bold">✦ Correction:</span> Soften the{' '}
                  <span className="text-white font-semibold underline decoration-[#87A878]">Ghayn (غ)</span> without throat friction. Lengthen contact for{' '}
                  <span className="text-white font-semibold underline decoration-[#87A878]">Ḍād (ض)</span>.
                </p>
              </div>

              {/* Teacher Verbal Feedback Transcript */}
              <div className="p-2.5 rounded-lg bg-[#87A878]/15 border border-[#87A878]/25 text-[11px] font-sans">
                <div className="text-[#A3BF96] font-semibold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Mic className="w-3 h-3 text-[#A3BF96]" />
                  <span>{isEn ? "Ustadh Mahmoud's Audio Note" : "ملاحظة صوتية من الأستاذ محمود"}</span>
                </div>
                <p className="text-white/90 italic">
                  "{isEn ? 'Masha\'Allah! Your breath control in the second repetition was much calmer. Keep that mouth openness.' : 'ما شاء الله! حبس النفس في الإعادة الثانية كان أكثر هدوءاً وثباتاً. استمر على هذا الانفتاح.'}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/40 pt-1">
                <span>Accuracy: 98%</span>
                <span className="text-[#87A878] flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Al-Azhar Method Verified
                </span>
              </div>
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* RIGHT FLOATING 3D CARD: Student Milestone & Teacher Notes */}
          {/* ========================================================================= */}
          <motion.div
            style={{
              x: rightX,
              y: rightY,
              rotateZ: rightRotateZ,
              rotateY: rightRotateY,
              transformStyle: 'preserve-3d',
            }}
            whileHover={{ scale: 1.04, rotateZ: isRtl ? -5 : 5, zIndex: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`absolute bottom-4 sm:bottom-8 ${
              isRtl ? 'left-1 sm:left-4 lg:-left-6' : 'right-1 sm:right-4 lg:-right-6'
            } z-20 w-[260px] sm:w-[310px] lg:w-[350px] rounded-2xl bg-white dark:bg-[#29232F] text-[#362E3B] dark:text-[#F5E6D3] p-4 sm:p-6 shadow-2xl shadow-black/15 border border-[#D5D0CA] dark:border-[#3E3545] cursor-grab active:cursor-grabbing select-none`}
          >
            {/* Header: Student Profile Info */}
            <div className="flex items-center gap-3 border-b border-[#D5D0CA] dark:border-[#3E3545] pb-3 mb-3.5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Student Maryam"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#87A878]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-[#362E3B] dark:text-[#F5E6D3] truncate">
                    Maryam K.
                  </h4>
                  <span className="text-[10px] font-medium text-[#87A878] dark:text-[#A3BF96] bg-[#87A878]/10 px-2 py-0.5 rounded-full">
                    Active Student
                  </span>
                </div>
                <p className="text-[11px] text-[#6B5B73] dark:text-[#B8A9C9] truncate">
                  Toronto, Canada • Quran & Tajweed
                </p>
              </div>
            </div>

            {/* Checklist of Milestones */}
            <div className="space-y-2 mb-3.5">
              <div className="text-[11px] font-semibold text-[#6B5B73] dark:text-[#B8A9C9] uppercase tracking-wider">
                {isEn ? "Today's Lesson Progress" : "إنجاز جلسة اليوم"}
              </div>

              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#87A878] shrink-0 mt-0.5" />
                <span className="text-[#362E3B]/90 dark:text-[#D5D0CA]">
                  {isEn ? 'Noon Sakinah: Idgham with Ghunnah (Ayat 1-10)' : 'النون الساكنة: إدغام بغنة (الآيات ١-١٠)'}
                </span>
              </div>

              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#87A878] shrink-0 mt-0.5" />
                <span className="text-[#362E3B]/90 dark:text-[#D5D0CA]">
                  {isEn ? 'Surah Maryam recitation review passed' : 'اجتياز تسميع سورة مريم بثبات'}
                </span>
              </div>

              <div className="flex items-start gap-2 text-xs text-[#6B5B73] dark:text-[#B8A9C9]">
                <Clock className="w-4 h-4 text-[#B8A9C9] shrink-0 mt-0.5" />
                <span>
                  {isEn ? 'Next Session: Thursday 6:00 PM EST (Zoom)' : 'الجلسة القادمة: الخميس ٦:٠٠ م بتوقيت كندا'}
                </span>
              </div>
            </div>

            {/* Homework & Recommendation Pill */}
            <div className="p-3 rounded-xl bg-[#F5E6D3] dark:bg-[#1E1923] border border-[#D5D0CA] dark:border-[#3E3545] text-xs">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#87A878] dark:text-[#A3BF96] mb-1">
                {isEn ? 'Recommended Weekly Pace' : 'الوتيرة الأسبوعية المقترحة'}
              </div>
              <p className="text-[11px] text-[#362E3B]/80 dark:text-[#D5D0CA]">
                {isEn
                  ? '2 sessions/week × 45 min — Ideal balance between retention and busy family schedules.'
                  : 'جلستان أسبوعياً × ٤٥ دقيقة — توازن مثالي بين التثبيت ومشاغل العمل والأسرة.'}
              </p>
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* CENTRAL INTERACTIVE CLASSROOM STAGE (The main app window) */}
          {/* ========================================================================= */}
          <motion.div
            style={{
              rotateX: centerRotateX,
              scale: centerScale,
              y: centerY,
              transformStyle: 'preserve-3d',
            }}
            className="w-full max-w-4xl bg-white dark:bg-[#231E2A] rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/20 dark:shadow-black/60 border border-[#D5D0CA] dark:border-[#3E3545] overflow-hidden z-10 transition-shadow hover:shadow-3xl"
          >
            {/* Window Title Bar */}
            <div className="bg-[#FAF7F2] dark:bg-[#1E1923] px-4 sm:px-6 py-3 border-b border-[#D5D0CA] dark:border-[#3E3545] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
                <span className="ml-3 text-xs font-medium text-[#6B5B73] dark:text-[#B8A9C9] flex items-center gap-1.5 truncate">
                  <Video className="w-3.5 h-3.5 text-[#87A878]" />
                  <span className="hidden sm:inline">
                    {isEn ? "Ustadh Mahmoud's Classroom • 1-on-1 Studio" : 'فصل الأستاذ محمود • جلسة فردية مباشرة'}
                  </span>
                  <span className="sm:hidden">{isEn ? 'Live Classroom' : 'فصل مباشر'}</span>
                </span>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#446237] dark:text-[#A3BF96] bg-[#87A878]/15 px-2.5 py-1 rounded-full border border-[#87A878]/30">
                  <span className="w-2 h-2 rounded-full bg-[#87A878] animate-ping" />
                  <span>{isEn ? 'Cairo ↔ Global Connected' : 'اتصال مباشر عالي الدقة'}</span>
                </span>
              </div>
            </div>

            {/* Studio Workspace Content */}
            <div className="p-4 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 bg-white dark:bg-[#231E2A]">
              
              {/* Left Column: Illuminated Subject Canvas (7 cols) */}
              <div className="lg:col-span-7 bg-[#FAF7F2] dark:bg-[#1A1620] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#D5D0CA] dark:border-[#3E3545] flex flex-col justify-between">
                <div>
                  
                  {/* Dynamic Content based on Active Tab */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'quran' && (
                      <motion.div
                        key="tab-quran"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        {/* Surah Header Banner */}
                        <div className="flex items-center justify-between border-b border-[#D5D0CA] dark:border-[#3E3545] pb-3 mb-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#87A878]" />
                            <span className="text-xs font-semibold text-[#362E3B] dark:text-[#F5E6D3]">
                              {isEn ? 'Surah Maryam (سُورَةُ مَرْيَمَ)' : 'سُورَةُ مَرْيَمَ (مكية)'}
                            </span>
                          </div>
                          <button
                            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#87A878]/15 hover:bg-[#87A878]/25 text-[#446237] dark:text-[#A3BF96] text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            {isPlayingAudio ? (
                              <>
                                <Pause className="w-3 h-3" />
                                <span>{isEn ? 'Pause Sample' : 'إيقاف التلاوة'}</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                <span>{isEn ? 'Listen Sample' : 'استمع للتلاوة'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Bismillah Banner */}
                        <div className="text-center font-serif text-lg text-[#87A878] dark:text-[#A3BF96] mb-4 dir-rtl font-semibold">
                          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </div>

                        {/* Quran Text with Authentic Tajweed Colors */}
                        <div className="font-serif text-xl sm:text-2xl text-right leading-[2.2] sm:leading-[2.4] text-[#362E3B] dark:text-[#F5E6D3] dir-rtl selection:bg-[#87A878]/30">
                          <span
                            onClick={() => setSelectedWord('كٓهيعٓصٓ')}
                            className={`px-1 rounded transition-colors cursor-pointer ${
                              selectedWord === 'كٓهيعٓصٓ' ? 'bg-[#87A878]/25 ring-1 ring-[#87A878]' : 'hover:bg-[#87A878]/15'
                            }`}
                          >
                            كٓهيعٓصٓ ﴿١﴾
                          </span>{' '}
                          <span
                            onClick={() => setSelectedWord('زَكَرِيَّآ')}
                            className={`px-1 rounded transition-colors cursor-pointer ${
                              selectedWord === 'زَكَرِيَّآ' ? 'bg-[#87A878]/25 ring-1 ring-[#87A878]' : 'hover:bg-[#87A878]/15'
                            }`}
                          >
                            ذِكْرُ رَحْمَتِ رَبِّكَ عَبْدَهُۥ{' '}
                            <span className="text-[#D97706] font-bold underline decoration-dotted underline-offset-4">
                              زَكَرِيَّآ
                            </span>{' '}
                            ﴿٢﴾
                          </span>{' '}
                          <span
                            onClick={() => setSelectedWord('خَفِيًّا')}
                            className={`px-1.5 py-0.5 rounded-md border cursor-pointer transition-colors ${
                              selectedWord === 'خَفِيًّا'
                                ? 'bg-[#87A878]/30 border-[#87A878]'
                                : 'bg-[#87A878]/15 border-[#87A878]/30'
                            }`}
                          >
                            إِذْ نَادَىٰ رَبَّهُۥ نِدَآءً{' '}
                            <span className="text-[#2563EB] dark:text-[#60A5FA] font-bold">
                              خَفِيًّا
                            </span>{' '}
                            ﴿٣﴾
                          </span>{' '}
                          <span
                            onClick={() => setSelectedWord('شَيْبًا')}
                            className={`px-1 rounded transition-colors cursor-pointer ${
                              selectedWord === 'شَيْبًا' ? 'bg-[#87A878]/25 ring-1 ring-[#87A878]' : 'hover:bg-[#87A878]/15'
                            }`}
                          >
                            قَالَ رَبِّ إِنِّى وَهَنَ الْعَظْمُ مِنِّى وَاشْتَعَلَ الرَّأْسُ شَيْبًا ﴿٤﴾
                          </span>
                        </div>

                        {/* Interactive Tajweed Legend */}
                        <div className="mt-5 pt-3 border-t border-[#D5D0CA] dark:border-[#3E3545] flex flex-wrap items-center gap-2.5 text-[11px]">
                          <span className="text-[#6B5B73] dark:text-[#B8A9C9] font-medium">
                            {isEn ? 'Rules:' : 'الأحكام:'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#2563EB] dark:text-[#60A5FA] bg-blue-500/10 px-2 py-0.5 rounded font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {isEn ? 'Ikhfa (Tanween + Kha)' : 'إخفاء حقيقي'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#D97706] bg-amber-500/10 px-2 py-0.5 rounded font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {isEn ? 'Madd Muttasil' : 'مد متصل ٤-٥ حركات'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#059669] bg-emerald-500/10 px-2 py-0.5 rounded font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {isEn ? 'Ghunnah 2 Counts' : 'غنة حرفية'}
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'arabic' && (
                      <motion.div
                        key="tab-arabic"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="flex items-center justify-between border-b border-[#D5D0CA] dark:border-[#3E3545] pb-3 mb-4">
                          <span className="text-xs font-semibold text-[#362E3B] dark:text-[#F5E6D3]">
                            {isEn ? 'Arabic Conversation & Grammar Module' : 'وحدة المحادثة والنحو العربي التطبيقي'}
                          </span>
                          <span className="text-[11px] text-[#87A878] font-medium">Level: A2/B1</span>
                        </div>

                        <div className="space-y-3 font-sans text-sm">
                          <div className="p-3 rounded-xl bg-white dark:bg-[#26202C] border border-[#D5D0CA] dark:border-[#3E3545]">
                            <div className="text-xs text-[#87A878] font-semibold mb-1">
                              {isEn ? 'Teacher (Mahmoud):' : 'المعلم (أستاذ محمود):'}
                            </div>
                            <div className="font-serif text-lg text-right dir-rtl text-[#362E3B] dark:text-[#F5E6D3]">
                              «مَا هُوَ هَدَفُكَ الرَّئِيسِيُّ مِنْ تَعَلُّمِ اللُّغَةِ الْعَرَبِيَّةِ؟»
                            </div>
                            <div className="text-[11px] text-[#6B5B73] dark:text-[#B8A9C9] mt-1">
                              "What is your primary goal from learning the Arabic language?"
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-[#87A878]/10 border border-[#87A878]/25">
                            <div className="text-xs text-[#446237] dark:text-[#A3BF96] font-semibold mb-1">
                              {isEn ? 'Student Response & Correction:' : 'إجابة الطالب والتحليل النحوي:'}
                            </div>
                            <div className="font-serif text-lg text-right dir-rtl text-[#362E3B] dark:text-[#F5E6D3]">
                              «أُرِيدُ أَنْ <span className="text-[#87A878] font-bold">أَفْهَمَ</span> الْقُرْآنَ بِدُونِ تَرْجَمَةٍ.»
                            </div>
                            <div className="text-[11px] text-[#6B5B73] dark:text-[#B8A9C9] mt-1">
                              <span className="text-[#87A878] font-medium">Grammar point:</span> Mansoob with Fat-ha after 'An' (أَنْ الناصبة).
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'studies' && (
                      <motion.div
                        key="tab-studies"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="flex items-center justify-between border-b border-[#D5D0CA] dark:border-[#3E3545] pb-3 mb-4">
                          <span className="text-xs font-semibold text-[#362E3B] dark:text-[#F5E6D3]">
                            {isEn ? 'Islamic Studies • Fiqh & Daily Practice' : 'الفقه الإسلامي والعبادات اليومية'}
                          </span>
                          <span className="text-[11px] text-[#87A878] font-medium">Al-Azhar Curriculum</span>
                        </div>

                        <div className="space-y-2.5 text-xs text-[#362E3B]/85 dark:text-[#D5D0CA]">
                          <div className="p-3 rounded-xl bg-white dark:bg-[#26202C] border border-[#D5D0CA] dark:border-[#3E3545]">
                            <div className="font-semibold text-xs text-[#87A878] mb-1">
                              {isEn ? 'Core Concept: Khushu in Daily Salah' : 'المفهوم الأساسي: الخشوع في الصلاة'}
                            </div>
                            <p className="text-[11px] leading-relaxed">
                              {isEn
                                ? 'Understanding what you recite transforms prayer from mechanical movements into an intimate conversation with your Creator.'
                                : 'فهم ما تقرؤه في صلاتك يحولها من مجرد حركات مجردة إلى مناجاة روحية واعية مع الخالق.'}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1923] border border-[#D5D0CA] dark:border-[#3E3545] flex items-center justify-between">
                            <span className="font-medium text-[11px]">
                              {isEn ? 'Lesson Notes & Reflections PDF' : 'ملخص الجلسة وملف الملاحظات'}
                            </span>
                            <span className="text-[10px] text-[#87A878] bg-[#87A878]/15 px-2 py-0.5 rounded">
                              Auto-Saved ✓
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Live Pointer Bar */}
                <div className="mt-4 pt-3 border-t border-[#D5D0CA]/60 dark:border-[#3E3545]/60 flex items-center justify-between text-xs text-[#6B5B73] dark:text-[#B8A9C9]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#87A878]" />
                    {isEn ? "Ustadh Mahmoud is guiding this session" : "الأستاذ محمود يشرف على هذه الجلسة"}
                  </span>
                  <span className="text-[11px] font-mono">Zoom Audio: 48kHz HD</span>
                </div>
              </div>

              {/* Right Column: Live Video, Waveform & Real-Time Lesson Controls (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                
                {/* Teacher Video Stream Mockup */}
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#26202C] border border-[#D5D0CA] dark:border-[#3E3545] aspect-4/3 shadow-md group">
                  <img
                    src="https://raw.githubusercontent.com/StackBlitz/stackblitz-images/main/teacher-mahmoud-portrait.jpg"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";
                    }}
                    alt="Ustadh Mahmoud Teaching"
                    className="w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Teacher Name Tag */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span>{isEn ? 'Ustadh Mahmoud (Teacher)' : 'أستاذ محمود (المعلم)'}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#87A878]" />
                      </div>
                      <div className="text-[10px] text-white/70">
                        {isEn ? 'Al-Azhar Scholar • C1 English' : 'خريج الأزهر الشريف • إنجليزية C1'}
                      </div>
                    </div>

                    {/* Equalizer Waveform */}
                    <div className="flex items-center gap-0.5 h-4">
                      {isPlayingAudio ? (
                        <>
                          <motion.span
                            animate={{ height: ['4px', '14px', '6px', '16px', '4px'] }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                            className="w-1 bg-[#87A878] rounded-full"
                          />
                          <motion.span
                            animate={{ height: ['8px', '18px', '10px', '4px', '8px'] }}
                            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut', delay: 0.2 }}
                            className="w-1 bg-[#87A878] rounded-full"
                          />
                          <motion.span
                            animate={{ height: ['12px', '6px', '16px', '8px', '12px'] }}
                            transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut', delay: 0.1 }}
                            className="w-1 bg-[#87A878] rounded-full"
                          />
                          <motion.span
                            animate={{ height: ['6px', '14px', '8px', '12px', '6px'] }}
                            transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut', delay: 0.3 }}
                            className="w-1 bg-[#87A878] rounded-full"
                          />
                        </>
                      ) : (
                        <div className="text-[10px] text-white/60 flex items-center gap-1">
                          <VolumeX className="w-3 h-3" />
                          <span>Muted</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Tool Actions */}
                <div className="bg-[#FAF7F2] dark:bg-[#1A1620] rounded-xl p-3.5 border border-[#D5D0CA] dark:border-[#3E3545] space-y-2.5">
                  <div className="text-[11px] font-semibold text-[#6B5B73] dark:text-[#B8A9C9] uppercase tracking-wider flex items-center justify-between">
                    <span>{isEn ? 'Interactive Teaching Tools' : 'أدوات الشرح التفاعلية'}</span>
                    <span className="text-[10px] text-[#87A878] font-normal">Active Session</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#231E2A] border border-[#D5D0CA] dark:border-[#3E3545]">
                      <Volume2 className="w-3.5 h-3.5 text-[#87A878]" />
                      <span className="text-[11px] font-medium">{isEn ? 'Slow Recitation' : 'تكرار متأنٍ'}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#231E2A] border border-[#D5D0CA] dark:border-[#3E3545]">
                      <Mic className="w-3.5 h-3.5 text-[#87A878]" />
                      <span className="text-[11px] font-medium">{isEn ? 'Makharij Guide' : 'مخارج الحروف'}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#231E2A] border border-[#D5D0CA] dark:border-[#3E3545]">
                      <MessageSquare className="w-3.5 h-3.5 text-[#87A878]" />
                      <span className="text-[11px] font-medium">{isEn ? 'Bilingual Chat' : 'حوار بالإنجليزية'}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#231E2A] border border-[#D5D0CA] dark:border-[#3E3545]">
                      <Calendar className="w-3.5 h-3.5 text-[#87A878]" />
                      <span className="text-[11px] font-medium">{isEn ? 'Flexible Times' : 'مواعيد مرنة'}</span>
                    </div>
                  </div>
                </div>

                {/* Free Trial Direct Call-to-Action */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenTrialModal}
                  className="w-full py-3 px-4 rounded-xl bg-[#87A878] hover:bg-[#729263] text-white font-medium text-xs sm:text-sm shadow-md shadow-[#87A878]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{isEn ? 'Book Free 30-Min Trial Session' : 'احجز جلستك التجريبية المجانية (٣٠ دقيقة)'}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </motion.button>

              </div>

            </div>

            {/* Bottom Dock (mirrors the dock in the video with app icons & "all under one mentorship") */}
            <motion.div
              style={{
                scale: dockScale,
                y: dockY,
              }}
              className="bg-[#FAF7F2] dark:bg-[#1E1923] border-t border-[#D5D0CA] dark:border-[#3E3545] px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2 text-[#6B5B73] dark:text-[#B8A9C9]">
                <span className="font-semibold text-[#362E3B] dark:text-[#F5E6D3]">
                  {isEn ? 'All 13 Disciplines' : '١٣ تخصصاً تعليمياً'}
                </span>
                <span>•</span>
                <span>{isEn ? 'One Direct Mentorship with Mahmoud' : 'إشراف تعليمي مباشر مع الأستاذ محمود'}</span>
              </div>

              {/* Badges Dock */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545] text-[#362E3B] dark:text-[#F5E6D3] text-[11px] font-medium shadow-xs">
                  Quran
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545] text-[#362E3B] dark:text-[#F5E6D3] text-[11px] font-medium shadow-xs">
                  Tajweed
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545] text-[#362E3B] dark:text-[#F5E6D3] text-[11px] font-medium shadow-xs">
                  Islamic Studies
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545] text-[#362E3B] dark:text-[#F5E6D3] text-[11px] font-medium shadow-xs">
                  Arabic
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545] text-[#362E3B] dark:text-[#F5E6D3] text-[11px] font-medium shadow-xs">
                  English
                </span>
              </div>
            </motion.div>

          </motion.div>

        </div>

        {/* Transition Headline to the next section (Mirroring the video's "The official apps themselves..." bottom transition) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mt-16 sm:mt-24 pt-12 border-t border-[#D5D0CA] dark:border-[#3E3545] max-w-4xl mx-auto text-center"
        >
          <div className="text-xs uppercase tracking-widest text-[#87A878] dark:text-[#A3BF96] font-semibold mb-3">
            {isEn ? 'Direct Teacher-to-Student Relationship' : 'علاقة مباشرة بين المعلم والطالب'}
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#362E3B] dark:text-[#F5E6D3] tracking-tight mb-4">
            {isEn
              ? 'No middleman marketplaces. No generic pre-recorded videos.'
              : 'دون منصات وسيطة ودون تسجيلات جاهزة لا تلبي احتياجك.'}
          </h3>
          <p className="text-base text-[#362E3B]/75 dark:text-[#D5D0CA] max-w-xl mx-auto mb-8">
            {isEn
              ? 'You work directly with Ustadh Mahmoud. Every lesson is scheduled to your local timezone, with dedicated follow-up over WhatsApp.'
              : 'تتعلم مباشرة مع الأستاذ محمود، في أوقات تتوافق مع منطقتك الزمنية، ومع تواصل مستمر عبر الواتساب.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left sm:text-center max-w-2xl mx-auto">
            <div className="p-4 rounded-xl bg-white dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545]">
              <div className="font-serif text-xl font-bold text-[#87A878] dark:text-[#A3BF96] mb-1">
                {isEn ? '30–60 Min' : '٣٠–٦٠ دقيقة'}
              </div>
              <div className="text-xs text-[#6B5B73] dark:text-[#B8A9C9]">
                {isEn ? 'Flexible lesson durations' : 'خيارات مدة مرنة تناسب طاقتك'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545]">
              <div className="font-serif text-xl font-bold text-[#87A878] dark:text-[#A3BF96] mb-1">
                {isEn ? 'One Free Trial' : 'جلسة مجانية أولى'}
              </div>
              <div className="text-xs text-[#6B5B73] dark:text-[#B8A9C9]">
                {isEn ? '30 min evaluation & mini lesson' : 'تقييم للمستوى ودرس مصغر'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545]">
              <div className="font-serif text-xl font-bold text-[#87A878] dark:text-[#A3BF96] mb-1">
                {isEn ? '3h Cancel Policy' : 'إلغاء قبل ٣ ساعات'}
              </div>
              <div className="text-xs text-[#6B5B73] dark:text-[#B8A9C9]">
                {isEn ? 'Self-service reschedule window' : 'مرونة في إعادة الجدولة'}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
