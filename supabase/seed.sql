-- ====================================================================
-- MAHMOUD TEACHING PLATFORM — PHASE 3 INITIAL SEED DATA
-- File: supabase/seed.sql
-- Role: Verified Master Offerings, Baseline Settings, and Initial Data
-- ====================================================================

-- 1. INSERT 13 MASTER SERVICES (Master Spec Section 7)
INSERT INTO public.services (
    id, category, title, arabic_title, short_description, arabic_description,
    display_order, is_active, hourly_rate_usd, supported_durations, trial_allowed
) VALUES
-- Quran
('quran-reading', 'quran', 'Quran Reading', 'تلاوة القرآن الكريم',
 'Master accurate letter articulation, phonetic flow, and direct Mushaf reading from Noorani basics to fluency.',
 'تأسيس القراءة الصحيحة من المصحف، وضبط مخارج الحروف للمبتدئين وغير الناطقين بالعربية.',
 1, true, 7.00, '{30, 45, 60}', true),

('quran-memorization', 'quran', 'Quran Memorization', 'حفظ القرآن الكريم',
 'Systematic memorization schedules tailored to your pace with consistent revision targets and retention benchmarks.',
 'منهجية منظمة لحفظ السور والآيات مع تثبيت الحفظ القديم ووضع أهداف مراجعة أسبوعية.',
 2, true, 7.00, '{30, 45, 60}', true),

('quran-revision', 'quran', 'Quran Revision', 'مراجعة وتثبيت القرآن',
 'Dedicated review sessions for huffadh to systematically strengthen past juz, eliminate doubts, and fortify memory.',
 'جلسات مخصصة للحفاظ لمراجعة الأجزاء السابقة وتثبيت المتشابهات وضمان عدم النسيان.',
 3, true, 7.00, '{30, 45, 60}', true),

('tajweed', 'quran', 'Tajweed Rules & Application', 'أحكام التجويد والتطبيق',
 'Theoretical and practical application of Nun Sakinah, Meem Sakinah, Madd, and letter characteristics during live recitation.',
 'دراسة قواعد التجويد النظرية والتطبيق المباشر أثناء التلاوة برواية حفص عن عاصم.',
 4, true, 7.00, '{30, 45, 60}', true),

-- Islamic Studies
('islamic-studies', 'islamic_studies', 'General Islamic Studies', 'الدراسات الإسلامية العامة',
 'Comprehensive and age-appropriate Islamic curriculum covering essentials of faith, manners, and daily worship.',
 'منهج إسلامي متكامل ومناسب لكل الأعمار يغطي أركان الإسلام والأخلاق والآداب اليومية.',
 5, true, 7.00, '{30, 45, 60}', true),

('aqeedah', 'islamic_studies', 'Authentic Aqeedah', 'العقيدة الإسلامية الصافية',
 'Pure Islamic creed and the fundamentals of Tawheed, explained rationally and calmly to ground personal faith.',
 'دراسة أصول الإيمان والعقيدة الإسلامية بأسلوب هادئ وواضح يرسخ اليقين في القلب.',
 6, true, 7.00, '{30, 45, 60}', true),

('fiqh', 'islamic_studies', 'Practical Fiqh', 'الفقه الإسلامي الميسر',
 'Essential rulings of purification (Taharah), prayer (Salah), fasting, and everyday contemporary transactions.',
 'أحكام الطهارة والصلاة والعبادات والمعاملات اليومية بأسلوب ميسر ومرتبط بحياة المسلم المعاصر.',
 7, true, 7.00, '{30, 45, 60}', true),

('seerah', 'islamic_studies', 'Prophetic Seerah', 'السيرة النبوية العطرة',
 'Deep chronological study of the life of the Prophet Muhammad ﷺ and his noble companions, deriving moral guidance.',
 'دراسة سيرة النبي المصطفى ﷺ وصحابته الكرام واستخلاص العبر والقدوة الحسنة للحياة اليومية.',
 8, true, 7.00, '{30, 45, 60}', true),

