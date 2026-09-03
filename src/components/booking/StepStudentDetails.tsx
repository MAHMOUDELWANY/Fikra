import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowLeft, ShieldCheck, User, Users, Mail, Phone, BookMarked } from 'lucide-react';
import { BookingFormData, Language, LearnerAudience, ProficiencyLevel } from '../../booking/types';

interface StepStudentDetailsProps {
  formData: BookingFormData;
  updateForm: (fields: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  lang: Language;
}

export const StepStudentDetails: React.FC<StepStudentDetailsProps> = ({
  formData,
  updateForm,
  onNext,
  onBack,
  lang
}) => {
  const isEn = lang === 'en';
  const isChild = formData.audience === 'child';

  const levels: { key: ProficiencyLevel; label: string; arabicLabel: string; desc: string }[] = [
    {
      key: 'beginner',
      label: 'Complete Beginner',
      arabicLabel: 'مبتدئ تماماً',
      desc: isEn ? 'Starting from scratch / no prior background' : 'البدء من الصفر تماماً'
    },
    {
      key: 'elementary',
      label: 'Elementary',
      arabicLabel: 'أساسي / تمهيدي',
      desc: isEn ? 'Knows basic letters / disconnected words' : 'يعرف الحروف الأساسية أو كلمات متفرقة'
    },
    {
      key: 'intermediate',
      label: 'Intermediate',
      arabicLabel: 'متوسط',
      desc: isEn ? 'Can read slowly or speak basic phrases' : 'يستطيع القراءة بتأنٍ أو التحدث بجمل بسيطة'
    },
    {
      key: 'advanced',
      label: 'Advanced',
      arabicLabel: 'متقدم',
      desc: isEn ? 'Fluent reading or conversational; refining mastery' : 'قراءة متمكنة أو طلاقة حوارية ويرغب في الإتقان'
    }
  ];

  const handleAudienceChange = (audience: LearnerAudience) => {
    updateForm({ audience });
  };

  const isFormValid = isChild
    ? formData.childName.trim().length > 0 &&
      formData.parentName.trim().length > 0 &&
      formData.parentEmail.trim().length > 0 &&
      formData.parentEmail.includes('@')
    : formData.studentName.trim().length > 0 &&
      formData.email.trim().length > 0 &&
      formData.email.includes('@');

  return (
    <div className="space-y-6">
      {/* Audience Toggle (Adult vs Child) */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/70 dark:text-[#D5D0CA]/70 mb-2">
          {isEn ? 'Who will be learning in this session?' : 'من سيتعلم في هذا الدرس؟'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleAudienceChange('adult')}
            className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-3.5 ${
              !isChild
                ? 'bg-[#F5E6D3] dark:bg-[#29232F] border-[#6B5B73] dark:border-[#B8A9C9] ring-1 ring-[#6B5B73] shadow-xs'
                : 'bg-white dark:bg-[#231D28] border-[#D5D0CA] dark:border-[#3E3545] hover:bg-[#F5E6D3]/40'
            }`}
          >
            <div className={`p-2 rounded-xl ${!isChild ? 'bg-[#6B5B73] text-white' : 'bg-[#EDE3D4] dark:bg-[#1E1923] text-[#362E3B] dark:text-[#D5D0CA]'}`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif text-sm font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                {isEn ? 'I am learning (Adult / Self)' : 'أنا المتعلم (بالغ / شخصي)'}
              </div>
              <div className="text-[11px] text-[#362E3B]/60 dark:text-[#D5D0CA]/60">
                {isEn ? 'Direct communication for your own learning' : 'تواصل وتنسيق مباشر لتعلمك الشخصي'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAudienceChange('child')}
            className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-3.5 ${
              isChild
                ? 'bg-[#F5E6D3] dark:bg-[#29232F] border-[#6B5B73] dark:border-[#B8A9C9] ring-1 ring-[#6B5B73] shadow-xs'
                : 'bg-white dark:bg-[#231D28] border-[#D5D0CA] dark:border-[#3E3545] hover:bg-[#F5E6D3]/40'
            }`}
          >
            <div className={`p-2 rounded-xl ${isChild ? 'bg-[#6B5B73] text-white' : 'bg-[#EDE3D4] dark:bg-[#1E1923] text-[#362E3B] dark:text-[#D5D0CA]'}`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif text-sm font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                {isEn ? 'For my child (Parent / Guardian)' : 'لطفلي (حجز ولي الأمر)'}
              </div>
              <div className="text-[11px] text-[#362E3B]/60 dark:text-[#D5D0CA]/60">
                {isEn ? 'Parents attend or receive updates' : 'متابعة وإشراف وتنسيق مع ولي الأمر'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Dynamic Fields */}
      {!isChild ? (
        /* ADULT FIELDS */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1.5">
                {isEn ? 'Your Full Name' : 'اسمك الكريم'} <span className="text-[#6B5B73] dark:text-[#B8A9C9]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => updateForm({ studentName: e.target.value })}
                placeholder={isEn ? 'e.g. Tariq Mansour' : 'مثال: طارق منصور'}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-white dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#87A878]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1.5">
                {isEn ? 'Age Group' : 'الفئة العمرية'}
              </label>
              <select
                value={formData.ageGroup || '18-29'}
                onChange={(e) => updateForm({ ageGroup: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-white dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#87A878]"
              >
                <option value="18-29">18 – 29 {isEn ? 'years' : 'سنة'}</option>
                <option value="30-45">30 – 45 {isEn ? 'years' : 'سنة'}</option>
                <option value="46+">46+ {isEn ? 'years' : 'سنة'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-[#87A878]" />
                <span>{isEn ? 'Email Address' : 'البريد الإلكتروني'}</span> <span className="text-[#6B5B73] dark:text-[#B8A9C9]">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => updateForm({ email: e.target.value })}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-white dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#87A878]"
              />
              <p className="text-[11px] text-[#362E3B]/55 dark:text-[#D5D0CA]/55 mt-1">
                {isEn ? 'Zoom meeting room credentials will be sent here.' : 'سيتم إرسال رابط قاعة زووم إلى هذا البريد.'}
              </p>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-[#87A878]" />
                <span>{isEn ? 'WhatsApp Number (Recommended)' : 'رقم الواتساب (موصى به للتذكير)'}</span>
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => updateForm({ whatsapp: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-white dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#87A878]"
              />
              <p className="text-[11px] text-[#362E3B]/55 dark:text-[#D5D0CA]/55 mt-1">
                {isEn ? 'For courteous lesson reminders and direct questions.' : 'للتذكير بموعد الدرس ولأي استفسار مباشر.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* CHILD & PARENT FIELDS */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#231D28] border border-[#D5D0CA] dark:border-[#3E3545] space-y-4">
            <div className="font-serif text-sm font-medium text-[#6B5B73] dark:text-[#B8A9C9] flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{isEn ? '1. Learner (Child) Details' : '١. بيانات الطفل (الطالب)'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1">
                  {isEn ? 'Child’s Full Name' : 'اسم الطفل الكريم'} <span className="text-[#6B5B73] dark:text-[#B8A9C9]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.childName}
                  onChange={(e) => updateForm({ childName: e.target.value })}
                  placeholder={isEn ? 'e.g. Yusuf' : 'مثال: يوسف'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-[#F5E6D3]/30 dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#87A878]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1">
                  {isEn ? 'Child’s Age' : 'عمر الطفل'} <span className="text-[#6B5B73] dark:text-[#B8A9C9]">*</span>
                </label>
                <select
                  value={formData.childAge || '8-11'}
                  onChange={(e) => updateForm({ childAge: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-[#F5E6D3]/30 dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#87A878]"
                >
                  <option value="5-7">5 – 7 {isEn ? 'years old' : 'سنوات'}</option>
                  <option value="8-11">8 – 11 {isEn ? 'years old' : 'سنوات'}</option>
                  <option value="12-14">12 – 14 {isEn ? 'years old' : 'سنة'}</option>
                  <option value="15-17">15 – 17 {isEn ? 'years old' : 'سنة'}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#231D28] border border-[#D5D0CA] dark:border-[#3E3545] space-y-4">
            <div className="font-serif text-sm font-medium text-[#6B5B73] dark:text-[#B8A9C9] flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{isEn ? '2. Parent / Guardian Contact' : '٢. بيانات ولي الأمر للتواصل والتنسيق'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1">
                  {isEn ? 'Parent’s Full Name' : 'اسم ولي الأمر'} <span className="text-[#6B5B73] dark:text-[#B8A9C9]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={(e) => updateForm({ parentName: e.target.value })}
                  placeholder={isEn ? 'e.g. Maryam Khan' : 'مثال: مريم خان'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-[#F5E6D3]/30 dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#87A878]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1">
                  {isEn ? 'Parent’s Email' : 'البريد الإلكتروني لولي الأمر'} <span className="text-[#6B5B73] dark:text-[#B8A9C9]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.parentEmail}
                  onChange={(e) => updateForm({ parentEmail: e.target.value })}
                  placeholder="parent@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-[#F5E6D3]/30 dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#87A878]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#362E3B]/80 dark:text-[#D5D0CA]/80 mb-1">
                  {isEn ? 'Parent’s WhatsApp' : 'رقم واتساب ولي الأمر'}
                </label>
                <input
                  type="tel"
                  value={formData.parentWhatsapp}
                  onChange={(e) => updateForm({ parentWhatsapp: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D0CA] dark:border-[#3E3545] bg-[#F5E6D3]/30 dark:bg-[#1E1923] text-sm text-[#362E3B] dark:text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#87A878]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Starting Level Assessment */}
      <div className="space-y-2 pt-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#362E3B]/70 dark:text-[#D5D0CA]/70">
          <BookMarked className="w-3.5 h-3.5 text-[#87A878]" />
          <span>
            {isChild
              ? isEn ? 'Child’s Current Level in this Subject' : 'المستوى التقريبي الحالي للطفل'
              : isEn ? 'Where Are You Starting From?' : 'أين يبدأ مستواك الحالي؟'}
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {levels.map((lvl) => {
            const currentSelected = isChild ? formData.childLevel : formData.currentLevel;
            const isSelected = currentSelected === lvl.key;
            return (
              <button
                key={lvl.key}
                type="button"
                onClick={() =>
                  isChild
                    ? updateForm({ childLevel: lvl.key })
                    : updateForm({ currentLevel: lvl.key })
                }
                className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#F5E6D3] dark:bg-[#29232F] border-[#87A878] ring-1 ring-[#87A878] text-[#362E3B] dark:text-[#F5E6D3]'
                    : 'bg-white dark:bg-[#231D28] border-[#D5D0CA] dark:border-[#3E3545] text-[#362E3B]/70 dark:text-[#D5D0CA]/70 hover:bg-[#F5E6D3]/30'
                }`}
              >
                <div className="font-serif text-xs font-medium mb-0.5">
                  {isEn ? lvl.label : lvl.arabicLabel}
                </div>
                <div className="text-[10px] text-[#362E3B]/55 dark:text-[#D5D0CA]/55 line-clamp-2">
                  {lvl.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trust & Privacy Reassurance */}
      <div className="p-3.5 rounded-xl bg-[#EDE3D4] dark:bg-[#29232F] border border-[#87A878]/30 flex items-center gap-3 text-xs text-[#362E3B]/80 dark:text-[#D5D0CA]/80">
        <ShieldCheck className="w-5 h-5 text-[#87A878] shrink-0" />
        <span>
          {isEn
            ? 'We respect your privacy. No passwords, payment cards, or sensitive documents are requested. Your information is used strictly to coordinate your lesson with Mahmoud.'
            : 'نحترم خصوصيتكم التامة. لا نطلب أي بيانات بطاقات بنكية أو مستندات حساسة. تُستخدم بياناتكم حصراً للتنسيق الشخصي مع محمود.'}
        </span>
      </div>

      {/* Controls */}
      <div className="pt-4 border-t border-[#D5D0CA] dark:border-[#3E3545] flex items-center justify-between gap-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-[#362E3B]/80 dark:text-[#D5D0CA]/80 hover:bg-[#EDE3D4] dark:hover:bg-[#29232F] transition-colors cursor-pointer"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          <span>{isEn ? 'Back to Goals' : 'الرجوع للأهداف'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={!isFormValid}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#6B5B73] hover:bg-[#584960] text-white text-sm font-medium shadow-xs disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <span>{isEn ? 'Next: Lesson Length & Type' : 'التالي: مدة ونوع الدرس'}</span>
          <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>
    </div>
  );
};
