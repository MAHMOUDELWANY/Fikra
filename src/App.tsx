import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MarqueeTicker } from './components/MarqueeTicker';
import { UnifiedMentorshipConvergence } from './components/UnifiedMentorshipConvergence';
import { DisciplineSwitcherShowcase } from './components/DisciplineSwitcherShowcase';
import { LessonStudioShowcase } from './components/LessonStudioShowcase';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { TeachingApproach } from './components/TeachingApproach';
import { HowItWorks } from './components/HowItWorks';
import { FreeTrialSection } from './components/FreeTrialSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { TrialBookingModal } from './components/TrialBookingModal';
import { ManageBookingModal } from './components/booking/ManageBookingModal';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { TeacherAuthProvider } from './lib/auth';
import { Language, ThemeMode } from './types';
import { BookingMode } from './booking/types';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('mahmoud_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Ignore
    }
    return 'light';
  });

  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [bookingMode, setBookingMode] = useState<BookingMode>('trial');
  const [preselectedService, setPreselectedService] = useState<string | undefined>();
  const [manageModalOpen, setManageModalOpen] = useState<boolean>(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState<boolean>(false);

  // Manage RTL / LTR layout and HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Manage Dark / Light theme class on html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('mahmoud_theme', theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  // Listen to hash / URL changes for direct routes (#book, #free-trial, #manage, #teacher)
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#book' || hash === '#trial' || hash === '#free-trial') {
        setBookingMode('trial');
        setBookingModalOpen(true);
      } else if (hash === '#manage' || hash === '#reschedule') {
        setManageModalOpen(true);
      } else if (hash === '#teacher' || hash === '#admin' || hash === '#portal') {
        setTeacherModalOpen(true);
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleOpenBooking = (serviceId?: string, mode: BookingMode = 'trial') => {
    setPreselectedService(serviceId);
    setBookingMode(mode);
    setBookingModalOpen(true);
  };

  return (
    <TeacherAuthProvider>
      <div className="min-h-screen bg-[#F5E6D3] dark:bg-[#1E1923] text-[#362E3B] dark:text-[#F5E6D3] transition-colors duration-300 font-sans">
        {/* Global Navigation */}
        <Navbar
          lang={lang}
          onToggleLang={handleToggleLang}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenTrialModal={(serviceId) => handleOpenBooking(serviceId, 'trial')}
          onOpenManageModal={() => setManageModalOpen(true)}
        />

        <main id="main-content">
          {/* Editorial Hero */}
          <Hero lang={lang} onOpenTrialModal={() => handleOpenBooking(undefined, 'trial')} />

          {/* Running Marquee Ticker (00:00 in video) */}
          <MarqueeTicker lang={lang} />

          {/* Convergence Scroll Animation: 3 Scattered Subscriptions -> 1 Unified Mentorship (00:01 - 00:04 in video) */}
          <UnifiedMentorshipConvergence
            lang={lang}
            onOpenTrialModal={() => handleOpenBooking(undefined, 'trial')}
          />

          {/* Interactive Discipline Switcher with Active Accent Bar & Connection Diagram (00:04 - 00:07 in video) */}
          <DisciplineSwitcherShowcase
            lang={lang}
            onOpenTrialModal={(serviceId) => handleOpenBooking(serviceId, 'trial')}
          />

          {/* 3D Scroll Perspective Classroom & Terminal Showcase (00:08 - 00:10 in video) */}
          <LessonStudioShowcase
            lang={lang}
            onOpenTrialModal={() => handleOpenBooking(undefined, 'trial')}
          />

          {/* 13 Core Services Arranged by Pillars */}
          <ServicesSection
            lang={lang}
            onSelectServiceForTrial={(id) => handleOpenBooking(id, 'trial')}
          />

          {/* About Mahmoud & Verified Trust Credentials */}
          <AboutSection lang={lang} />

          {/* Teaching Philosophy & 4 Core Pillars */}
          <TeachingApproach lang={lang} />

          {/* How It Works (Student Journey) */}
          <HowItWorks lang={lang} onOpenTrialModal={() => handleOpenBooking(undefined, 'trial')} />

          {/* Primary Free Trial Invitation */}
          <FreeTrialSection lang={lang} onOpenTrialModal={() => handleOpenBooking(undefined, 'trial')} />

          {/* Authentic Student & Parent Reflections */}
          <TestimonialsSection lang={lang} />

          {/* Practical Questions & FAQ */}
          <FAQSection lang={lang} />

          {/* Direct Contact & WhatsApp */}
          <ContactSection lang={lang} onOpenTrialModal={() => handleOpenBooking(undefined, 'trial')} />
        </main>

        {/* Footer */}
        <Footer
          lang={lang}
          onToggleLang={handleToggleLang}
          onOpenTrialModal={() => handleOpenBooking(undefined, 'trial')}
          onOpenManageModal={() => setManageModalOpen(true)}
          onOpenTeacherModal={() => setTeacherModalOpen(true)}
        />

        {/* 6-Step Guided Booking Engine Modal */}
        <TrialBookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          lang={lang}
          preselectedServiceId={preselectedService}
          initialMode={bookingMode}
        />

        {/* Manage / Reschedule Booking Modal (3-hour rule policy foundation) */}
        <ManageBookingModal
          isOpen={manageModalOpen}
          onClose={() => setManageModalOpen(false)}
          lang={lang}
        />

        {/* Teacher Auth & Diagnostics Modal (Phase 3 Backend Foundation) */}
        <TeacherAuthModal
          isOpen={teacherModalOpen}
          onClose={() => setTeacherModalOpen(false)}
          lang={lang}
        />
      </div>
    </TeacherAuthProvider>
  );
}