-- Arabic
('arabic-foundations', 'arabic', 'Arabic for Beginners (Reading, Writing & Phonics)', 'أساسيات اللغة العربية للمبتدئين',
 'A gentle, systematic start for non-Arabic speakers and reverts to build confidence letter by letter.',
 'مخصص لمن لا يعرف قراءة الحروف أو المسلمين الجدد لبناء الأساس بثقة.',
 9, true, 7.00, '{30, 45, 60}', true),

('modern-standard-arabic', 'arabic', 'Modern Standard Arabic (Fusha)', 'العربية الفصحى المعاصرة',
 'Formal academic Arabic for literature, Islamic classical texts, Quranic comprehension, and modern media.',
 'العربية الفصحى للأغراض الأكاديمية وقراءة النصوص الإسلامية والتراثية وفهم لغة القرآن والإعلام.',
 10, true, 7.00, '{30, 45, 60}', true),

('arabic-conversation', 'arabic', 'Arabic Conversation & Fluency', 'المحادثة والطلاقة باللغة العربية',
 'Interactive speaking drills to overcome hesitation, expand active vocabulary, and converse naturally in real scenarios.',
 'تدريبات شفهية وتطبيقية لكسر حاجز الخوف والتحدث بطلاقة في مختلف المواقف اليومية.',
 11, true, 7.00, '{30, 45, 60}', true),

('egyptian-arabic', 'arabic', 'Egyptian Colloquial Arabic (Ammiya)', 'اللهجة المصرية الحوارية',
 'Learn the most widely understood spoken dialect across the Arab world for daily family, cultural, and travel interaction.',
 'تعلم اللهجة الأكثر فهماً وانتشاراً في العالم العربي للتواصل العائلي والسياحة والثقافة.',
 12, true, 7.00, '{30, 45, 60}', true),

-- English
('english', 'english', 'English Language Support', 'اللغة الإنجليزية والتواصل',
 'Personalized English speaking, conversational confidence, and grammar support taught by an IELTS C1 certified instructor.',
 'تطوير مهارات التحدث والمحادثة وبناء الثقة في التواصل باللغة الإنجليزية مع معلم حاصل على C1 في IELTS.',
 13, true, 10.00, '{30, 45, 60}', true)
ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    title = EXCLUDED.title,
    arabic_title = EXCLUDED.arabic_title,
    short_description = EXCLUDED.short_description,
    arabic_description = EXCLUDED.arabic_description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    hourly_rate_usd = EXCLUDED.hourly_rate_usd,
    supported_durations = EXCLUDED.supported_durations,
    trial_allowed = EXCLUDED.trial_allowed;

-- 2. INSERT TESTIMONIALS (Curated Authentic Feedback)
INSERT INTO public.testimonials (
    student_name, display_name, role_or_relationship, content, arabic_content,
    rating, source, is_active, display_order
) VALUES
('Tariq M.', 'Tariq M.', 'Adult Learner, Toronto, Canada',
 'Ustadh Mahmoud is remarkably patient. When we started, I struggled with Makharij differences between Dhad and Dha. In 8 weeks, my recitation transformed completely.',
 'الأستاذ محمود صبور للغاية. في البداية كنت أخلط كثيراً بين الضاد والظاء، وخلال 8 أسابيع تغيرت تلاوتي بالكامل وأصبحت أكثر ثقة.',
 5, 'direct_student', true, 1),

('Sarah K.', 'Sarah K.', 'Mother of 2, London, UK',
 'Finding a teacher who understands growing up in the West was crucial for our 9-year-old son. Mahmoud makes Arabic engaging and never intimidating.',
 'كان من الضروري أن نجد معلماً يفهم طبيعة تربية أطفالنا في الغرب. الأستاذ محمود جعل ابني يحب حصة اللغة العربية بعد أن كان يتجنبها.',
 5, 'direct_student', true, 2),

