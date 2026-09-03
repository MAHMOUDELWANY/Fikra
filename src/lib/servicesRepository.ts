import { supabase, isSupabaseConfigured } from './supabase';
import { Database } from '../types/database';
import { BOOKING_SERVICES } from '../booking/mockData';
import { ServiceOption } from '../booking/types';

export type DatabaseService = Database['public']['Tables']['services']['Row'];

/**
 * Maps database service row to frontend ServiceOption
 */
function mapDatabaseToServiceOption(dbService: DatabaseService): ServiceOption {
  return {
    id: dbService.id,
    name: dbService.title,
    arabicName: dbService.arabic_title,
    group: dbService.category,
    tagline: dbService.short_description,
    arabicTagline: dbService.arabic_description,
    description: dbService.short_description,
    arabicDescription: dbService.arabic_description,
    suggestedGoals: [
      'Build solid foundation from fundamentals',
      'Improve accuracy and self-correction',
      'Achieve consistent weekly retention',
    ],
    arabicSuggestedGoals: [
      'بناء أساس متين من الصفر',
      'تحسين دقة النطق والتصحيح الذاتي',
      'تثبيت الحفظ والمراجعة الأسبوعية',
    ],
    defaultDurations: (dbService.supported_durations as (30 | 45 | 60)[]) || [30, 45, 60],
    hourlyRateUsd: Number(dbService.hourly_rate_usd) || 7,
  };
}

export const servicesRepository = {
  /**
   * Fetches all active services from Supabase, or falls back to master spec definitions
   */
  async getActiveServices(): Promise<ServiceOption[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(mapDatabaseToServiceOption);
        }
      } catch (err) {
        console.warn('Could not load services from Supabase, falling back to local master config:', err);
      }
    }
    return BOOKING_SERVICES;
  },

  /**
   * Retrieves a single service by ID
   */
  async getServiceById(id: string): Promise<ServiceOption | null> {
    const all = await this.getActiveServices();
    return all.find((s) => s.id === id) || null;
  },
};
