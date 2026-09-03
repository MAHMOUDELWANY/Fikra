import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Mail, Send, CheckCircle2, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { Language } from '../types';
import { ARABIC_TRANSLATIONS } from '../data/content';

interface ContactSectionProps {
  lang: Language;
  onOpenTrialModal: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang, onOpenTrialModal }) => {
  const isEn = lang === 'en';
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    interest: 'Quran Reading & Tajweed',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <section
      id="contact"
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
            {isEn ? 'Direct Communication' : ARABIC_TRANSLATIONS.nav.contact}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#362E3B] dark:text-[#F5E6D3] tracking-tight mb-4">
            {isEn ? 'Reach Mahmoud directly.' : 'تواصل مع محمود مباشرة.'}
          </h2>
          <p className="text-base text-[#362E3B]/75 dark:text-[#D5D0CA] leading-relaxed">
            {isEn
              ? 'Have a question before booking your free trial? Or wondering which service fits your family? Message directly on WhatsApp or send a message below.'
              : 'هل لديك استفسار قبل حجز الجلسة التجريبية؟ أو ترغب في استشارة حول المسار الأنسب لك أو لأطفالك؟ تواصل مباشرة عبر واتساب أو أرسل رسالتك هنا.'}
          </p>
        </motion.div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Quick Channels & Guarantees (5 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, x: isEn ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 space-y-6"
          >
            
            {/* Primary WhatsApp Card */}
            <motion.div
              whileHover={{ y: -5, scale: 1.01 }}
              className="p-7 rounded-2xl bg-white dark:bg-[#29232F] border border-[#87A878]/35 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  className="w-11 h-11 rounded-xl bg-[#87A878]/15 text-[#87A878] flex items-center justify-center transition-colors group-hover:bg-[#87A878] group-hover:text-white"
                >
                  <MessageCircle className="w-5 h-5" />
                </motion.div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                    WhatsApp Direct
                  </h3>
                  <p className="text-xs text-[#6B5B73] dark:text-[#B8A9C9] font-medium">
                    {isEn ? 'Fastest response • Usually within hours' : 'الرد الأسرع • خلال ساعات قليلة'}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#362E3B]/75 dark:text-[#D5D0CA] mb-6 leading-relaxed">
                {isEn
                  ? 'Message Mahmoud directly to ask about your level, schedule compatibility, or lesson format.'
                  : 'تحدث مع محمود مباشرة للسؤال عن التوقيت، مستواك، أو تفاصيل الدروس.'}
              </p>

              <motion.a
                whileHover={{ scale: 1.025, y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="https://wa.me/201099616802?text=Assalamu%20Alaikum%20Ustadh%20Mahmoud,%20I%20would%20like%20to%20ask%20about%20your%201-on-1%20lessons."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#87A878] hover:bg-[#729263] text-white font-medium text-sm shadow-xs hover:shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isEn ? 'Open WhatsApp Chat' : 'فتح محادثة واتساب'}</span>
              </motion.a>
            </motion.div>

            {/* Email Card */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-6 rounded-2xl bg-white dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545] hover:border-[#87A878]/60 shadow-xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-[#6B5B73] dark:text-[#B8A9C9]" />
                <h4 className="font-serif text-base font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                  {isEn ? 'Email Correspondence' : 'المراسلة عبر البريد الإلكتروني'}
                </h4>
              </div>
              <p className="text-xs text-[#362E3B]/70 dark:text-[#D5D0CA]/80 mb-3">
                {isEn
                  ? 'Ideal for detailed inquiries or institutional requests.'
                  : 'مناسب للاستفسارات المفصلة أو متطلبات العائلات.'}
              </p>
              <a
                href="mailto:mhmwdlwany4222@gmail.com"
                className="text-xs sm:text-sm font-mono text-[#6B5B73] dark:text-[#B8A9C9] hover:underline"
              >
                mhmwdlwany4222@gmail.com
              </a>
            </motion.div>

            {/* Policy Recap */}
            <div className="p-5 rounded-xl bg-[#EDE3D4] dark:bg-[#231D28] border border-[#87A878]/25 text-xs text-[#362E3B]/80 dark:text-[#D5D0CA]/85 space-y-2.5">
              <div className="flex items-center gap-2 font-semibold text-[#362E3B] dark:text-[#F5E6D3]">
                <Clock className="w-4 h-4 text-[#87A878]" />
                <span>{isEn ? 'Core Scheduling Policy' : 'سياسة المواعيد الأساسية'}</span>
              </div>
              <p>
                {isEn
                  ? 'Lessons can be cancelled or rescheduled up to 3 hours in advance. Inside 3 hours, please contact Mahmoud directly.'
                  : 'يمكن إلغاء الدرس أو إعادة جدولته مجاناً حتى ٣ ساعات قبل الموعد. أقل من ٣ ساعات يُرجى التواصل مباشرة مع محمود.'}
              </p>
            </div>

          </motion.div>

          {/* Direct Message Form (7 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, x: isEn ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7 bg-white dark:bg-[#29232F] border border-[#D5D0CA] dark:border-[#3E3545] rounded-2xl p-7 sm:p-9 shadow-xs"
          >
            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-[#EDE3D4] text-[#87A878] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                  {isEn ? 'Message Sent Successfully' : 'تم استلام رسالتك بنجاح'}
                </h3>
                <p className="text-sm text-[#362E3B]/75 dark:text-[#D5D0CA] max-w-md mx-auto">
                  {isEn
                    ? 'Jazakum Allah Khair. Mahmoud has received your note and will reply directly to your email or WhatsApp shortly.'
                    : 'جزاكم الله خيراً. تلقى محمود رسالتك وسيرد عليك عبر البريد أو الواتساب في أقرب وقت.'}
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="text-xs text-[#6B5B73] dark:text-[#B8A9C9] hover:underline font-medium mt-4 cursor-pointer"
                >
                  {isEn ? 'Send another inquiry' : 'إرسال استفسار آخر'}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-xl font-medium text-[#362E3B] dark:text-[#F5E6D3] mb-2">
                  {isEn ? 'Send an Inquiry' : 'أرسل استفسارك'}
                </h3>
                <p className="text-xs text-[#362E3B]/65 dark:text-[#D5D0CA]/70 mb-6">
                  {isEn
                    ? 'Fill out this brief form and Mahmoud will personally get in touch.'
                    : 'املأ هذه البيانات البسيطة وسيتواصل معك محمود شخصياً.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1.5">
                      {isEn ? 'Your Name / Student Name' : 'اسمك / اسم الطالب'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={isEn ? 'e.g. Omar Khan' : 'الاسم الكريم'}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-[#F5E6D3]/60 dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#87A878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1.5">
                      {isEn ? 'Email Address' : 'البريد الإلكتروني'} *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-[#F5E6D3]/60 dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#87A878]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1.5">
                      {isEn ? 'WhatsApp Number (Optional)' : 'رقم الواتساب (اختياري)'}
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-[#F5E6D3]/60 dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#87A878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1.5">
                      {isEn ? 'Primary Learning Interest' : 'المجال الذي ترغب بتعلمه'}
                    </label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-[#F5E6D3]/60 dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#87A878]"
                    >
                      <option value="Quran Reading & Tajweed">Quran Reading & Tajweed</option>
                      <option value="Quran Memorization">Quran Memorization (Hifz)</option>
                      <option value="Islamic Studies">Islamic Studies (Aqeedah/Fiqh/Seerah)</option>
                      <option value="Modern Standard Arabic">Modern Standard Arabic</option>
                      <option value="Arabic Conversation">Spoken Arabic Conversation</option>
                      <option value="Egyptian Arabic">Egyptian Dialect</option>
                      <option value="English Coaching">English Coaching</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1.5">
                    {isEn ? 'Message or Any Specific Questions' : 'رسالتك أو أي تفاصيل ترغب بمشاركتها'} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={
                      isEn
                        ? 'Tell Mahmoud about yourself or your child, previous learning experience, or preferred days/times...'
                        : 'أخبر محمود عن مستواك، خبرتك السابقة، أو المواعيد المناسبة لك...'
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-[#F5E6D3]/60 dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#87A878]"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#6B5B73] hover:bg-[#584960] text-white font-medium text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEn ? 'Send Message to Mahmoud' : 'إرسال الرسالة إلى محمود'}</span>
                </motion.button>
              </form>
            )}
          </motion.div>

        </div>

      </div>
    </section>
  );
};