('Dr. Bilal A.', 'Dr. Bilal A.', 'Adult Learner, Chicago, USA',
 'As a physician with an irregular schedule, the direct 1-on-1 model and Mahmoud’s reliable communication on WhatsApp made continuing my Quran hifz achievable.',
 'كطبيب مواعيدي متغيرة، ساعدتني المرونة والتواصل المباشر مع الأستاذ محمود على المتابعة الدورية وحفظ القرآن دون انقطاع.',
 5, 'direct_student', true, 3),

('Amina & Zayd', 'Amina & Zayd', 'Parents, Sydney, Australia',
 'The trial session gave us total clarity on the plan. Our kids look forward to their weekly Fiqh and Tajweed sessions without being forced.',
 'الجلسة التجريبية وضحت لنا خطة التعلم بدقة. أطفالنا ينتظرون حصتهم الأسبوعية بشوق ودون أي إجبار.',
 5, 'direct_student', true, 4);

-- 3. INSERT VERIFIED AI KNOWLEDGE ENTITIES (Controlled Source of Truth)
INSERT INTO public.ai_knowledge (category, title, content, is_verified, tags) VALUES
('teacher_background', 'Ustadh Mahmoud Qualifications',
 'Ustadh Mahmoud is an Al-Azhar University graduate with over 3 years of online tutoring experience teaching international learners. He holds a Preply Online Teaching Certificate and has achieved IELTS C1 English proficiency.',
 true, ARRAY['qualifications', 'credentials', 'al-azhar', 'ielts']),

('booking_rules', 'Free Trial Policy',
 'Every new student is eligible for one complimentary 30-minute free trial session (maximum 45 minutes). The trial is a relaxed meet-and-greet, level assessment, mini-lesson sample, and personalized study plan recommendation. Strictly one free trial per new student.',
 true, ARRAY['trial', 'policy', 'duration', 'assessment']),

('booking_rules', 'Cancellation and Rescheduling Policy',
 'Students can cancel or reschedule freely up to 3 hours before the scheduled lesson start time through the direct booking portal. Inside the 3-hour window, self-service is locked, and students are instructed to contact Mahmoud directly on WhatsApp.',
 true, ARRAY['cancellation', 'rescheduling', 'policy', '3-hour-rule']),

('pricing_philosophy', 'Pricing and Lesson Durations',
 'Lessons are available in 30, 45, or 60 minute durations. Baseline rate is approximately $7/hour for Quran and Islamic Studies, with English at $10/hour. Sessions longer than 60 minutes require custom approval.',
 true, ARRAY['pricing', 'durations', 'fees']);

-- 4. INSERT DEFAULT SYSTEM SETTINGS (Master Spec Sections 18, 21, 22)
INSERT INTO public.settings (key, value, category, description) VALUES
('general_profile', '{"displayName": "Ustadh Mahmoud", "email": "contact@mahmoud-teaching.com", "whatsapp": "+201000000000", "teacherTimezone": "Africa/Cairo"}'::jsonb, 'profile', 'General teacher contact and primary timezone'),

('cancellation_policy', '{"minimumNoticeHours": 3, "allowSelfService": true, "urgentNoticeAction": "whatsapp_contact"}'::jsonb, 'policy', '3-hour self-service cancellation and reschedule policy rule'),

('free_trial_policy', '{"maxFreeTrialsPerStudent": 1, "defaultDurationMinutes": 30, "maxDurationMinutes": 45, "requirePhoneOrEmail": true}'::jsonb, 'policy', 'Strict one-free-trial limit per student'),

('reminders_configuration', '{"intervals": ["24h_before", "1h_before"], "channels": ["email", "whatsapp"], "enabled": true}'::jsonb, 'reminders', 'Automated lesson reminder trigger schedule');
