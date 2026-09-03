import { ServicePillar, TestimonialItem, FAQItem } from '../types';

export const SERVICES_DATA: ServicePillar[] = [
  {
    id: 'quran',
    title: 'Quran & Tajweed',
    arabicTitle: 'القرآن والتجويد',
    description: 'Structured, patient guidance from letter phonetics and articulation to fluent recitation and memorization.',
    services: [
      {
        id: 'quran-reading',
        name: 'Quran Reading',
        category: 'quran',
        tagline: 'From recognizing letters and vowels to fluent recitation directly from the Mushaf.',
        description: 'For adults and children who want to read the Quran independently. We start with letter shapes, vocal points of articulation (Makharij), and short vowels, building slowly and patiently until full verses flow naturally.',
        whoIsItFor: 'Beginners of any age, adults returning to the Quran, or children starting their first Noorani / Qaida lessons.',
        whatYouWillLearn: [
          'Arabic alphabet phonetics and precise mouth positioning',
          'Connecting letters, short vowels, and Sukoon',
          'Reading full sentences from the Mushaf with correct rhythm',
          'Building reading stamina without frustration'
        ],
        durations: [30, 45, 60],
        recommendedFrequency: '2 to 3 sessions per week'
      },
      {
        id: 'tajweed',
        name: 'Tajweed Rules & Application',
        category: 'quran',
        tagline: 'Learn why and how every letter is pronounced according to authentic rules.',
        description: 'Tajweed is not just theory—it is hearing and practicing the exact acoustic characteristics of each letter. We study rules like Noon Sakinah, Meem Sakinah, Madd, and stopping rules, applying them immediately in your recitation.',
        whoIsItFor: 'Students who can already read Arabic text but want to recite with beauty, accuracy, and traditional correctness.',
        whatYouWillLearn: [
          'Accurate Makharij (points of articulation) and Sifaat (letter characteristics)',
          'Noon Sakinah, Tanween, and Meem Sakinah rules in practice',
          'Rules of Madd (elongation) and Waqf (stopping points)',
          'Practical ear training to catch your own recitation mistakes'
        ],
        durations: [30, 45, 60],
        recommendedFrequency: '2 sessions per week'
      },
      {
        id: 'quran-memorization',
        name: 'Quran Memorization (Hifz)',
        category: 'quran',
        tagline: 'A sustainable, steady memorization system built around your daily life.',
        description: 'Memorizing the Quran requires consistency over speed. We design a realistic weekly target—whether it is three verses or a full page—with live recitation to catch mistakes before they set into memory.',
        whoIsItFor: 'Committed learners and youth striving to memorize Surahs or complete sections of the Quran.',
        whatYouWillLearn: [
          'Pre-memorization reading to guarantee flawless Tajweed before committing to memory',
          'Systematic daily revision schedules that prevent forgetting older Surahs',
          'Understanding key word meanings to anchor memorization naturally',
          'Techniques to overcome difficult verse transitions (Mutashabihat)'
        ],
        durations: [30, 45, 60],
        recommendedFrequency: '2 to 4 sessions per week'
      },
      {
        id: 'quran-revision',
        name: 'Quran Revision & Retention',
        category: 'quran',
        tagline: 'Protect what you have memorized and solidify weak portions.',
        description: 'For students who have previously memorized parts of the Quran or the entire Quran and need a disciplined, supportive partner to recite to regularly and eliminate doubts.',
        whoIsItFor: 'Huffadh, students with partial memorization who have lost fluency, or those preparing for tests or revision goals.',
        whatYouWillLearn: [
          'Structured recitation cycles (Dawr) adapted to your free time',
          'Targeted diagnostic drills on previously forgotten Surahs',
          'Immediate error correction on subtle vocal and letter distinctions',
          'Confidence building to lead prayers or recite smoothly'
        ],
        durations: [30, 45, 60],
        recommendedFrequency: '2 to 3 sessions per week'
      }
    ]
  },
  {
    id: 'islamic_studies',
    title: 'Islamic Studies',
    arabicTitle: 'الدراسات الإسلامية',
    description: 'Authentic understanding of faith, daily practice, and the Prophet’s life, grounded in classical clarity and delivered in clear English.',
    services: [
      {
        id: 'aqeedah',
        name: 'Aqeedah (Islamic Creed)',
        category: 'islamic_studies',
        tagline: 'Understanding the fundamentals of belief with conviction and clarity.',
        description: 'A study of the core pillars of Iman—Belief in Allah, His Angels, His Books, His Messengers, the Last Day, and Divine Decree. Taught from sound classical sources with open dialogue for contemporary questions.',
        whoIsItFor: 'Adults seeking firm intellectual and spiritual grounding, and youth growing up in Western environments.',
        whatYouWillLearn: [
          'The meaning and implications of Tawheed in daily living',
          'The pillars of Iman explained without unnecessary philosophical jargon',
          'Clear answers to common questions about faith, purpose, and destiny',
          'Building a firm identity rooted in sound understanding'
        ],
        durations: [30, 45, 60],
        recommendedFrequency: '1 to 2 sessions per week'
      },
      {
        id: 'fiqh',
        name: 'Fiqh (Daily Practical Worship)',
        category: 'islamic_studies',
        tagline: 'How to perform your Salah, Wudu, fasting, and daily duties with certainty.',
        description: 'Clear, practical jurisprudence focused on what a Muslim needs in everyday life: Taharah (purification), Salah (prayer conditions and rulings), Sawm (fasting), and everyday ethics.',
        whoIsItFor: 'New Muslims, teens building independent habits, or adults wanting to verify their prayer and worship is correct.',
        whatYouWillLearn: [
          'Step-by-step practical Wudu, Ghusl, and purification rulings',
          'Complete mechanics of Salah: obligatory acts, Sunan, and prostrations of forgetfulness (Sujood as-Sahw)',
          'Rulings of fasting and traveler prayers',
          'Handling modern daily situations calmly with sound knowledge'
        ],
        durations: [30, 45, 60],
        recommendedFrequency: '1 to 2 sessions per week'
      },
      {
        id: 'seerah',
        name: 'Seerah (Prophetic Biography)',
        category: 'islamic_studies',
        tagline: 'Walking through the life, character, and decisions of the Prophet Muhammad ﷺ.',
        description: 'More than dates and events—a journey into the character, mercy, leadership, and emotional warmth of the Prophet ﷺ. We examine how he responded to hardship, family life, community building, and companionship.',
        whoIsItFor: 'Anyone wishing to develop a personal love and connection with the Prophet ﷺ through his living example.',
        whatYouWillLearn: [
          'Chronological narrative from pre-Islamic Arabia to the farewell pilgrimage',
          'The Prophet’s character in times of trial, victory, and grief',
          'Practical lessons in leadership, family manners, and patience',
          'Connecting historical incidents to our lives today'
        ],
        durations: [30, 45, 60],
        recommendedFrequency: '1 session per week'
      },
      {
        id: 'islamic-studies',
        name: 'Foundations of Islamic Studies',
        category: 'islamic_studies',
        tagline: 'A comprehensive starter curriculum designed for young learners and busy adults.',
        description: 'An integrated curriculum combining basic Aqeedah, everyday manners (Adab), essential Duas, and moral stories from the Quran and companions.',
        whoIsItFor: 'Children aged 7+, youth, and adults starting their learning from square one.',
        whatYouWillLearn: [
          'Essential daily Duas and their meanings',
          'Islamic manners (Adab) with parents, teachers, and society',
          'Core stories of the Prophets from Adam to Isa (peace be upon them)',
          'Building a loving, balanced Muslim character'
        ],
        durations: [30, 45, 60],
        recommendedFrequency: '2 sessions per week'
      }
    ]
  },
  {
    id: 'arabic',
    title: 'Arabic Language',
    arabicTitle: 'اللغة العربية',
    description: 'Learn Arabic that actually unlocks understanding—whether for Quran comprehension, formal reading, or natural everyday conversation.',
    services: [
      {
        id: 'modern-standard-arabic',
        name: 'Modern Standard Arabic (Fusha)',
        category: 'arabic',
        tagline: 'The universal written language of books, media, and scholarship across the Arab world.',
        description: 'Learn to read, write, and comprehend standard Arabic grammar (Nahw) and morphology (Sarf) using interactive texts, structured dialogues, and real-world reading material.',
        whoIsItFor: 'University students, Quran students wanting deep grammatical insight, and professionals.',
        whatYouWillLearn: [
          'Essential grammar structures explained simply in English without confusion',
          'Sentence construction, verb conjugations, and root patterns',
          'Reading comprehension of classical and modern passages',
          'Writing coherent sentences with accurate voweling'
        ],
        durations: [45, 60],
        recommendedFrequency: '2 sessions per week'
      },
      {
        id: 'arabic-conversation',
        name: 'Spoken Arabic Conversation',
        category: 'arabic',
        tagline: 'Overcome the fear of speaking through real, guided 1-on-1 dialogues.',
        description: 'A conversation-focused space where you talk from minute one. We simulate everyday scenarios—introductions, ordering food, asking directions, discussing family and work—gently correcting pronunciation and sentence cadence as you go.',
        whoIsItFor: 'Intermediate learners who understand grammar on paper but freeze when trying to speak aloud.',
        whatYouWillLearn: [
          'Rapid recall of high-frequency vocabulary and common idioms',
          'Natural sentence rhythm and conversational fillers',
          'Confidence speaking in full sentences without translating word-for-word in your head',
          'Listening comprehension with authentic native pacing'
        ],
        durations: [30, 45, 60],
        recommendedFrequency: '2 to 3 sessions per week'
      },
      {
        id: 'egyptian-arabic',
        name: 'Egyptian Spoken Arabic (Aammiyya)',
        category: 'arabic',
        tagline: 'The most widely understood dialect in the Arab world through cinema, music, and daily life.',
        description: 'Learn the warm, humorous, and expressive dialect of Egypt. Ideal for travel, speaking with Egyptian friends and family, or understanding Arab media effortlessly.',
        whoIsItFor: 'Spouses of Egyptians, travelers, diaspora youth, or students wanting a lively practical dialect.',
        whatYouWillLearn: [
          'Unique Egyptian vocabulary, expressions, and cultural nuances',
          'Everyday conversational patterns for greetings, bargaining, and hospitality',
          'Key grammatical shifts between Fusha and Egyptian dialect',
          'Pronunciation secrets that make you sound natural immediately'
        ],
        durations: [30, 45, 60],
        recommendedFrequency: '1 to 2 sessions per week'
      },
      {
        id: 'arabic-foundations',
        name: 'Arabic Foundations for Non-Arabs',
        category: 'arabic',
        tagline: 'Gentle, structured entry into Arabic reading, writing, and core vocabulary.',
        description: 'Designed specifically for non-Arabic speakers. We strip away academic intimidation and focus on practical letter recognition, basic vocabulary, and everyday Quranic terms.',
        whoIsItFor: 'Adults with zero prior background in the Arabic script.',
        whatYouWillLearn: [
          'Mastery of the 28 Arabic letters in isolated and connected positions',
          'Phonetic training for Arabic-specific sounds (ح, خ, ص, ض, ط, ظ, ع, غ, ق)',
          'Top 200 common words found in the Quran and daily Muslim life',
          'Reading simple signs, phrases, and short passages'
        ],
        durations: [30, 45, 60],
        recommendedFrequency: '2 sessions per week'
      }
    ]
  },
  {
    id: 'english',
    title: 'English Language Support',
    arabicTitle: 'اللغة الإنجليزية',
    description: 'Personalized English coaching for Arabic speakers and international learners seeking fluency, exam readiness, or workplace confidence.',
    services: [
      {
        id: 'english',
        name: '1-on-1 English Language Coaching',
        category: 'english',
        tagline: 'Build conversational fluency, clean grammar, and confident professional English.',
        description: 'Taught with IELTS C1 certified proficiency. Mahmoud understands the exact phonetic and grammatical pitfalls Arabic speakers face when learning English, providing precise, sympathetic correction.',
        whoIsItFor: 'Arabic speakers seeking fluent spoken English, immigrants to English-speaking countries, or learners preparing for study abroad.',
        whatYouWillLearn: [
          'Targeted pronunciation and accent clarity training',
          'Practical conversational fluency for social and professional settings',
          'Grammar repair tailored specifically to common Arabic-to-English translation errors',
          'Reading comprehension and natural email / text writing'
        ],
        durations: [30, 45, 60],
        recommendedFrequency: '2 sessions per week'
      }
    ]
  }
];

