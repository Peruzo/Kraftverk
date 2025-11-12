'use client';

import { useState, useEffect } from 'react';
import { analytics } from '@/lib/enhanced-analytics';
import styles from './ConsentBanner.module.css';

export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('analytics_consent');
    const consentTimestamp = localStorage.getItem('analytics_consent_timestamp');
    
    // If no consent decision made, show banner
    if (consent === null) {
      // Small delay to avoid flashing on page load
      const timer = setTimeout(() => {
        setShowBanner(true);
        setIsAnimating(true);
      }, 500);
      return () => clearTimeout(timer);
    }

    // If consent was given more than 12 months ago, show banner again (GDPR best practice)
    if (consent === 'true' && consentTimestamp) {
      const timestamp = parseInt(consentTimestamp, 10);
      const twelveMonthsAgo = Date.now() - (12 * 30 * 24 * 60 * 60 * 1000); // 12 months in ms
      
      if (timestamp < twelveMonthsAgo) {
        const timer = setTimeout(() => {
          setShowBanner(true);
          setIsAnimating(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = () => {
    analytics.setUserConsent(true);
    localStorage.setItem('analytics_consent', 'true');
    localStorage.setItem('analytics_consent_timestamp', Date.now().toString());
    
    setIsAnimating(false);
    setTimeout(() => {
      setShowBanner(false);
    }, 300);
  };

  const handleReject = () => {
    analytics.setUserConsent(false);
    localStorage.setItem('analytics_consent', 'false');
    localStorage.setItem('analytics_consent_timestamp', Date.now().toString());
    
    setIsAnimating(false);
    setTimeout(() => {
      setShowBanner(false);
    }, 300);
  };

  const handleOpenSettings = () => {
    // Scroll to privacy section on "Om oss" page
    if (window.location.pathname === '/om-oss') {
      const element = document.getElementById('integritet');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Navigate to privacy section
      window.location.href = '/om-oss#integritet';
    }
    
    // Close banner temporarily when user clicks to read more
    setIsAnimating(false);
    setTimeout(() => {
      setShowBanner(false);
    }, 300);
  };

  if (!showBanner) return null;

  return (
    <div 
      className={`${styles.banner} ${isAnimating ? styles.show : ''}`}
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
    >
      <div className={styles.content}>
        <div className={styles.text}>
          <h3 id="consent-title" className={styles.title}>
            Vi använder cookies
          </h3>
          <p id="consent-description" className={styles.description}>
            Vi använder cookies och liknande tekniker för att analysera trafik på vår webbplats, 
            förbättra användarupplevelsen och för att visa relevant innehåll. Genom att acceptera 
            samtycker du till vår användning av cookies. Du kan när som helst ändra dina inställningar.
          </p>
          <button
            type="button"
            onClick={handleOpenSettings}
            className={styles.settingsLink}
            aria-label="Öppna cookie-inställningar"
          >
            Läs mer om cookies och integritet
          </button>
        </div>
        
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleReject}
            className={styles.rejectButton}
            aria-label="Avvisa cookies"
          >
            Avvisa
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className={styles.acceptButton}
            aria-label="Acceptera cookies"
          >
            Acceptera alla
          </button>
        </div>
      </div>
    </div>
  );
}

