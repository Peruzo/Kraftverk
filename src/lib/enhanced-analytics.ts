/**
 * Enhanced Analytics Service for Kraftverk Enterprise
 * Updated to use simplified authentication (no API keys needed!)
 * Comprehensive data collection for customer portal integration
 */

const PAGEVIEW_ENDPOINT = 'https://source-database.onrender.com/api/analytics/pageviews';
const GEO_ENDPOINT = 'https://source-database.onrender.com/api/statistics/track-pageview';
const TENANT_ID = 'kraftverk';

interface AnalyticsEvent {
  event_id: string;
  tenant_id: string;
  session_id: string;
  user_id?: string;
  timestamp: string;
  page: string;
  referrer: string;
  source: string;
  device: string;
  event_type: string;
  event_props: Record<string, any>;
  user_agent: string;
  load_time: number;
  custom_dimensions: Record<string, any>;
  domain: string;
}

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  inp?: number; // Interaction to Next Paint
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  load_time?: number;
  dom_content_loaded?: number;
}

interface EcommerceEvent {
  transaction_id: string;
  value: number;
  currency: string;
  items: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}

class EnhancedAnalyticsService {
  private domain: string;
  private sessionId: string;
  private userId?: string;
  private startTime: number;
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.domain = typeof window !== 'undefined' ? window.location.hostname : '';
    this.sessionId = this.getSessionId();
    this.userId = this.getHashedUserId();
    this.startTime = performance.now();
    