export const VERIFIED_PROOF_POINTS = [
  {
    metric: '3+',
    unit: 'Years',
    label: 'Dedicated 1-on-1 Teaching',
    description: 'Focused exclusively on personalized individual lessons tailored to each student’s pace.'
  },
  {
    metric: '~30',
    unit: 'Students',
    label: 'Taught Internationally',
    description: 'Learners across Canada, the United States, the United Kingdom, and Australia.'
  },
  {
    metric: 'Al-Azhar',
    unit: 'Background',
    label: 'Grounded Education',
    description: 'Educated within Egypt’s premier tradition of Islamic scholarship and Arabic language.'
  },
  {
    metric: 'IELTS C1',
    unit: 'Certified',
    label: 'Fluent English Instruction',
    description: 'Explaining complex Tajweed and Arabic concepts effortlessly in native-level English.'
  },
  {
    metric: 'Preply',
    unit: 'Certified',
    label: 'Teaching Online Credential',
    description: 'Formally verified pedagogy for effective, engaging remote learning.'
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Book a Free 30-Min Trial',
    arabicTitle: 'احجز جلسة تجريبية مجانية',
    description: 'Choose a time that suits your local timezone. No payment or credit card is required. Tell Mahmoud a little about what you hope to learn.',
    highlight: 'Zero obligation'
  },
  {
    step: '02',
    title: 'Meet & Discover Your Level',
    arabicTitle: 'التقِ بمحمود وحدد مستواك',
    description: 'In your trial, Mahmoud listens to your goals, diagnoses your current level with gentle exercises, and gives you a real mini-lesson so you feel his teaching style directly.',
    highlight: 'Personal assessment'
  },
  {
    step: '03',
    title: 'Receive Your Custom Plan',
    arabicTitle: 'استلم خطتك التعليمية المناسبة',
    description: 'Mahmoud outlines a clear learning roadmap: recommended lesson duration (30, 45, or 60 min), weekly frequency, and material tailored to your lifestyle.',
    highlight: 'No generic templates'
  },
  {
    step: '04',
    title: 'Learn 1-on-1 with Flexibility',
    arabicTitle: 'تعلم مباشرة عبر زووم بمرونة تامة',
    description: 'Attend private Zoom lessons with direct WhatsApp support between sessions. Need to reschedule? Self-service rescheduling is available up to 3 hours before class.',
    highlight: '3-hour flexible reschedule'
  }
];

