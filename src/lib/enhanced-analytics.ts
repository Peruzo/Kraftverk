/**
 * Enhanced Analytics Service for Kraftverk Enterprise
 * Updated to use simplified authentication (no API keys needed!)
 * Comprehensive data collection for customer portal integration
 */

const ANALYTICS_ENDPOINT = 'https://source-database.onrender.com/api/ingest/analytics';
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
    this.sessionId = this.initializeSessionId();
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

  private initializeSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('kraftverk_session_id');
    if (!sessionId) {
      // Format: sess_timestamp_random (matching TRAFIKKALLOR guide)
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('kraftverk_session_id', sessionId);
    }
    return sessionId;
  }

  private getUserConsent(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check if user has given consent for GDPR compliance
    const consent = localStorage.getItem('analytics_consent');
    if (consent === 'true') {
      return true;
    }
    if (consent === 'false') {
      return false;
    }
    // Default to false if no consent choice made (GDPR compliant)
    return false;
  }

  /**
   * Public method to set user consent for GDPR compliance
   * Call this when user accepts/rejects analytics tracking
   */
  setUserConsent(consent: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('analytics_consent', consent.toString());
    console.log('✅ [GDPR] Analytics consent updated:', consent);
  }

  /**
   * Public method to get current consent status
   */
  getUserConsentStatus(): boolean {
    return this.getUserConsent();
  }

  /**
   * Public method to get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Public method to get current device type (public wrapper to avoid recursion)
   */
  getDeviceTypePublic(): string {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Tablet-detektering (bättre än bara bredd)
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent) ||
                     (width >= 768 && width < 1024 && width > height * 0.8);
    
    if (isTablet) {
      return 'tablet';
    }
    
    // Mobile-detektering
    if (width < 768 || /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile';
    }
    
    // Desktop som standard
    return 'desktop';
  }

  private getHashedUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    
    // First, check if user is logged in (you can modify this based on your auth system)
    const userElement = document.querySelector('[data-user-id]');
    if (userElement) {
      const userId = userElement.getAttribute('data-user-id');
      if (userId) {
        return btoa(userId + TENANT_ID).substr(0, 16);
      }
    }
    
    // If not logged in, use localStorage for consistent userId (per customer portal requirements)
    // This ensures accurate unique visitor counts
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      // Generate a persistent user ID
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_user_id', userId);
    }
    
    // Hash the userId for privacy (consistent hashing)
    return btoa(userId + TENANT_ID).substr(0, 16);
  }

  private getTrafficSource(referrer?: string | null): string {
    if (typeof window === 'undefined') return 'direct';
    
    const ref = referrer || document.referrer;
    if (!ref) return 'direct';
    
    try {
      const hostname = new URL(ref).hostname.toLowerCase();
      
      // Check for search engines (organic)
      if (hostname.includes('google') || hostname.includes('bing') || 
          hostname.includes('yahoo') || hostname.includes('duckduckgo')) {
        return 'organic';
      }
      
      // Check for social media
      if (hostname.includes('facebook') || hostname.includes('instagram') || 
          hostname.includes('linkedin') || hostname.includes('twitter') || 
          hostname.includes('tiktok') || hostname.includes('youtube')) {
        return 'social';
      }
      
      // Check for email
      if (hostname.includes('mail.') || hostname.includes('email') || 
          hostname.includes('newsletter')) {
        return 'email';
      }
      
      // Default to referral for other sources
      return 'referral';
    } catch {
      // If referrer is invalid URL, treat as direct
      return 'direct';
    }
  }

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'desktop';
    
    // Improved device detection using User-Agent + screen width (per customer portal requirements)
    const width = window.innerWidth || document.documentElement.clientWidth;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Tablet detection (better than width alone)
    const isTablet = /tablet|ipad|playbook|silk/i.test(userAgent) ||
                     (width >= 768 && width < 1024 && width > window.innerHeight * 0.8);
    
    if (isTablet) {
      return 'tablet';
    }
    
    // Mobile detection using User-Agent + width
    const isMobile = /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent) ||
                     width < 768;
    
    if (isMobile) {
      return 'mobile';
    }
    
    // Desktop as default
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

  private async sendEvent(eventType: string, eventProps: Record<string, any> = {}, bypassConsent: boolean = false): Promise<void> {
    if (typeof window === 'undefined') {
      console.log('🔍 [DEBUG] sendEvent called on server side - skipping');
      return;
    }

    // Check consent before tracking (GDPR compliance)
    // Some critical events (like purchases) may bypass consent check
    if (!bypassConsent && !this.getUserConsent()) {
      console.log('⚠️ [GDPR] User has not given consent for analytics tracking - skipping event:', eventType);
      return;
    }

    console.log('🔍 [DEBUG] Starting enhanced analytics event tracking...');
    console.log('🔍 [DEBUG] Event type:', eventType);
    console.log('🔍 [DEBUG] Event props:', eventProps);
    console.log('🔍 [DEBUG] Current URL:', window.location.href);
    console.log('🔍 [DEBUG] Current path:', window.location.pathname);

    // Build event matching TRAFIKKALLOR integration guide format
    const currentPath = eventProps.path || window.location.pathname;
    const fullUrl = currentPath + (eventProps.search || window.location.search || '');
    
    const event = {
      event_type: eventType, // Top level (matching guide format)
      url: fullUrl,
      title: eventProps.page_title || document.title,
      referrer: document.referrer || null, // null if empty for direct traffic detection
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId, // Top level (CRITICAL)
      userId: this.userId, // Top level (hashed if available)
      device: this.getDeviceType(), // Top level: "desktop", "mobile", or "tablet" (CRITICAL)
      consent: this.getUserConsent(), // Top level: true/false for GDPR
      tenant: TENANT_ID, // CRITICAL: for tenant isolation (per TRAFIKKALLOR guide)
      properties: {
        ...eventProps,
        // Keep additional metadata in properties
        loadTime: performance.now() - this.startTime,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    };

    console.log('🔍 [DEBUG] Enhanced analytics event formatted:', JSON.stringify(event, null, 2));
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
          event: event, // Send full event object for proper formatting
        }),
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

    // Get performance metrics for Systemhälsa widget (CRITICAL)
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const loadTime = navigation 
      ? navigation.loadEventEnd - navigation.fetchStart 
      : performance.now();

    // Try to detect HTTP status code (for error tracking)
    let statusCode = 200; // Default: success
    let errorInfo: string | null = null;
    
    if (document.readyState === 'complete') {
      // Check if page is a 404
      const has404 = document.querySelector('[data-status="404"]') || 
                     window.location.pathname.includes('404') ||
                     document.title.toLowerCase().includes('not found');
      
      if (has404) {
        statusCode = 404;
        errorInfo = 'Page not found';
      }
    }

    // Send page view event matching TRAFIKKALLOR integration guide format
    // Include performance metrics and status code for Systemhälsa widget
    this.sendEvent('page_view', {
      page_title: pageTitle || document.title,
      page_category: this.getPageCategory(),
      path: path || window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
      // CRITICAL for Systemhälsa widget: responseTime/loadTime in milliseconds
      responseTime: loadTime,
      loadTime: loadTime,
      pageLoadTime: loadTime,
      // CRITICAL for Systemhälsa widget: statusCode/httpStatus for error tracking
      statusCode: statusCode,
      httpStatus: statusCode,
      // Additional performance metrics (optional)
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
      firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
      // Error info if present
      ...(errorInfo && {
        error: errorInfo,
        errorCode: statusCode,
      }),
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
      
      // Send geo data as a regular analytics event to the working endpoint
      const geoEvent = {
        type: 'page_view_geo',
        url: window.location.href,
        path: path,
        title: document.title,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        properties: {
          // Include geo data in properties
          country: geoData.country_name,
          countryCode: geoData.country_code,
          region: geoData.region,
          city: geoData.city,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          timezone: geoData.timezone,
          sessionId: this.sessionId,
          userId: this.userId,
          source: this.getTrafficSource(),
          device: this.getDeviceType(),
          loadTime: performance.now() - this.startTime,
        },
      };

      const geoPayload = {
        tenant: TENANT_ID,
        events: [geoEvent]
      };

      console.log('🌍 [DEBUG] Enhanced analytics geo payload to send:', JSON.stringify(geoPayload, null, 2));
      console.log('🌍 [DEBUG] Using server-side API route to avoid CORS issues');

      // Use our server-side API route to avoid CORS issues
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'page_view_geo',
          properties: {
            url: window.location.href,
            path: path,
            title: document.title,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            country: geoData.country_name,
            countryCode: geoData.country_code,
            region: geoData.region,
            city: geoData.city,
            latitude: geoData.latitude,
            longitude: geoData.longitude,
            timezone: geoData.timezone,
            sessionId: this.sessionId,
            userId: this.userId,
            source: this.getTrafficSource(),
            device: this.getDeviceType(),
            loadTime: performance.now() - this.startTime,
          },
        }),
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
    // Send performance metrics as page_view events (performance is not a valid event type)
    // This ensures Core Web Vitals are tracked while using valid event types
    this.sendEvent('page_view', {
      performance_metric: metric, // e.g., 'lcp', 'cls', 'fcp', 'page_load'
      performance_data: data, // e.g., { lcp: 1234, cls: 0.1, fcp: 567, load_time: 890 }
      path: window.location.pathname,
      page_title: document.title,
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
    // Match TRAFIKKALLOR guide: formId, formName, formAction, formMethod in eventProps
    const form = document.querySelector(`form[id="${formId}"], form[name="${formId}"]`) as HTMLFormElement | null;
    
    this.sendEvent('form_start', {
      formId: formId, // CRITICAL: required
      formName: formName || form?.name || form?.id || formId,
      formAction: form?.action || '',
      formMethod: form?.method || 'POST',
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

  trackFormError(formId: string, fieldName: string, fieldType?: string, errorMessage?: string, timeSpent?: number): void {
    // Match TRAFIKKALLOR guide: formId, fieldName, fieldType, errorMessage, timeSpent (seconds) in eventProps
    const form = document.querySelector(`form[id="${formId}"], form[name="${formId}"]`) as HTMLFormElement | null;
    
    this.sendEvent('form_error', {
      formId: formId, // CRITICAL: required
      fieldName: fieldName, // CRITICAL: required for field drop-off analysis
      fieldType: fieldType || 'text',
      errorMessage: errorMessage || 'Invalid input',
      timeSpent: timeSpent ? Math.round(timeSpent) : undefined, // CRITICAL: seconds in field before error
      formName: form?.name || form?.id || formId,
    });
  }

  trackFormSubmit(formId: string, formData?: Record<string, any>, duration?: number): void {
    // Match TRAFIKKALLOR guide: formId, duration (seconds), formName, formAction, formMethod in eventProps
    const form = formId ? document.querySelector(`form[id="${formId}"], form[name="${formId}"]`) : null;
    const formElement = form as HTMLFormElement | null;
    
    this.sendEvent('form_submit', {
      formId: formId, // CRITICAL: required
      duration: duration ? Math.round(duration) : undefined, // CRITICAL: seconds to fill form
      formName: formElement?.name || formElement?.id || formId,
      formAction: formElement?.action || '',
      formMethod: formElement?.method || 'POST',
      formData: formData, // Optional: form data
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
    // Match TRAFIKKALLOR guide: product_view for Product Purchase Funnel
    this.sendEvent('product_view', {
      product_id: productId,
      product_name: productName,
      category: category,
      price: price,
      currency: 'SEK',
    });
  }

  trackAddToCart(productId: string, productName: string, quantity: number, price: number): void {
    // Match TRAFIKKALLOR guide: add_to_cart for Product Purchase Funnel
    this.sendEvent('add_to_cart', {
      product_id: productId,
      product_name: productName,
      quantity: quantity,
      price: price, // In SEK (not öre)
      currency: 'SEK',
    });
  }

  trackCheckoutInitiated(checkoutId: string, amount: number, currency: string = 'SEK', items?: any[]): void {
    // Match TRAFIKKALLOR guide: checkout event with checkoutId, amount (in öre), currency, items in eventProps
    this.sendEvent('checkout', {
      checkoutId: checkoutId, // CRITICAL: checkout session ID
      amount: amount, // CRITICAL: in öre (e.g., 49900 for 499 SEK)
      currency: currency || 'SEK',
      items: items || [],
    });
  }

  trackPurchase(transactionId: string, value: number, currency: string = 'SEK', items: any[], revenue?: number): void {
    // Match TRAFIKKALLOR guide: transactionId, value (in öre), currency, items, revenue in eventProps
    this.sendEvent('purchase', {
      transactionId: transactionId, // CRITICAL: required
      value: value, // CRITICAL: in öre (e.g., 49900 for 499 SEK)
      revenue: revenue || value, // CRITICAL: total amount (in öre)
      currency: currency || 'SEK',
      items: items || [],
    });
  }

  // ===== USER INTERACTION ANALYTICS =====

  trackCTAClick(ctaText: string, ctaType: string, location?: string, ctaId?: string): void {
    // Match TRAFIKKALLOR guide: ctaId, ctaText, ctaType in eventProps
    this.sendEvent('cta_click', {
      ctaId: ctaId || 'unknown',
      ctaText: ctaText.trim().substring(0, 100), // Max 100 chars per guide
      ctaType: ctaType || 'button',
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

  trackTimeOnPage(seconds: number, page?: string): void {
    // Match TRAFIKKALLOR guide: duration in seconds, page URL in eventProps
    this.sendEvent('time_on_page', {
      duration: seconds, // CRITICAL: seconds (not minutes)
      page: page || window.location.pathname, // CRITICAL: page URL
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
