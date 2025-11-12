/**
 * Enhanced Analytics Provider
 * Comprehensive tracking for all user interactions
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/enhanced-analytics';

export default function EnhancedAnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const pageStartTime = useRef(Date.now());

  // Track page views and route changes
  useEffect(() => {
    console.log('🔍 [DEBUG] EnhancedAnalyticsProvider useEffect triggered');
    console.log('🔍 [DEBUG] Current pathname:', pathname);
    console.log('🔍 [DEBUG] Previous pathname:', previousPathname.current);
    console.log('🔍 [DEBUG] Analytics object:', analytics);
    
    if (previousPathname.current !== pathname) {
      console.log('🔍 [DEBUG] Pathname changed, tracking page view...');
      
      // Track time on previous page (match TRAFIKKALLOR guide format)
      const timeOnPreviousPage = Math.round((Date.now() - pageStartTime.current) / 1000);
      if (timeOnPreviousPage > 0) {
        console.log('🔍 [DEBUG] Tracking time on previous page:', timeOnPreviousPage, 'seconds');
        // CRITICAL: Pass page URL for correct landing page analysis
        analytics.trackTimeOnPage(timeOnPreviousPage, previousPathname.current);
      }

      // Track new page view
      console.log('🔍 [DEBUG] Calling analytics.trackPageView with pathname:', pathname);
      analytics.trackPageView(pathname);
      
      // Reset timer for new page
      pageStartTime.current = Date.now();
      previousPathname.current = pathname;
    } else {
      console.log('🔍 [DEBUG] Pathname unchanged, skipping page view tracking');
    }
  }, [pathname]);

  // Track scroll depth
  useEffect(() => {
    let maxScroll = 0;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
          maxScroll = scrollPercent;
          analytics.trackScrollDepth(scrollPercent);
        }
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Track form interactions (match TRAFIKKALLOR guide format)
  useEffect(() => {
    const trackFormInteractions = () => {
      const forms = document.querySelectorAll('form');
      
      forms.forEach((form) => {
        const formElement = form as HTMLFormElement;
        const formId = formElement.id || formElement.name || 'unnamed_form';
        const formName = formElement.name || formElement.id || formId;
        
        // Track form start time for duration calculation
        let formStartTime: number | null = null;
        const fieldFocusTimes: Record<string, number> = {};
        
        // Track form start when user focuses on first field (match TRAFIKKALLOR guide)
        formElement.addEventListener('focus', (e) => {
          if (e.target && (e.target as HTMLElement).matches('input, textarea, select') && !formStartTime) {
            formStartTime = Date.now();
            analytics.trackFormStart(formId, formName);
          }
        }, true);

        // Track field focus times for form_error timeSpent calculation
        formElement.addEventListener('focus', (e) => {
          if (e.target && (e.target as HTMLElement).matches('input, textarea, select')) {
            const fieldName = (e.target as HTMLInputElement).name || 
                             (e.target as HTMLInputElement).id || 
                             'unknown';
            fieldFocusTimes[fieldName] = Date.now();
          }
        }, true);

        // Track form field validation errors (match TRAFIKKALLOR guide for field drop-off)
        formElement.addEventListener('invalid', (e) => {
          e.preventDefault();
          if (!e.target) return;
          const field = e.target as HTMLInputElement;
          const fieldName = field.name || field.id || 'unknown';
          const timeSpent = fieldFocusTimes[fieldName] 
            ? Math.round((Date.now() - fieldFocusTimes[fieldName]) / 1000)
            : 0;
          
          // Track form error with field name and time spent (CRITICAL for field drop-off analysis)
          analytics.trackFormError(
            formId,
            fieldName,
            field.type || 'text',
            field.validationMessage || 'Invalid input',
            timeSpent
          );
        }, true);

        // Track form submissions with duration (match TRAFIKKALLOR guide)
        formElement.addEventListener('submit', (e) => {
          const formData = new FormData(formElement);
          const data: Record<string, any> = {};
          
          for (const [key, value] of formData.entries()) {
            data[key] = value;
          }

          // Calculate duration in seconds (CRITICAL for average form completion time)
          const duration = formStartTime 
            ? Math.round((Date.now() - formStartTime) / 1000)
            : 0;

          analytics.trackFormSubmit(formId, data, duration);
        });

        // Track individual form field interactions
        const inputs = formElement.querySelectorAll('input, textarea, select');
        inputs.forEach((input) => {
          const fieldName = (input as HTMLInputElement).name || 
                           (input as HTMLInputElement).id || 
                           'unnamed_field';

          input.addEventListener('focus', () => {
            analytics.trackFormFieldFocus(formId, fieldName);
          });

          input.addEventListener('blur', () => {
            const hasValue = (input as HTMLInputElement).value.length > 0;
            analytics.trackFormFieldBlur(formId, fieldName, hasValue);
          });
        });
      });
    };

    // Track form interactions after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', trackFormInteractions);
    } else {
      trackFormInteractions();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', trackFormInteractions);
    };
  }, [pathname]);

  // Track CTA clicks
  useEffect(() => {
    const trackCTAClicks = () => {
      // Track elements with data-track="cta" attribute (match TRAFIKKALLOR guide)
      const ctaElements = document.querySelectorAll('[data-track="cta"], button[data-cta], .cta-button, .call-to-action');
      ctaElements.forEach((element) => {
        element.addEventListener('click', () => {
          const ctaId = (element as HTMLElement).id || 
                       element.getAttribute('data-cta') || 
                       element.getAttribute('data-cta-id') || 
                       'unknown';
          const ctaText = element.textContent?.trim() || '';
          const ctaType = element.getAttribute('data-cta-type') || 'button';
          const location = element.getAttribute('data-location') || 'unknown';
          
          // Match TRAFIKKALLOR guide: ctaId, ctaText, ctaType in eventProps
          analytics.trackCTAClick(ctaText, ctaType, location, ctaId);
        });
      });

      // Track button clicks
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          const buttonText = button.textContent?.trim() || '';
          const buttonType = button.getAttribute('type') || 'button';
          const context = button.closest('[data-context]')?.getAttribute('data-context') || 'unknown';
          
          analytics.trackButtonClick(buttonText, buttonType, context);
        });
      });

      // Track link clicks
      const links = document.querySelectorAll('a[href]');
      links.forEach((link) => {
        link.addEventListener('click', () => {
          const linkText = link.textContent?.trim() || '';
          const linkUrl = link.getAttribute('href') || '';
          const isExternal = linkUrl.startsWith('http') && !linkUrl.includes(window.location.hostname);
          
          analytics.trackLinkClick(linkText, linkUrl, isExternal ? 'external' : 'internal');
        });
      });
    };

    // Track clicks after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', trackCTAClicks);
    } else {
      trackCTAClicks();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', trackCTAClicks);
    };
  }, [pathname]);

  // Track errors (match TRAFIKKALLOR guide: send as page_view with error info in eventProps)
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Send error as page_view event with error info in eventProps (for Systemhälsa widget)
      analytics.sendCustomEvent('page_view', {
        error: event.message,
        errorType: 'javascript',
        errorFile: event.filename,
        errorLine: event.lineno,
        errorColumn: event.colno,
        errorCode: 500, // JavaScript errors treated as server errors
        statusCode: 500,
        httpStatus: 500,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Send promise rejection as page_view event (for Systemhälsa widget)
      analytics.sendCustomEvent('page_view', {
        error: event.reason?.message || 'Unhandled promise rejection',
        errorType: 'promise_rejection',
        errorCode: 500,
        statusCode: 500,
        httpStatus: 500,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Track page visibility changes and beforeunload (match TRAFIKKALLOR guide)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden, track time on page (match TRAFIKKALLOR guide)
        const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
        // CRITICAL: Pass page URL for correct landing page analysis
        analytics.trackTimeOnPage(timeOnPage, pathname);
      } else {
        // Page became visible, reset timer
        pageStartTime.current = Date.now();
      }
    };

    // Track time on page when user leaves (beforeunload) - CRITICAL for session length
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
      if (timeOnPage > 0) {
        // Use sendBeacon for reliable delivery on page unload (per TRAFIKKALLOR guide)
        const event = {
          event_type: 'time_on_page',
          url: pathname,
          title: document.title,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          sessionId: analytics.getSessionId() || '',
          device: analytics.getDeviceTypePublic() || 'desktop',
          consent: analytics.getUserConsentStatus(),
          tenant: 'kraftverk', // CRITICAL: for tenant isolation
          properties: {
            duration: timeOnPage, // CRITICAL: seconds
            page: pathname, // CRITICAL: page URL for landing page analysis
          },
        };
        
        // Use sendBeacon for reliable delivery (per TRAFIKKALLOR guide)
        if (navigator.sendBeacon) {
          const payload = JSON.stringify({
            eventType: 'time_on_page',
            event: event,
          });
          navigator.sendBeacon('/api/analytics', payload);
        } else {
          // Fallback to regular track
          analytics.trackTimeOnPage(timeOnPage, pathname);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  return <>{children}</>;
}