export const TEACHING_PILLARS = [
  {
    title: 'Start From Where You Actually Are',
    arabicTitle: 'البداية من مستواك الفعلي',
    description: 'No student is behind. Whether you cannot read a single Arabic letter or you have partial memorization that feels rusty, we begin without judgment and build a solid foundation.'
  },
  {
    title: 'A Safe Space to Make Mistakes',
    arabicTitle: 'بيئة آمنة تخلو من الحرج',
    description: 'Reciting Quran or speaking a new language can provoke anxiety. Mahmoud’s lessons are calm, encouraging, and patient. Every correction is delivered with kindness and clarity.'
  },
  {
    title: 'Pacing Built for Real Life',
    arabicTitle: 'وتيرة تناسب التزاماتك اليومية',
    description: 'Adults have demanding jobs and families; children have school schedules. We calibrate the lesson duration (30, 45, or 60 minutes) and homework load so you make consistent, stress-free progress.'
  },
  {
    title: 'Direct Teacher Relationship',
    arabicTitle: 'علاقة مباشرة بدون وسطاء',
    description: 'You are not a ticket number in a marketplace. You message Mahmoud directly on WhatsApp when you have a question between lessons or need to adjust your schedule.'
  }
];

export const AUTHENTIC_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't1',
    quote: "Mahmoud’s patience with my 9-year-old son is exceptional. My son used to dread reading Arabic letters, but now he actually looks forward to his lessons. Mahmoud makes pronunciation games out of difficult Tajweed rules.",
    author: 'S. Tariq',
    role: 'Parent of 9-year-old student',
    location: 'Toronto, Canada',
    subject: 'Quran Reading & Tajweed',
    durationWithMahmoud: '10 months of learning'
  },
  {
    id: 't2',
    quote: "As an adult working in finance in London, I was embarrassed that I couldn't read the Quran smoothly. Mahmoud never made me feel awkward. His English explanations of Arabic grammatical roots and articulation points are razor-sharp.",
    author: 'K. Rahman',
    role: 'Adult professional learner',
    location: 'London, United Kingdom',
    subject: 'Quran Recitation & Modern Standard Arabic',
    durationWithMahmoud: '14 months of learning'
  },
  {
    id: 't3',
    quote: "The 30-minute lesson option is perfect for our routine. Having a teacher who lives in Egypt but speaks English so fluently makes all the difference when explaining Aqeedah and Fiqh questions to young teens.",
    author: 'A. Mansour',
    role: 'Parent of two teenage students',
    location: 'Texas, United States',
    subject: 'Islamic Studies & Tajweed',
    durationWithMahmoud: '8 months of learning'
  },
  {
    id: 't4',
    quote: "Learning Egyptian Arabic conversation with Mahmoud feels like talking with a knowledgeable friend. He explains everyday slang, cultural expressions, and grammar shortcuts that you will never find in formal textbooks.",
    author: 'D. Miller',
    role: 'Language enthusiast & traveler',
    location: 'Melbourne, Australia',
    subject: 'Egyptian Spoken Arabic',
    durationWithMahmoud: '6 months of learning'
  }
];

