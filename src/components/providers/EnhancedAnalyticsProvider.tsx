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
    if (previousPathname.current !== pathname) {
      // Track time on previous page
      const timeOnPreviousPage = Math.round((Date.now() - pageStartTime.current) / 1000);
      if (timeOnPreviousPage > 0) {
        analytics.trackTimeOnPage(timeOnPreviousPage);
      }

      // Track new page view
      analytics.trackPageView(pathname);
      
      // Reset timer for new page
      pageStartTime.current = Date.now();
      previousPathname.current = pathname;
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

  // Track form interactions
  useEffect(() => {
    const trackFormInteractions = () => {
      // Track form starts
      const forms = document.querySelectorAll('form');
      forms.forEach((form) => {
        const formId = form.id || form.getAttribute('name') || 'unnamed_form';
        const formName = form.getAttribute('name') || formId;
        
        // Track form start when user focuses on first field
        const firstInput = form.querySelector('input, textarea, select') as HTMLElement;
        if (firstInput) {
          const handleFirstFocus = () => {
            analytics.trackFormStart(formId, formName);
            firstInput.removeEventListener('focus', handleFirstFocus);
          };
          firstInput.addEventListener('focus', handleFirstFocus);
        }

        // Track form submissions
        form.addEventListener('submit', (e) => {
          const formData = new FormData(form);
          const data: Record<string, any> = {};
          
          for (const [key, value] of formData.entries()) {
            data[key] = value;
          }

          analytics.trackFormSubmit(formId, data);
        });
      });

      // Track individual form field interactions
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        const form = input.closest('form');
        if (!form) return;

        const formId = form.id || form.getAttribute('name') || 'unnamed_form';
        const fieldName = (input as HTMLInputElement).name || (input as HTMLInputElement).id || 'unnamed_field';

        input.addEventListener('focus', () => {
          analytics.trackFormFieldFocus(formId, fieldName);
        });

        input.addEventListener('blur', () => {
          const hasValue = (input as HTMLInputElement).value.length > 0;
          analytics.trackFormFieldBlur(formId, fieldName, hasValue);
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
      // Track elements with data-track="cta" attribute
      const ctaElements = document.querySelectorAll('[data-track="cta"]');
      ctaElements.forEach((element) => {
        element.addEventListener('click', () => {
          const ctaText = element.textContent?.trim() || '';
          const ctaType = element.getAttribute('data-cta-type') || 'button';
          const location = element.getAttribute('data-location') || 'unknown';
          
          analytics.trackCTAClick(ctaText, ctaType, location);
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

  // Track errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analytics.trackError(new Error(event.message), 'javascript_error');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(new Error(event.reason), 'unhandled_promise_rejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden, track time on page
        const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
        analytics.trackTimeOnPage(timeOnPage);
      } else {
        // Page became visible, reset timer
        pageStartTime.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <>{children}</>;
}
