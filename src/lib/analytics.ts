/**
 * Kraftverk Analytics Service
 * Sends tracking data to customer portal for tenant: kraftverk
 */

const CUSTOMER_PORTAL_URL = 'https://source-database.onrender.com';
const TENANT = 'kraftverk';

interface AnalyticsEvent {
  event: string;
  data: Record<string, any>;
  domain: string;
  tenant: string;
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

  private async sendEvent(event: string, data: TrackEventData = {}) {
    if (typeof window === 'undefined') return;

    const payload: AnalyticsEvent = {
      event,
      data: {
        ...data,
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        // Add unique analytics ID for server-side deduplication
        analyticsId: event === 'customer_payment' && data.sessionId 
          ? `${data.sessionId}_${Date.now()}` 
          : undefined,
      },
      domain: this.domain,
      tenant: TENANT,
    };

    try {
      console.log('📤 Sending analytics to:', `${CUSTOMER_PORTAL_URL}/api/analytics/track`);
      console.log('📊 Payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(`${CUSTOMER_PORTAL_URL}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Analytics tracked successfully:', event, result);
      } else {
        const errorText = await response.text();
        console.error('❌ Analytics failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }

  // Track page views with geo data
  async trackPageView(path?: string) {
    const pageData = {
      path: path || window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    };

    // Send regular page view to existing analytics
    this.sendEvent('pageview', pageData);

    // Send geo-enabled page view to new endpoint
    try {
      const geoResponse = await fetch('/api/geo-pageview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: window.location.href,
          path: pageData.path,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
        }),
      });

      if (geoResponse.ok) {
        const result = await geoResponse.json();
        console.log('🌍 Geo page view tracked:', result);
      } else {
        console.error('❌ Geo page view failed:', await geoResponse.text());
      }
    } catch (error) {
      console.error('❌ Geo page view error:', error);
    }
  }

  // Track CTA clicks
  trackCTAClick(ctaType: string, ctaText: string, location?: string) {
    this.sendEvent('cta_click', {
      ctaType,
      ctaText,
      location,
    });
  }

  // Track membership actions
  trackMembershipAction(action: string, planType?: string) {
    this.sendEvent('membership_action', {
      action,
      planType,
    });
  }

  // Track class booking
  trackClassBooking(className: string, instructor: string, time: string) {
    this.sendEvent('class_booking', {
      className,
      instructor,
      time,
    });
  }

  // Track form submissions
  trackFormSubmission(formType: string, formData?: Record<string, any>) {
    this.sendEvent('form_submit', {
      formType,
      formData,
    });
  }

  // Track user authentication
  trackAuth(action: 'login' | 'logout' | 'signup') {
    this.sendEvent('auth', {
      action,
    });
  }

  // Track Stripe checkout
  trackCheckout(action: 'initiated' | 'completed' | 'failed', amount?: number, currency?: string) {
    this.sendEvent('checkout', {
      action,
      amount,
      currency,
    });
  }

  // Track scroll depth
  trackScrollDepth(percent: number) {
    this.sendEvent('scroll_depth', {
      percent,
    });
  }

  // Track time on page
  trackTimeOnPage(seconds: number) {
    this.sendEvent('time_on_page', {
      seconds,
    });
  }

  // Send custom event to customer portal
  sendCustomEvent(eventName: string, data: Record<string, any>) {
    // Add deduplication for customer_payment events
    if (eventName === 'customer_payment' && data.sessionId) {
      const analyticsKey = `analytics_sent_${data.sessionId}`;
      const alreadySent = localStorage.getItem(analyticsKey);
      
      if (alreadySent) {
        console.log('⚠️ Analytics already sent for session:', data.sessionId, '- skipping duplicate');
        return;
      }
    }
    
    this.sendEvent(eventName, data);
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();
