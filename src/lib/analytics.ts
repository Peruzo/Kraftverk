/**
 * Kraftverk Analytics Service
 * Sends tracking data to customer portal for tenant: kraftverk
 * Updated to use simplified authentication (no API keys needed!)
 */

const PAGEVIEW_ENDPOINT = 'https://source-database.onrender.com/api/analytics/pageviews';
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
    if (typeof window === 'undefined') return;

    const event: AnalyticsEvent = {
      type: eventType,
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      properties: properties,
    };

    const payload = {
      tenant: TENANT_ID,
      events: [event]
    };

    try {
      console.log('📤 Sending analytics to:', PAGEVIEW_ENDPOINT);
      console.log('📊 Payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(PAGEVIEW_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant': TENANT_ID,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Analytics tracked successfully:', eventType, result);
      } else {
        const errorText = await response.text();
        console.error('❌ Analytics failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }

  // Track page views with optional geo data
  async trackPageView(path?: string) {
    // Send regular page view first
    this.sendEvent('page_view', { path: path || window.location.pathname });

    // Try to get geo data and send to geo endpoint
    try {
      const geoResponse = await fetch('https://ipapi.co/json/');
      const geoData = await geoResponse.json();
      
      // Send geo-tracked page view to the correct endpoint
      const geoPayload = {
        url: window.location.href,
        path: path || window.location.pathname,
        timestamp: new Date().toISOString(),
        tenant: TENANT_ID,
        geo: {
          country: geoData.country_name,
          countryCode: geoData.country_code,
          region: geoData.region,
          city: geoData.city,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          timezone: geoData.timezone,
        },
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
      };

      const response = await fetch(GEO_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant': TENANT_ID,
        },
        body: JSON.stringify(geoPayload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🌍 Geo page view tracked:', result);
      } else {
        console.error('❌ Geo page view failed:', await response.text());
      }
    } catch (error) {
      console.error('❌ Geo tracking failed:', error);
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
