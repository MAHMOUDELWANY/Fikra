import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Sun, Moon, Globe, ArrowRight } from 'lucide-react';
import { Language, ThemeMode } from '../types';
import { ARABIC_TRANSLATIONS } from '../data/content';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenTrialModal: (serviceId?: string) => void;
  onOpenManageModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  onOpenTrialModal,
  onOpenManageModal
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#about', label: lang === 'en' ? 'About Me' : ARABIC_TRANSLATIONS.nav.about },
    { href: '#services', label: lang === 'en' ? 'Course Offered' : ARABIC_TRANSLATIONS.nav.services },
    { href: '#testimonials', label: lang === 'en' ? 'Reviews' : ARABIC_TRANSLATIONS.nav.testimonials },
    { href: '#contact', label: lang === 'en' ? 'Contact Mahmoud' : ARABIC_TRANSLATIONS.nav.contact }
  ];

  return (
    <header
      id="main-navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#1E1923]/95 backdrop-blur-md shadow-xs border-b border-[#D5D0CA] dark:border-[#3E3545] py-3.5'
          : 'bg-white dark:bg-[#1E1923] py-4 sm:py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo with Two Interlocking Organic Leaf Shapes in Plum & Sage */}
        <motion.a
          href="#"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group flex items-center gap-2.5 text-[#362E3B] dark:text-[#F5E6D3] focus:outline-none rounded-md px-1"
        >
          {/* Organic double-leaf SVG icon: Plum & Sage pairing */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <motion.span
              whileHover={{ rotate: 15 }}
              className="absolute left-0 w-5 h-5 rounded-full bg-[#6B5B73] dark:bg-[#B8A9C9] opacity-90 transition-transform group-hover:scale-110"
            />
            <motion.span
              whileHover={{ rotate: -15 }}
              className="absolute right-0 w-5 h-5 rounded-full bg-[#87A878] dark:bg-[#87A878] opacity-95 transition-transform group-hover:scale-110"
            />
          </div>
          
          <span className="font-sans text-xl font-bold tracking-tight group-hover:text-[#6B5B73] dark:group-hover:text-[#B8A9C9] transition-colors">
            Ustadh Mahmoud
          </span>
        </motion.a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              className="relative text-sm font-medium text-[#362E3B]/80 dark:text-[#F5E6D3]/80 hover:text-[#6B5B73] dark:hover:text-[#B8A9C9] transition-colors py-1 group"
            >
              <span>{link.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#87A878] dark:bg-[#B8A9C9] transition-all duration-300 group-hover:w-full rounded-full" />
            </motion.a>
          ))}

          {onOpenManageModal && (
            <button
              type="button"
              onClick={onOpenManageModal}
              className="text-xs font-medium text-[#362E3B]/65 dark:text-[#D5D0CA]/70 hover:text-[#6B5B73] dark:hover:text-[#B8A9C9] transition-colors cursor-pointer border-l border-[#D5D0CA] dark:border-[#3E3545] pl-4"
            >
              {lang === 'en' ? 'Manage Booking' : 'إدارة الحجز'}
            </button>
          )}
        </nav>

        {/* Right Controls: Theme, Language, and High-Contrast Plum CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleLang}
            id="lang-switch-btn"
            aria-label="Toggle language between English and Arabic"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#362E3B]/80 dark:text-[#F5E6D3]/80 hover:bg-[#F5E6D3] dark:hover:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545] transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#87A878] dark:text-[#B8A9C9]" />
            <span>{lang === 'en' ? 'العربية' : 'EN'}</span>
          </motion.button>

          {/* Theme Switcher */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleTheme}
            id="theme-switch-btn"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="p-2 rounded-lg text-[#362E3B]/80 dark:text-[#F5E6D3]/80 hover:bg-[#F5E6D3] dark:hover:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545] transition-colors cursor-pointer"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-[#6B5B73]" />
            ) : (
              <Sun className="w-4 h-4 text-[#B8A9C9]" />
            )}
          </motion.button>

          {/* High-Contrast Plum Action Button */}
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenTrialModal()}
            id="header-get-started-cta"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6B5B73] hover:bg-[#584960] dark:bg-[#B8A9C9] dark:hover:bg-[#A898BA] text-white dark:text-[#1E1923] text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer"
          >
            <span>{lang === 'en' ? 'Get Started Today' : 'ابدأ جلستك الأولى'}</span>
          </motion.button>

          {/* Mobile Hamburger Menu */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="mobile-menu-toggle"
            aria-label="Open mobile menu"
            className="md:hidden p-2 rounded-lg text-[#362E3B] dark:text-[#F5E6D3] hover:bg-[#F5E6D3] dark:hover:bg-[#29232F]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer Navigation with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden fixed inset-x-0 top-[65px] bg-white dark:bg-[#1E1923] border-b border-[#D5D0CA] dark:border-[#3E3545] px-6 py-6 shadow-xl overflow-hidden"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-[#362E3B] dark:text-[#F5E6D3] hover:text-[#6B5B73] dark:hover:text-[#B8A9C9] transition-colors py-1"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-[#D5D0CA] dark:border-[#3E3545] space-y-2.5">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTrialModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6B5B73] text-white font-medium text-sm shadow-sm"
                >
                  <span>{lang === 'en' ? 'Get Started Today (Free 30-Min Trial)' : 'ابدأ جلستك الأولى (٣٠ دقيقة مجانية)'}</span>
                </motion.button>

                {onOpenManageModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenManageModal();
                    }}
                    className="w-full py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] text-xs font-medium text-[#362E3B] dark:text-[#D5D0CA] hover:bg-[#F5E6D3] dark:hover:bg-[#29232F] transition-colors"
                  >
                    {lang === 'en' ? 'Manage or Reschedule Booking' : 'إدارة أو تعديل موعد الحجز'}
                  </button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