export const FAQS: FAQItem[] = [
  {
    question: 'Is every lesson truly 1-on-1 with Mahmoud?',
    answer: 'Yes, 100%. This is Mahmoud’s direct personal teaching practice, not a marketplace or agency. You will never be handed off to another teacher or placed in a group class without your consent.',
    category: 'general'
  },
  {
    question: 'How does the Free Trial work?',
    answer: 'The trial is a 30-minute private Zoom lesson (with up to 45 minutes if needed). We get to know your goals, evaluate your current level through simple diagnostic exercises, and conduct a brief mini-lesson. Afterward, Mahmoud shares his recommended learning plan. There is zero pressure and no credit card required.',
    category: 'trial'
  },
  {
    question: 'What is the cancellation and rescheduling policy?',
    answer: 'You may cancel or reschedule any lesson free of charge up to 3 hours before the scheduled start time. Inside the 3-hour window, self-service changes are closed and you should message Mahmoud directly on WhatsApp to coordinate.',
    category: 'booking'
  },
  {
    question: 'I cannot read any Arabic at all. Can I still start?',
    answer: 'Absolutely. Many of Mahmoud’s students started with zero knowledge of the Arabic script. We begin from the very first letter (Alif), teaching the exact shape, sound, and vowel combinations patiently step by step.',
    category: 'teaching'
  },
  {
    question: 'What lesson lengths are available?',
    answer: 'Standard paid lessons are 30 minutes, 45 minutes, or 60 minutes. Shorter 30-minute sessions are especially popular for young children or busy working professionals, while 60-minute sessions work well for in-depth Arabic grammar or Quran revision.',
    category: 'booking'
  },
  {
    question: 'How do timezones work since Mahmoud is based in Egypt?',
    answer: 'All booking times are calculated and shown automatically in your local timezone (e.g., EST, PST, GMT, AEST). Mahmoud handles time in Egypt time so you never have to do mental timezone math.',
    category: 'general'
  },
  {
    question: 'Do I need to create an account to book?',
    answer: 'No. The platform supports guest booking. All you need is your name, email, and preferred contact method (such as WhatsApp) so Mahmoud can send your Zoom link and confirmation.',
    category: 'booking'
  }
];

