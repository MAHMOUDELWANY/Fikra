import { ServiceOption, TimezoneOption, MockBookingRecord, DayAvailability, TimeSlot, LessonDuration } from './types';

export const BOOKING_SERVICES: ServiceOption[] = [
  // --- QURAN PILLAR ---
  {
    id: 'quran-reading',
    name: 'Quran Reading (Noorani Qaidah & Fluency)',
    arabicName: 'القراءة القرآنية والقاعدة النورانية',
    group: 'quran',
    tagline: 'Step-by-step reading mastery from Arabic letters to fluent recitation.',
    arabicTagline: 'من الحروف الأساسية إلى القراءة التامة السلسة للمصحف.',
    description: 'A structured, patient approach to phonetics, letter connections, vowel signs (Harakat), and smooth reading directly from the Mushaf.',
    arabicDescription: 'منهج صبور ومنظم يبدأ من مخارج الحروف وحركاتها وحتى التلاوة المباشرة من المصحف.',
    suggestedGoals: [
      'Learn Arabic letters and vowels from scratch',
      'Improve reading fluency and eliminate hesitation',
      'Transition from Nourani Qaidah to the Mushaf',
      'Learn correct Quranic pausing and stopping signs'
    ],
    arabicSuggestedGoals: [
      'تعلم الحروف والحركات من البداية',
      'تحسين طلاقة القراءة والتخلص من التردد',
      'الانتقال من القاعدة النورانية إلى المصحف الشريف',
      'إتقان علامات الوقف والابتداء'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 7
  },
  {
    id: 'tajweed',
    name: 'Tajweed Rules & Applied Articulation',
    arabicName: 'أحكام التجويد ومخارج الحروف',
    group: 'quran',
    tagline: 'Practical application of Makhaarij, Sifaat, and recitation rules.',
    arabicTagline: 'تطبيق عملي لأحكام النون والميم والمدود ومخارج الحروف.',
    description: 'Learn the exact rules of Tajweed through guided repetition and real-time auditory correction, applying theoretical rules directly into verses.',
    arabicDescription: 'إتقان أحكام التلاوة عبر الترديد والتصحيح الصوتي المباشر والتدريب العملي.',
    suggestedGoals: [
      'Master rules of Noon Sakinah, Meem Sakinah, and Madd',
      'Correct letter articulation points (Makhaarij)',
      'Refine heavy and light letters (Tafkheem & Tarqeeq)',
      'Prepare for structured Tajweed certification / Ijazah path'
    ],
    arabicSuggestedGoals: [
      'إتقان أحكام النون والميم والمدود',
      'تصحيح مخارج وصفات الحروف بدقة',
      'التمييز العملي بين التفخيم والترقيق',
      'التأسيس لمنهج الإجازة القرآنية'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 7
  },
  {
    id: 'quran-memorization',
    name: 'Quran Memorization (Hifz)',
    arabicName: 'تحفيظ القرآن الكريم',
    group: 'quran',
    tagline: 'Sustainable, personalized daily memorization pacing with firm retention.',
    arabicTagline: 'حفظ متدرج ورصين يراعي ظروف المتعلم مع تثبيت دائم.',
    description: 'Individualized Hifz plan tailored to your memory pace, accompanied by daily repetition strategies so new memorization remains rock-solid.',
    arabicDescription: 'خطة حفظ فردية تراعي وقتك وطاقتك الاستيعابية وتعتمد استراتيجيات التثبيت المستمر.',
    suggestedGoals: [
      'Memorize Juz’ Amma or Juz’ Tabarak',
      'Establish a disciplined daily Hifz routine',
      'Memorize selected Surahs (Al-Kahf, Yaseen, Al-Mulk)',
      'Complete long-term full Quran memorization track'
    ],
    arabicSuggestedGoals: [
      'حفظ جزء عم أو جزء تبارك',
      'بناء ورد يومي منضبط للحفظ',
      'حفظ سور مخصوصة كالملك والكهف ويس',
      'السير في خطة ختم القرآن الكريم كاملاً'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 7
  },
  {
    id: 'quran-revision',
    name: 'Quran Revision & Retention (Muraja’ah)',
    arabicName: 'المراجعة والتثبيت القرآني',
    group: 'quran',
    tagline: 'Re-strengthening previously memorized parts with structured oversight.',
    arabicTagline: 'إعادة تثبيت ما سبق حفظه وتصحيح المتشابهات.',
    description: 'Dedicated revision cycles for students who have memorized parts of the Quran and want to eliminate doubts, mutashabihat, and memory slips.',
    arabicDescription: 'جلسات مراجعة منتظمة لمن سبق لهم الحفظ لضبط المتشابهات وإتقان الحفظ.',
    suggestedGoals: [
      'Revise and solidify previously memorized Surahs',
      'Fix Mutashabihat (similar sounding verses)',
      'Prepare for an oral Quran examination',
      'Maintain an unbroken weekly recitation cycle'
    ],
    arabicSuggestedGoals: [
      'تثبيت وتمكين الأجزاء المحفوظة سابقاً',
      'ضبط المتشابهات اللفظية في الآيات',
      'الاستعداد للاختبارات القرآنية',
      'المحافظة على ورد مراجعة أسبوعي مستمر'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 7
  },

  // --- ISLAMIC STUDIES PILLAR ---
  {
    id: 'islamic-studies',
    name: 'Islamic Studies for Adults & Youth',
    arabicName: 'الدراسات الإسلامية العامة',
    group: 'islamic_studies',
    tagline: 'Balanced, foundational Muslim knowledge taught with warmth and context.',
    arabicTagline: 'معارف إسلامية أصيلة بأسلوب تربوي هادئ ومناسب للغرب.',
    description: 'Comprehensive curriculum spanning the pillars of Islam, everyday manners (Adab), core du’as, and life application for learners in the West.',
    arabicDescription: 'منهج متكامل يغطي أركان الإسلام، الآداب والأذكار اليومية للمسلمين في المهجر.',
    suggestedGoals: [
      'Build core Islamic literacy for children/teens in Western schools',
      'Understand the 5 Pillars and 6 Articles of Faith',
      'Learn daily Sunnah practices, du’as, and character',
      'Safely ask personal questions about faith and identity'
    ],
    arabicSuggestedGoals: [
      'بناء وعي إسلامي متين للأبناء في الغرب',
      'فهم أركان الإسلام والإيمان بعمق',
      'تعلم الأذكار والآداب النبوية اليومية',
      'مساحة آمنة للنقاش والإجابة عن تساؤلات الهوية'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 7
  },
  {
    id: 'fiqh',
    name: 'Practical Fiqh (Worship & Daily Life)',
    arabicName: 'الفقه العملي الميسر',
    group: 'islamic_studies',
    tagline: 'Clear, step-by-step guidance on Taharah, Salah, Sawm, and everyday halal.',
    arabicTagline: 'بيان أحكام الطهارة والصلاة والصيام والمعاملات اليومية.',
    description: 'Accessible learning on how to perform acts of worship accurately according to established mainstream Islamic jurisprudence, without sectarian division.',
    arabicDescription: 'شرح ميسر لأحكام العبادات والمعاملات وفق المنهج المعتدل دون تعقيد.',
    suggestedGoals: [
      'Master the step-by-step conditions, obligations, and Sunnahs of Salah',
      'Learn the rules of Taharah (wudu, ghusl, purification)',
      'Understand rules of Fasting (Ramadan) and Zakah basics',
      'Clarify everyday Halal vs Haram rulings'
    ],
    arabicSuggestedGoals: [
      'إتقان شروط وأركان وسنن الصلاة العملية',
      'تعلم أحكام الطهارة والوضوء والغسل',
      'فهم أحكام الصيام وزكاة الفطر والمال',
      'معرفة الحلال والحرام في شؤون الحياة اليومية'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 7
  },
  {
    id: 'aqeedah',
    name: 'Aqeedah (Islamic Creed & Core Beliefs)',
    arabicName: 'العقيدة الإسلامية الصافية',
    group: 'islamic_studies',
    tagline: 'Clarity of faith, understanding Allah’s Names, and grounding spiritual certainty.',
    arabicTagline: 'ترسيخ الإيمان ومعرفة أسماء الله الحسنى وصفاته بأمان وسكينة.',
    description: 'Grounding the heart in sound Islamic beliefs, the Names and Attributes of Allah, angels, books, prophets, and the Day of Judgment.',
    arabicDescription: 'غرس الإيمان الصحيح في القلب والتعرف على أركان الإيمان بأسلوب يورث الطمأنينة.',
    suggestedGoals: [
      'Understand the Beautiful Names of Allah and their spiritual impact',
      'Build unshakeable certainty and answers to modern doubts',
      'Deepen understanding of destiny (Qadar) and divine wisdom',
      'Teach foundational monotheism (Tawheed) to children'
    ],
    arabicSuggestedGoals: [
      'التعرف على أسماء الله الحسنى وأثرها الروحي',
      'بناء اليقين والإجابة عن الشبهات المعاصرة',
      'فهم حكمة الله وقضائه وقدره',
      'تعليم التوحيد للأطفال بصورة ميسرة'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 7
  },
  {
    id: 'seerah',
    name: 'Seerah (Prophetic Biography & Moral Character)',
    arabicName: 'السيرة النبوية والشمائل المحمدية',
    group: 'islamic_studies',
    tagline: 'The inspiring life, character, and leadership of Prophet Muhammad ﷺ.',
    arabicTagline: 'دراسة سيرة النبي ﷺ وأخلاقه القيادية والإنسانية.',
    description: 'Chronological exploration of the Prophet’s life ﷺ from Makkah to Madinah, drawing practical wisdom, family ethics, and moral strength.',
    arabicDescription: 'رحلة إيمانية مع سيرة الحبيب ﷺ لاستلهام الدروس والأخلاق في حياتنا المعاصرة.',
    suggestedGoals: [
      'Learn the chronological life story of the Prophet ﷺ',
      'Instill love of the Prophet ﷺ in family and children',
      'Study the morals and interactions of the Companions',
      'Apply Prophetic empathy and character in daily life'
    ],
    arabicSuggestedGoals: [
      'دراسة أحداث السيرة النبوية بترتيب زمني ملهم',
      'غرس محبة النبي ﷺ في قلوب الأبناء',
      'التعرف على سِيَر الصحابة الكرام وتضحياتهم',
      'تطبيق الأخلاق والرحمة المحمدية في المعاملات'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 7
  },

  // --- ARABIC PILLAR ---
  {
    id: 'arabic-conversation',
    name: 'Arabic Conversation & Speaking Fluency',
    arabicName: 'المحادثة والتحدث باللغة العربية',
    group: 'arabic',
    tagline: 'Practical oral confidence through immersive, encouraging dialogue.',
    arabicTagline: 'اكتساب الشجاعة في التحدث عبر الحوار التفاعلي المشجع.',
    description: 'Overcome fear of speaking. Interactive dialogue practice on daily life, family, travel, hobbies, and authentic discussions with live correction.',
    arabicDescription: 'كسر حاجز الخوف من التحدث عبر جلسات حوارية تشمل مواقف الحياة اليومية والتعبير الحر.',
    suggestedGoals: [
      'Speak Arabic comfortably without anxiety',
      'Acquire natural conversational phrases and idioms',
      'Improve listening comprehension and pronunciation',
      'Build vocabulary for everyday discussions'
    ],
    arabicSuggestedGoals: [
      'التحدث بالعربية دون قلق أو تردد',
      'اكتساب تعبيرات ومصطلحات طبيعية شائعة',
      'تطوير الاستماع وفهم المتحدثين الأصليين',
      'زيادة الحصيلة اللغوية للمحادثات اليومية'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 7
  },
  {
    id: 'modern-standard-arabic',
    name: 'Modern Standard Arabic (Fusha - Grammar & Texts)',
    arabicName: 'العربية الفصحى وقواعد النحو',
    group: 'arabic',
    tagline: 'The timeless language of literature, media, and classical texts.',
    arabicTagline: 'لغة القرآن والإعلام والأدب مع فهم النحو والصرف.',
    description: 'Comprehensive instruction in reading, grammar (Nahw), morphology (Sarf), and writing for students, academics, and serious learners.',
    arabicDescription: 'تعليم متدرج في قواعد النحو والصرف وفهم النصوص العربية الفصيحة.',
    suggestedGoals: [
      'Understand classical Arabic grammar (Nahw & Sarf)',
      'Read Arabic articles, books, and Islamic literature',
      'Understand the language of the Quran directly without translation',
      'Achieve academic fluency in Arabic writing and reading'
    ],
    arabicSuggestedGoals: [
      'فهم قواعد النحو والصرف بطريقة مبسطة',
      'قراءة النصوص والمقالات والكتب التراثية',
      'فهم معاني القرآن الكريم باللغة العربية مباشرة',
      'تطوير مهارات الكتابة والقراءة الأكاديمية'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 7
  },
  {
    id: 'egyptian-arabic',
    name: 'Egyptian Colloquial Arabic (Ammiyya)',
    arabicName: 'اللهجة المصرية العامية',
    group: 'arabic',
    tagline: 'The most widely understood dialect across the entire Arab world.',
    arabicTagline: 'اللهجة الأكثر انتشاراً وفهماً في العالم العربي.',
    description: 'Learn authentic Egyptian Ammiyya for real-life conversations, travel, films, and connecting effortlessly with native Arabic speakers worldwide.',
    arabicDescription: 'تعلم اللهجة المصرية المحبوبة للمحادثات اليومية والسفر والتواصل الممتع.',
    suggestedGoals: [
      'Communicate naturally with friends, family, or travel in Egypt',
      'Understand Egyptian media, shows, and cultural references',
      'Master common street phrases, greetings, and humor',
      'Switch smoothly between formal Arabic and everyday dialect'
    ],
    arabicSuggestedGoals: [
      'التواصل التلقائي عند السفر أو مع الأصدقاء',
      'فهم الحوارات والأفلام والمسلسلات المصرية',
      'إتقان التعبيرات والتحيات اليومية الشعبية',
      'الربط الذكي بين الفصحى واللهجة الدارجة'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 7
  },
  {
    id: 'arabic-foundations',
    name: 'Arabic for Beginners (Reading, Writing & Phonics)',
    arabicName: 'أساسيات اللغة العربية للمبتدئين',
    group: 'arabic',
    tagline: 'A gentle, systematic start for non-Arabic speakers and reverts.',
    arabicTagline: 'بداية هادئة ومنهجية لغير الناطقين بالعربية والمسلمين الجدد.',
    description: 'Designed specifically for those who cannot yet read the Arabic script or have just embraced Islam, building confidence letter by letter.',
    arabicDescription: 'مخصص لمن لا يعرف قراءة الحروف أو المسلمين الجدد لبناء الأساس بثقة.',
    suggestedGoals: [
      'Master the Arabic alphabet and writing strokes',
      'Read basic vocabulary, road signs, and prayer texts',
      'Form first spoken sentences and personal greetings',
      'Gain confidence in basic Arabic pronunciation'
    ],
    arabicSuggestedGoals: [
      'إتقان الحروف الهجائية ورسمها وقراءتها',
      'قراءة الكلمات الأساسية ونصوص الصلوات',
      'تكوين أولى الجمل الشفهية والتحيات',
      'اكتساب نطق عربي سليم وواثق'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 7
  },

  // --- ENGLISH PILLAR ---
  {
    id: 'english',
    name: 'English Language (Conversation, IELTS & Academic)',
    arabicName: 'اللغة الإنجليزية (المحادثة والتأهيل الدولي)',
    group: 'english',
    tagline: 'Taught by Mahmoud with C1 IELTS certified proficiency.',
    arabicTagline: 'تدريس شخصي بمستوى معتمد C1 في الآيلتس.',
    description: 'Personalized English training focusing on professional speaking confidence, IELTS exam preparation, accent clarity, and academic writing.',
    arabicDescription: 'تطوير الطلاقة الإنجليزية، التحضير لاختبارات الآيلتس، وتحسين النطق والقواعد.',
    suggestedGoals: [
      'Score 7.0+ in IELTS Speaking and Writing',
      'Gain executive English conversational confidence',
      'Eliminate grammatical errors in professional emails and speech',
      'Improve American/British accent clarity and natural flow'
    ],
    arabicSuggestedGoals: [
      'تحقيق درجة 7.0+ في اختبار الآيلتس',
      'اكتساب ثقة التحدث في بيئات العمل والدراسة',
      'تصحيح الأخطاء القواعدية المتكررة',
      'تحسين النطق ومخارج الأصوات الإنجليزية'
    ],
    defaultDurations: [30, 45, 60],
    hourlyRateUsd: 10
  }
];

export const MAJOR_TIMEZONES: TimezoneOption[] = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)', city: 'New York / Toronto', offset: 'UTC-4 / UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)', city: 'Chicago / Dallas', offset: 'UTC-5 / UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)', city: 'Denver / Calgary', offset: 'UTC-6 / UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', city: 'Los Angeles / Vancouver', offset: 'UTC-7 / UTC-8' },
  { value: 'Europe/London', label: 'UK & Ireland Time (GMT / BST)', city: 'London / Dublin', offset: 'UTC+0 / UTC+1' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)', city: 'Paris / Berlin / Amsterdam', offset: 'UTC+1 / UTC+2' },
  { value: 'Africa/Cairo', label: 'Egypt Time (Mahmoud’s Timezone)', city: 'Cairo / Alexandria', offset: 'UTC+3' },
  { value: 'Asia/Riyadh', label: 'Arabian Standard Time (AST)', city: 'Riyadh / Makkah / Madinah', offset: 'UTC+3' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)', city: 'Dubai / Abu Dhabi', offset: 'UTC+4' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)', city: 'Sydney / Melbourne', offset: 'UTC+10 / UTC+11' },
  { value: 'Australia/Perth', label: 'Australian Western Time (AWST)', city: 'Perth', offset: 'UTC+8' }
];

// Helper to calculate exact lesson rate based on service and duration
export function calculateLessonFee(serviceId: string, duration: LessonDuration, isTrial: boolean): number {
  if (isTrial) return 0;
  const service = BOOKING_SERVICES.find((s) => s.id === serviceId);
  const hourlyRate = service?.hourlyRateUsd || 7;
  
  if (duration === 30) {
    return Math.round((hourlyRate * 0.55) * 100) / 100; // e.g. $4.00 or $5.50
  }
  if (duration === 45) {
    return Math.round((hourlyRate * 0.8) * 100) / 100; // e.g. $6.00 or $8.00
  }
  return hourlyRate; // 60 min = baseline hourly rate (approx $7 or $10)
}

// Generate realistic mock availability for 21 days from today
export function generateMockAvailability(baseDate = new Date()): DayAvailability[] {
  const days: DayAvailability[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Start from tomorrow so visitors always book realistic upcoming slots
  for (let i = 1; i <= 21; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);

    const dayOfWeekIndex = d.getDay();
    const dayOfWeek = dayNames[dayOfWeekIndex];
    const dayOfMonth = d.getDate();
    const monthName = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const monthPadded = String(d.getMonth() + 1).padStart(2, '0');
    const dayPadded = String(dayOfMonth).padStart(2, '0');
    const dateString = `${year}-${monthPadded}-${dayPadded}`;

    // Friday has slightly reduced slots for Jumu'ah prayer, Sundays are teaching days
    // Let day 7 and 14 have "no availability" simulation to demonstrate empty state gracefully
    const isSpecialOffDay = i === 6 || i === 13;

    if (isSpecialOffDay) {
      days.push({
        dateString,
        dayOfWeek,
        dayOfMonth,
        monthName,
        isAvailable: false,
        reasonUnavailable: 'Mahmoud has scheduled dedicated study and revision on this day.',
        slots: []
      });
      continue;
    }

    // Standard available slots
    const slots: TimeSlot[] = [
      // Morning
      { id: `${dateString}-0900`, time24: '09:00', timeDisplay: '09:00 AM', period: 'morning', available: true, cairoTimeEquiv: '04:00 PM' },
      { id: `${dateString}-1030`, time24: '10:30', timeDisplay: '10:30 AM', period: 'morning', available: i % 3 !== 0, cairoTimeEquiv: '05:30 PM' },
      { id: `${dateString}-1145`, time24: '11:45', timeDisplay: '11:45 AM', period: 'morning', available: true, cairoTimeEquiv: '06:45 PM' },
      // Afternoon
      { id: `${dateString}-1400`, time24: '14:00', timeDisplay: '02:00 PM', period: 'afternoon', available: true, cairoTimeEquiv: '09:00 PM' },
      { id: `${dateString}-1530`, time24: '15:30', timeDisplay: '03:30 PM', period: 'afternoon', available: i % 2 === 0, cairoTimeEquiv: '10:30 PM' },
      { id: `${dateString}-1700`, time24: '17:00', timeDisplay: '05:00 PM', period: 'afternoon', available: true, cairoTimeEquiv: '12:00 AM' },
      // Evening
      { id: `${dateString}-1830`, time24: '18:30', timeDisplay: '06:30 PM', period: 'evening', available: true, cairoTimeEquiv: '01:30 AM' },
      { id: `${dateString}-2000`, time24: '20:00', timeDisplay: '08:00 PM', period: 'evening', available: i % 4 !== 0, cairoTimeEquiv: '03:00 AM' },
      { id: `${dateString}-2115`, time24: '21:15', timeDisplay: '09:15 PM', period: 'evening', available: true, cairoTimeEquiv: '04:15 AM' }
    ];

    days.push({
      dateString,
      dayOfWeek,
      dayOfMonth,
      monthName,
      isAvailable: true,
      slots
    });
  }

  return days;
}

// Sample mock bookings to demonstrate both states of Cancellation / Rescheduling Policy
// Rule from Master Spec: Students can cancel or reschedule up to 3 hours before lesson.
// Within 3 hours: self-service is disabled; student must contact Mahmoud.
export function getSampleExistingBookings(): MockBookingRecord[] {
  const now = new Date();

  // Booking 1: 24 hours from now -> ELIGIBLE to cancel or reschedule self-service
  const futureEligible = new Date(now.getTime() + 26 * 60 * 60 * 1000);

  // Booking 2: 75 minutes from now -> INELIGIBLE (< 3 hours), must contact Mahmoud
  const soonIneligible = new Date(now.getTime() + 75 * 60 * 1000);

  return [
    {
      reference: 'MHM-84291',
      serviceName: 'Quran Reading (Noorani Qaidah & Fluency)',
      learnerName: 'Zayd Al-Hassan',
      email: 'zayd.alhassan@example.com',
      whatsapp: '+1 (416) 555-0182',
      scheduledIsoDatetime: futureEligible.toISOString(),
      durationMinutes: 30,
      timezone: 'America/Toronto',
      mode: 'trial',
      status: 'confirmed'
    },
    {
      reference: 'MHM-39042',
      serviceName: 'Tajweed Rules & Applied Articulation',
      learnerName: 'Yusuf Rahman',
      parentName: 'Ibrahim Rahman',
      email: 'ibrahim.rahman@example.com',
      whatsapp: '+44 7700 900341',
      scheduledIsoDatetime: soonIneligible.toISOString(),
      durationMinutes: 45,
      timezone: 'Europe/London',
      mode: 'regular',
      status: 'confirmed'
    }
  ];
}
