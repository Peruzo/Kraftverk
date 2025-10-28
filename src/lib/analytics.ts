/**
 * Kraftverk Analytics Service
 * Sends tracking data to customer portal for tenant: kraftverk
 * Updated to use simplified authentication (no API keys needed!)
 */

const ANALYTICS_ENDPOINT = 'https://source-database.onrender.com/api/ingest/analytics';
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
      console.log('📤 Sending analytics to:', ANALYTICS_ENDPOINT);
      console.log('📊 Payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(ANALYTICS_ENDPOINT, {
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
    // Try to get geo data first
    try {
      const geoResponse = await fetch('https://ipapi.co/json/');
      const geoData = await geoResponse.json();
      
      // Send page view with geo data
      const event: AnalyticsEvent = {
        type: 'page_view',
        url: window.location.href,
        path: path || window.location.pathname,
        title: document.title,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        // Geo data
        country: geoData.country_name,
        region: geoData.region,
        city: geoData.city,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        timezone: geoData.timezone,
        postalCode: geoData.postal,
      };

      const payload = {
        tenant: TENANT_ID,
        events: [event]
      };

      const response = await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant': TENANT_ID,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🌍 Page view with geo tracked:', result);
      } else {
        console.error('❌ Geo page view failed:', await response.text());
        // Fallback to regular page view
        this.sendEvent('page_view', { path: path || window.location.pathname });
      }
    } catch (error) {
      console.error('❌ Geo tracking failed, falling back to regular tracking:', error);
      // Fallback to regular page view without geo
      this.sendEvent('page_view', { path: path || window.location.pathname });
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
