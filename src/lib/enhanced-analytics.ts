/**
 * Enhanced Analytics Service for Kraftverk Enterprise
 * Comprehensive data collection for customer portal integration
 * Supports both Analytics and Statistics endpoints for enterprise customers
 */

const CUSTOMER_PORTAL_URL = 'https://source-database.onrender.com';
const TENANT = 'kraftverk';

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
  private analyticsApiKey: string;
  private statisticsApiKey: string;
  private analyticsHmacSecret: string;
  private statisticsHmacSecret: string;

  constructor() {
    this.domain = typeof window !== 'undefined' ? window.location.hostname : '';
    this.sessionId = this.getSessionId();
    this.userId = this.getHashedUserId();
    this.startTime = performance.now();
    
    // Get API keys from environment
    this.analyticsApiKey = this.getAnalyticsApiKey();
    this.statisticsApiKey = this.getStatisticsApiKey();
    this.analyticsHmacSecret = this.getAnalyticsHmacSecret();
    this.statisticsHmacSecret = this.getStatisticsHmacSecret();
    
    this.initPerformanceTracking();
  }

  private getAnalyticsApiKey(): string {
    if (typeof window === 'undefined') return '';
    // Extract analytics API key from ANALYTICS_API_KEYS environment variable
    const analyticsKeys = process.env.NEXT_PUBLIC_ANALYTICS_API_KEYS || '';
    const match = analyticsKeys.match(/kraftverk:([^,]+)/);
    return match ? match[1] : '';
  }

  private getStatisticsApiKey(): string {
    if (typeof window === 'undefined') return '';
    // Extract statistics API key from STATISTICS_API_KEYS environment variable
    const statisticsKeys = process.env.NEXT_PUBLIC_STATISTICS_API_KEYS || '';
    const match = statisticsKeys.match(/kraftverk:([^,]+)/);
    return match ? match[1] : '';
  }

  private getAnalyticsHmacSecret(): string {
    if (typeof window === 'undefined') return '';
    return process.env.NEXT_PUBLIC_ANALYTICS_HMAC_SECRET || '';
  }

  private getStatisticsHmacSecret(): string {
    if (typeof window === 'undefined') return '';
    return process.env.NEXT_PUBLIC_STATISTICS_HMAC_SECRET || '';
  }

  private generateHmacSignature(data: string, secret: string): string {
    // Simple HMAC implementation for client-side
    // In production, this should be done server-side for security
    return btoa(data + secret).substr(0, 32);
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
        return btoa(userId + TENANT).substr(0, 16);
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
    if (typeof window === 'undefined') return;

    const event: AnalyticsEvent = {
      event_id: crypto.randomUUID(),
      tenant_id: TENANT,
      session_id: this.sessionId,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      referrer: document.referrer,
      source: this.getTrafficSource(),
      device: this.getDeviceType(),
      event_type: eventType,
      event_props: eventProps,
      user_agent: navigator.userAgent,
      load_time: performance.now() - this.startTime,
      custom_dimensions: window.CUSTOM_DIMENSIONS || {},
      domain: this.domain,
    };

    // Send to both Analytics and Statistics endpoints for enterprise customers
    await Promise.all([
      this.sendToAnalytics(event),
      this.sendToStatistics(event)
    ]);
  }

  private async sendToAnalytics(event: AnalyticsEvent): Promise<void> {
    if (!this.analyticsApiKey) return;

    try {
      const response = await fetch(`${CUSTOMER_PORTAL_URL}/api/pageviews/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.analyticsApiKey,
          'X-HMAC-Signature': this.generateHmacSignature(JSON.stringify(event), this.analyticsHmacSecret),
        },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        console.log('📊 Analytics tracked:', event.event_type, event.event_props);
      } else {
        console.warn('Analytics tracking failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }

  private async sendToStatistics(event: AnalyticsEvent): Promise<void> {
    if (!this.statisticsApiKey) return;

    try {
      const response = await fetch(`${CUSTOMER_PORTAL_URL}/api/statistics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.statisticsApiKey,
          'X-HMAC-Signature': this.generateHmacSignature(JSON.stringify(event), this.statisticsHmacSecret),
        },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        console.log('📈 Statistics tracked:', event.event_type, event.event_props);
      } else {
        console.warn('Statistics tracking failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Statistics error:', error);
    }
  }

  // ===== PAGE ANALYTICS =====

  trackPageView(path?: string, pageTitle?: string): void {
    this.sendEvent('page_view', {
      page_title: pageTitle || document.title,
      page_category: this.getPageCategory(),
      path: path || window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    });
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
