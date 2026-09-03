import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Analytics Events Tracking Layer (Master Spec Section 36)
 * Supports clean behavioral tracking without collecting unnecessary personal data.
 */

// Generate anonymous session token for correlating booking funnel steps
const getSessionId = (): string => {
  try {
    let sid = sessionStorage.getItem('mhm_session_id');
    if (!sid) {
      sid = `ses_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('mhm_session_id', sid);
    }
    return sid;
  } catch {
    return 'ses_anon';
  }
};

export const analyticsRepository = {
  /**
   * Logs an approved analytics event to Supabase analytics_events table
   */
  async logEvent(
    eventName: string,
    metadata: {
      pagePath?: string;
      source?: string;
      serviceId?: string;
      bookingType?: string;
      [key: string]: any;
    } = {}
  ): Promise<void> {
    const payload = {
      event_name: eventName,
      page_path: metadata.pagePath || window.location.pathname,
      source: metadata.source || 'web',
      service_id: metadata.serviceId || null,
      booking_type: metadata.bookingType || null,
      session_id: getSessionId(),
      metadata: metadata,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('analytics_events').insert(payload as any);
      } catch (err) {
        // Silent failure for analytics to never block user actions
        console.debug('Analytics event could not be saved to Supabase:', err);
      }
    } else {
      console.debug('[Analytics Event]:', eventName, payload);
    }
  },
};