export const ARABIC_TRANSLATIONS = {
  nav: {
    home: 'الرئيسية',
    services: 'الخدمات والدروس',
    about: 'عن محمود',
    approach: 'منهجية التدريس',
    howItWorks: 'كيف نعمل',
    testimonials: 'آراء الطلاب',
    faqs: 'الأسئلة الشائعة',
    contact: 'تواصل معي',
    bookTrial: 'احجز جلسة تجريبية مجانية'
  },
  hero: {
    eyebrow: 'تعليم فردي مباشر • جلسات خاصة ١ لـ ١',
    title: 'تعلم القرآن الكريم واللغة العربية والعلوم الإسلامية',
    subtitle: 'مع الأستاذ محمود مباشرة. تعليم مخصص يناسب مستواك، أهدافك، وسرعة تعلمك، مع مرونة كاملة للمسلمين والدارسين حول العالم.',
    ctaPrimary: 'احجز جلسة تجريبية مجانية (٣٠ دقيقة)',
    ctaSecondary: 'استكشف الخدمات والبرامج',
    trustNote: 'بدون بطاقة بنكية • جلسة فردية خاصة • عبر زووم',
    proof1: '٣+ سنوات خبرة تدريسية',
    proof2: '~٣٠ طالباً في كندا وأمريكا وبريطانيا وأستراليا',
    proof3: 'خريج الأزهر الشريف ومتقن للإنجليزية C1'
  },
  services: {
    sectionTag: 'المسارات والخدمات التعليمية',
    title: '١٣ خدمة تعليمية متخصصة ومصممة لكل طالب',
    subtitle: 'لا توجد قوالب جاهزة. كل درس يُبنى حول احتياجك الفعلي وهدفك التعليمي.',
    exploreBtn: 'تفاصيل المسار والدروس',
    tryInTrial: 'اختر هذا المسار في جلستك التجريبية',
    durationsLabel: 'مدد الدروس المتاحة:',
    whoLabel: 'لمن هذه الخدمة:',
    learnLabel: 'ماذا ستتعلم:'
  },
  about: {
    sectionTag: 'الأستاذ محمود',
    title: 'معلم مكرس للتعليم الفردي والصبور',
    storyP1: 'السلام عليكم ورحمة الله وبركاته، أنا محمود. أعمل كمعلم مستقل للقرآن الكريم، وأحكام التجويد، واللغة العربية، والدراسات الإسلامية للطلاب الدوليين والعائلات المسلمة المقيمة في الدول الغربية.',
    storyP2: 'دراستي في الأزهر الشريف منحتني تأصيلاً علمياً عميقاً في علوم الشريعة واللسان العربي، بينما مكنني إتقاني للغة الإنجليزية بمستوى (IELTS C1) من شرح أدق المسائل اللغوية ومخارج الحروف بأسلوب سهل وطبيعي للمسلمين الناطقين بالإنجليزية.',
    storyP3: 'التعليم بالنسبة لي ليس عملاً تجارياً عابراً أو منصة وسيطة، بل هو مسؤولية إنسانية وعلاقة مباشرة تجمعني بطلابي في مسيرتهم التعليمية المباركة.',
    whatIAm: 'ما أقدمه لك:',
    whatIAmPoints: [
      'تعليم فردي مباشر ١ لـ ١ مبني على حاجتك',
      'صبر كامل وبيئة مريحة تشجع على التعلم دون خجل',
      'تواصل مباشر وسريع عبر واتساب بين الدروس',
      'مرونة في إعادة الجدولة حتى ٣ ساعات قبل الدرس'
    ],
    whatIAmNot: 'ما لا أقوم به:',
    whatIAmNotPoints: [
      'لست منصة تجارية توزع الطلاب على معلمين عشوائيين',
      'لا أتبع مناهج جامدة دون مراعاة لظروف الطالب',
      'لا أفرض التزامات أو شروط دفع معقدة'
    ]
  },
  trial: {
    title: 'ابدأ بجلسة تجريبية مجانية مدتها ٣٠ دقيقة',
    subtitle: 'فرصة مثالية لنتعرف على بعضنا، نقيم مستواك الحالي، وتجرب أسلوبي في التدريس قبل أي التزام.',
    benefit1: 'تقييم فردي دقيق لمستواك بدون أي إحراج',
    benefit2: 'درس مصغر لتجربة التفاعل والشرح المباشر',
    benefit3: 'خطة تعليمية مخصصة مقترحة للمتابعة',
    policy: 'جلسة تجريبية واحدة مجانية لكل طالب جديد • مدة الجلسة ٣٠ دقيقة (بحد أقصى ٤٥ دقيقة)'
  }
};