    this.initPerformanceTracking();
  }

  // Old API key methods removed - now using simplified authentication

  private getCSRFToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get CSRF token from meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }
    
    // Try to get CSRF token from cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrf-token' || name === '_token') {
        return value;
      }
    }
    
    return null;
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('kraftverk_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('kraftverk_session_id', sessionId);
    }
    return sessionId;
  }

  private getHashedUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    
    // Check if user is logged in (you can modify this based on your auth system)
    const userElement = document.querySelector('[data-user-id]');
    if (userElement) {
      const userId = userElement.getAttribute('data-user-id');
      if (userId) {
        return btoa(userId + TENANT_ID).substr(0, 16);
      }
    }
    return undefined;
  }

  private getTrafficSource(): string {
    if (typeof window === 'undefined') return 'direct';
    
    const referrer = document.referrer;
    if (!referrer) return 'direct';
    
    try {
      const hostname = new URL(referrer).hostname;
      if (hostname.includes('google')) return 'organic';
      if (hostname.includes('facebook') || hostname.includes('instagram')) return 'social';
      if (hostname.includes('linkedin')) return 'social';
      if (hostname.includes('twitter')) return 'social';
      return 'referral';
    } catch {
      return 'referral';
    }
  }

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private initPerformanceTracking(): void {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    this.trackCoreWebVitals();
    
    // Track page load performance
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.startTime;
      this.trackPerformance('page_load', { load_time: loadTime });
    });
  }

  private trackCoreWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.trackPerformance('lcp', { lcp: lastEntry.startTime });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.trackPerformance('cls', { cls: clsValue });
    }).observe({ entryTypes: ['layout-shift'] });

    // First Contentful Paint (FCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcpEntry = entries[0];
      this.trackPerformance('fcp', { fcp: fcpEntry.startTime });
    }).observe({ entryTypes: ['paint'] });
  }

  private async sendEvent(eventType: string, eventProps: Record<string, any> = {}): Promise<void> {
    if (typeof window === 'undefined') {
      console.log('🔍 [DEBUG] sendEvent called on server side - skipping');
      return;
    }

    console.log('🔍 [DEBUG] Starting enhanced analytics event tracking...');
    console.log('🔍 [DEBUG] Event type:', eventType);
    console.log('🔍 [DEBUG] Event props:', eventProps);
    console.log('🔍 [DEBUG] Current URL:', window.location.href);
    console.log('🔍 [DEBUG] Current path:', window.location.pathname);

    const event = {
      type: eventType,
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      properties: {
        ...eventProps,
        sessionId: this.sessionId,
        userId: this.userId,
        source: this.getTrafficSource(),
        device: this.getDeviceType(),
        loadTime: performance.now() - this.startTime,
      },
    };

    const payload = {
      tenant: TENANT_ID,
      events: [event]
    };

    console.log('🔍 [DEBUG] Enhanced analytics payload to send:', JSON.stringify(payload, null, 2));
    console.log('🔍 [DEBUG] Sending to endpoint:', PAGEVIEW_ENDPOINT);

    try {
      // Get CSRF token from meta tag or cookie
      const csrfToken = this.getCSRFToken();
      console.log('🔍 [DEBUG] CSRF token found:', csrfToken ? 'Yes' : 'No');
      if (csrfToken) {
        console.log('🔍 [DEBUG] CSRF token value:', csrfToken.substring(0, 10) + '...');
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Tenant': TENANT_ID,
      };
      
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
        console.log('🔍 [DEBUG] Adding X-CSRF-Token header');
      } else {
        console.log('🔍 [DEBUG] No CSRF token available, trying without it');
      }

      const response = await fetch(PAGEVIEW_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      console.log('🔍 [DEBUG] Enhanced analytics response status:', response.status);
      console.log('🔍 [DEBUG] Enhanced analytics response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('🔍 [DEBUG] Enhanced analytics response body:', responseText);

      if (response.ok) {
        console.log('✅ [SUCCESS] Enhanced analytics tracked successfully:', eventType);
        try {
          const result = JSON.parse(responseText);
          console.log('✅ [SUCCESS] Enhanced analytics parsed response:', result);
        } catch (parseError) {
          console.log('✅ [SUCCESS] Enhanced analytics response (non-JSON):', responseText);
        }
      } else {
        console.error('❌ [ERROR] Enhanced analytics failed:', response.status, responseText);
      }
    } catch (error) {
      console.error('❌ [ERROR] Network error during enhanced analytics tracking:', error);
      console.error('❌ [ERROR] Enhanced analytics error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
      });
    }
  }

  // Old methods removed - now using simplified sendEvent method above

  // ===== PAGE ANALYTICS =====

  trackPageView(path?: string, pageTitle?: string): void {
    console.log('🔍 [DEBUG] Enhanced analytics trackPageView called');
    console.log('🔍 [DEBUG] Path parameter:', path);
    console.log('🔍 [DEBUG] Page title parameter:', pageTitle);
    console.log('🔍 [DEBUG] Window location pathname:', window.location.pathname);

    // Send regular page view
    this.sendEvent('page_view', {
      page_title: pageTitle || document.title,
      page_category: this.getPageCategory(),
      path: path || window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    });

    // Also send geo-tracked page view
    this.sendGeoPageView(path || window.location.pathname);
  }

  private async sendGeoPageView(path: string): Promise<void> {
    console.log('🌍 [DEBUG] Enhanced analytics sending geo page view...');
    
    try {
      console.log('🌍 [DEBUG] Fetching geo data from ipapi.co...');
      const geoResponse = await fetch('https://ipapi.co/json/');
      console.log('🌍 [DEBUG] Geo API response status:', geoResponse.status);
      
      const geoData = await geoResponse.json();
      console.log('🌍 [DEBUG] Geo data received:', geoData);
      
      const geoPayload = {
        url: window.location.href,
        path: path,
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

      console.log('🌍 [DEBUG] Enhanced analytics geo payload to send:', JSON.stringify(geoPayload, null, 2));
      console.log('🌍 [DEBUG] Sending to geo endpoint:', GEO_ENDPOINT);

      // Get CSRF token for geo endpoint too
      const csrfToken = this.getCSRFToken();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Tenant': TENANT_ID,
      };
      
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch(GEO_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(geoPayload),
      });

      console.log('🌍 [DEBUG] Enhanced analytics geo response status:', response.status);
      console.log('🌍 [DEBUG] Enhanced analytics geo response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('🌍 [DEBUG] Enhanced analytics geo response body:', responseText);

      if (response.ok) {
        console.log('✅ [SUCCESS] Enhanced analytics geo page view tracked successfully');
        try {
          const result = JSON.parse(responseText);
          console.log('✅ [SUCCESS] Enhanced analytics geo parsed response:', result);
        } catch (parseError) {
          console.log('✅ [SUCCESS] Enhanced analytics geo response (non-JSON):', responseText);
        }
      } else {
        console.error('❌ [ERROR] Enhanced analytics geo page view tracking failed:', response.status, responseText);
      }
    } catch (error) {
      console.error('❌ [ERROR] Network error during enhanced analytics geo tracking:', error);
      console.error('❌ [ERROR] Enhanced analytics geo error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
      });
    }
  }

  private getPageCategory(): string {
    const path = window.location.pathname;
    if (path === '/') return 'home';
    if (path.includes('/medlemskap')) return 'membership';
    if (path.includes('/schema')) return 'schedule';
    if (path.includes('/pt')) return 'personal_training';
    if (path.includes('/om-oss')) return 'about';
    if (path.includes('/min-sida')) return 'dashboard';
    return 'other';
  }

  // ===== PERFORMANCE ANALYTICS =====

  trackPerformance(metric: string, data: PerformanceMetrics): void {
    this.sendEvent('performance', {
      metric,
      ...data,
    });
  }

  trackError(error: Error, context?: string): void {
    this.sendEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      context: context || 'unknown',
    });
  }

  // ===== FORM ANALYTICS =====

  trackFormStart(formId: string, formName?: string): void {
    this.sendEvent('form_start', {
      form_id: formId,
      form_name: formName,
      form_url: window.location.href,
    });
  }

  trackFormFieldFocus(formId: string, fieldName: string): void {
    this.sendEvent('form_field_focus', {
      form_id: formId,
      field_name: fieldName,
    });
  }

  trackFormFieldBlur(formId: string, fieldName: string, hasValue: boolean): void {
    this.sendEvent('form_field_blur', {
      form_id: formId,
      field_name: fieldName,
      has_value: hasValue,
    });
  }

  trackFormSubmit(formId: string, formData?: Record<string, any>, completionTime?: number): void {
    this.sendEvent('form_submit', {
      form_id: formId,
      form_data: formData,
      completion_time: completionTime,
      form_url: window.location.href,
    });
  }

  trackFormAbandon(formId: string, fieldsCompleted: number, totalFields: number): void {
    this.sendEvent('form_abandon', {
      form_id: formId,
      fields_completed: fieldsCompleted,
      total_fields: totalFields,
      completion_percentage: Math.round((fieldsCompleted / totalFields) * 100),
    });
  }

  // ===== E-COMMERCE ANALYTICS =====

  trackProductView(productId: string, productName: string, category: string, price?: number): void {
    this.sendEvent('product_view', {
      product_id: productId,
      product_name: productName,
      category,
      price,
      currency: 'SEK',
    });
  }

  trackAddToCart(productId: string, productName: string, quantity: number, price: number): void {
    this.sendEvent('add_to_cart', {
      product_id: productId,
      product_name: productName,
      quantity,
      price,
      currency: 'SEK',
    });
  }

  trackCheckoutInitiated(value: number, currency: string = 'SEK', items?: any[]): void {
    this.sendEvent('checkout_initiated', {
      value,
      currency,
      items: items || [],
    });
  }

  trackPurchase(transactionId: string, value: number, currency: string = 'SEK', items: any[]): void {
    this.sendEvent('purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });
  }

  // ===== USER INTERACTION ANALYTICS =====

  trackCTAClick(ctaText: string, ctaType: string, location?: string): void {
    this.sendEvent('cta_click', {
      cta_text: ctaText.trim(),
      cta_type: ctaType,
      location: location || this.getElementPosition(),
    });
  }

  trackButtonClick(buttonText: string, buttonType: string, context?: string): void {
    this.sendEvent('button_click', {
      button_text: buttonText.trim(),
      button_type: buttonType,
      context,
    });
  }

  trackLinkClick(linkText: string, linkUrl: string, linkType: 'internal' | 'external'): void {
    this.sendEvent('link_click', {
      link_text: linkText.trim(),
      link_url: linkUrl,
      link_type: linkType,
    });
  }

  trackScrollDepth(percent: number): void {
    this.sendEvent('scroll_depth', {
      percent,
      page_height: document.body.scrollHeight,
      viewport_height: window.innerHeight,
    });
  }

  trackTimeOnPage(seconds: number): void {
    this.sendEvent('time_on_page', {
      seconds,
      minutes: Math.round(seconds / 60 * 100) / 100,
    });
  }

  // ===== MEMBERSHIP & BOOKING ANALYTICS =====

  trackMembershipView(membershipId: string, membershipName: string, price: number): void {
    this.trackProductView(membershipId, membershipName, 'membership', price);
  }

  trackMembershipSelect(membershipId: string, membershipName: string, price: number): void {
    this.trackAddToCart(membershipId, membershipName, 1, price);
  }

  trackClassBooking(className: string, instructor: string, time: string, classId: string): void {
    this.sendEvent('class_booking', {
      class_name: className,
      instructor,
      time,
      class_id: classId,
      booking_url: window.location.href,
    });
  }

  trackBookingCancel(bookingId: string, className: string, reason?: string): void {
    this.sendEvent('booking_cancel', {
      booking_id: bookingId,
      class_name: className,
      reason,
    });
  }

  // ===== CAMPAIGN ANALYTICS =====

  trackCampaignView(campaignId: string, campaignName: string): void {
    this.sendEvent('campaign_view', {
      campaign_id: campaignId,
      campaign_name: campaignName,
    });
  }

  trackCampaignClick(campaignId: string, campaignName: string, element: string): void {
    this.sendEvent('campaign_click', {
      campaign_id: campaignId,
      campaign_name: campaignName,
      element,
    });
  }

  trackCampaignApplied(campaignId: string, campaignName: string, discountValue: number, discountType: string): void {
    this.sendEvent('campaign_applied', {
      campaign_id: campaignId,
      campaign_name: campaignName,
      discount_value: discountValue,
      discount_type: discountType,
    });
  }

  // ===== AUTHENTICATION ANALYTICS =====

  trackAuth(action: 'login' | 'logout' | 'signup' | 'password_reset', method?: string): void {
    this.sendEvent('auth', {
      action,
      method: method || 'email',
    });
  }

  // ===== UTILITY METHODS =====

  private getElementPosition(): string {
    // This would be implemented to get the position of the clicked element
    return 'unknown';
  }

  // ===== LEGACY COMPATIBILITY =====

  // Keep existing methods for backward compatibility
  trackMembershipAction(action: string, planType?: string): void {
    this.sendEvent('membership_action', {
      action,
      plan_type: planType,
    });
  }

  trackCheckout(action: 'initiated' | 'completed' | 'failed', amount?: number, currency?: string): void {
    this.sendEvent('checkout', {
      action,
      amount,
      currency: currency || 'SEK',
    });
  }

  sendCustomEvent(eventName: string, data: Record<string, any>): void {
    this.sendEvent(eventName, data);
  }
}

// Export singleton instance
export const analytics = new EnhancedAnalyticsService();

// Export types for use in components
export type { AnalyticsEvent, PerformanceMetrics, EcommerceEvent };
