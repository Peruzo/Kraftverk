/**
 * Kraftverk Analytics Service
 * Sends tracking data to customer portal for tenant: kraftverk
 * Updated to use simplified authentication (no API keys needed!)
 */

const ANALYTICS_ENDPOINT = 'https://source-database.onrender.com/api/ingest/analytics';
const GEO_ENDPOINT = 'https://source-database.onrender.com/api/statistics/track-pageview';
const TENANT_ID = 'kraftverk';

interface AnalyticsEvent {
  type: string;
  url: string;
  path?: string;
  title?: string;
  timestamp: string;
  referrer?: string;
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
  properties?: Record<string, any>;
  // Geo data (optional)
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  postalCode?: string;
}

interface TrackEventData {
  url?: string;
  title?: string;
  timestamp?: string;
  userAgent?: string;
  referrer?: string;
  viewport?: {
    width: number;
    height: number;
  };
  [key: string]: any;
}

class AnalyticsService {
  private domain: string;

  constructor() {
    this.domain = typeof window !== 'undefined' ? window.location.hostname : 'kraftverk.com';
  }

  private async sendEvent(eventType: string, properties: Record<string, any> = {}) {
    if (typeof window === 'undefined') {
      console.log('🔍 [DEBUG] sendEvent called on server side - skipping');
      return;
    }

    console.log('🔍 [DEBUG] Starting analytics event tracking...');
    console.log('🔍 [DEBUG] Event type:', eventType);
    console.log('🔍 [DEBUG] Properties:', properties);
    console.log('🔍 [DEBUG] Current URL:', window.location.href);
    console.log('🔍 [DEBUG] Current path:', window.location.pathname);
    console.log('🔍 [DEBUG] Using server-side API route to avoid CORS issues');

    try {
      // Use our server-side API route to avoid CORS issues
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: eventType,
          properties: {
            ...properties,
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
          },
        }),
      });

      console.log('🔍 [DEBUG] Response status:', response.status);

      const responseText = await response.text();
      console.log('🔍 [DEBUG] Response body:', responseText);

      if (response.ok) {
        console.log('✅ [SUCCESS] Analytics tracked successfully:', eventType);
        try {
          const result = JSON.parse(responseText);
          console.log('✅ [SUCCESS] Parsed response:', result);
        } catch (parseError) {
          console.log('✅ [SUCCESS] Response (non-JSON):', responseText);
        }
      } else {
        console.error('❌ [ERROR] Analytics failed:', response.status, responseText);
      }
    } catch (error) {
      console.error('❌ [ERROR] Network error during analytics tracking:', error);
      console.error('❌ [ERROR] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
      });
    }
  }

  // Track page views with optional geo data
  async trackPageView(path?: string) {
    console.log('🔍 [DEBUG] Starting page view tracking...');
    console.log('🔍 [DEBUG] Path parameter:', path);
    console.log('🔍 [DEBUG] Window location pathname:', window.location.pathname);
    console.log('🔍 [DEBUG] Final path to track:', path || window.location.pathname);

    // Send regular page view first
    console.log('🔍 [DEBUG] Sending regular page view...');
    this.sendEvent('page_view', { path: path || window.location.pathname });

    // Try to get geo data and send to geo endpoint
    console.log('🌍 [DEBUG] Starting geo page view tracking...');
    try {
      console.log('🌍 [DEBUG] Fetching geo data from ipapi.co...');
      const geoResponse = await fetch('https://ipapi.co/json/');
      console.log('🌍 [DEBUG] Geo API response status:', geoResponse.status);
      
      const geoData = await geoResponse.json();
      console.log('🌍 [DEBUG] Geo data received:', geoData);
      
      // Send geo data as a regular analytics event to the working endpoint
      console.log('🌍 [DEBUG] Sending geo data as analytics event...');
      this.sendEvent('page_view_geo', {
        path: path || window.location.pathname,
        country: geoData.country_name,
        countryCode: geoData.country_code,
        region: geoData.region,
        city: geoData.city,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        timezone: geoData.timezone,
      });

      console.log('✅ [SUCCESS] Geo data sent as analytics event');
    } catch (error) {
      console.error('❌ [ERROR] Network error during geo tracking:', error);
      console.error('❌ [ERROR] Geo error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
      });
    }
  }

  // Track CTA clicks
  trackCTAClick(ctaType: string, ctaText: string, location?: string) {
    this.sendEvent('button_click', {
      button: ctaText,
      button_type: ctaType,
      location: location,
    });
  }

  // Track membership actions
  trackMembershipAction(action: string, planType?: string) {
    this.sendEvent('membership_action', {
      action: action,
      plan_type: planType,
    });
  }

  // Track class booking
  trackClassBooking(className: string, instructor: string, time: string) {
    this.sendEvent('class_booking', {
      class_name: className,
      instructor: instructor,
      time: time,
    });
  }

  // Track form submissions
  trackFormSubmission(formType: string, formData?: Record<string, any>) {
    this.sendEvent('form_submit', {
      form_type: formType,
      form_data: formData,
    });
  }

  // Track user authentication
  trackAuth(action: 'login' | 'logout' | 'signup') {
    this.sendEvent('auth', {
      action: action,
    });
  }

  // Track Stripe checkout
  trackCheckout(action: 'initiated' | 'completed' | 'failed', amount?: number, currency?: string) {
    this.sendEvent('checkout', {
      action: action,
      amount: amount,
      currency: currency,
    });
  }

  // Track scroll depth
  trackScrollDepth(percent: number) {
    this.sendEvent('scroll_depth', {
      percent: percent,
    });
  }

  // Track time on page
  trackTimeOnPage(seconds: number) {
    this.sendEvent('time_on_page', {
      seconds: seconds,
    });
  }

  // Send custom event to customer portal
  sendCustomEvent(eventName: string, properties: Record<string, any>) {
    // Add deduplication for customer_payment events
    if (eventName === 'customer_payment' && properties.sessionId) {
      const analyticsKey = `analytics_sent_${properties.sessionId}`;
      const alreadySent = localStorage.getItem(analyticsKey);
      
      if (alreadySent) {
        console.log('⚠️ Analytics already sent for session:', properties.sessionId, '- skipping duplicate');
        return;
      }
    }
    
    this.sendEvent(eventName, properties);
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();
