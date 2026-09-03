export type Language = 'en' | 'ar';
export type ThemeMode = 'light' | 'dark';

export interface ServiceItem {
  id: string;
  name: string;
  category: 'quran' | 'islamic_studies' | 'arabic' | 'english';
  tagline: string;
  description: string;
  whoIsItFor: string;
  whatYouWillLearn: string[];
  durations: (30 | 45 | 60)[];
  recommendedFrequency: string;
}

export interface ServicePillar {
  id: 'quran' | 'islamic_studies' | 'arabic' | 'english';
  title: string;
  arabicTitle: string;
  description: string;
  services: ServiceItem[];
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string; // e.g., "Parent of 8-year-old student" or "Adult learner"
  location: string; // Canada, UK, US, Australia
  subject: string;
  durationWithMahmoud: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'trial' | 'booking' | 'teaching';
}
