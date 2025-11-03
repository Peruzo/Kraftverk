# Trafikkällor (Traffic Sources) Integration - Implementation Summary

## ✅ Implementation Complete

The analytics system has been updated to match the TRAFIKKALLOR integration guide from the customer portal team. Traffic sources will now be automatically detected and categorized by the customer portal.

## 📋 Changes Made

### 1. **Event Structure Updated**
   - Changed from nested `type`/`properties` structure to flat structure matching guide
   - `event_type` now at top level (instead of `type`)
   - `sessionId`, `userId`, `device`, `consent` moved to top level
   - `referrer` sent as `null` if empty (for direct traffic detection)

### 2. **Session ID Format**
   - Updated to match guide format: `sess_timestamp_random`
   - Example: `sess_1737974400000_a3b5c7d9e`

### 3. **Traffic Source Detection**
   - Customer portal automatically detects traffic sources from `referrer`
   - We send `referrer` as `null` for direct traffic
   - Categories: `direct`, `organic`, `social`, `email`, `referral`

### 4. **GDPR Consent Management**
   - Added `consent` field (true/false) to all events
   - Defaults to `false` (GDPR compliant)
   - Analytics tracking skipped if consent is `false`
   - Public methods added to manage consent:
     - `analytics.setUserConsent(true)` - Enable tracking
     - `analytics.getUserConsentStatus()` - Check current status

### 5. **Device Detection**
   - Device type at top level: `"desktop"`, `"mobile"`, or `"tablet"`
   - Based on viewport width (< 768px = mobile, < 1024px = tablet)

## 🔧 How It Works

### Automatic Traffic Source Detection

The customer portal automatically categorizes traffic based on `referrer`:

| Referrer Contains | Category |
|-------------------|----------|
| No referrer (null) | **direct** |
| `google.com`, `bing.com`, `yahoo.com`, etc. | **organic** (Sök) |
| `facebook.com`, `instagram.com`, `linkedin.com`, etc. | **social** (Sociala medier) |
| `mail.`, `email`, `newsletter` | **email** (E-post) |
| All other referrers | **referral** |

### Event Format

Events are now sent in this format:

```javascript
{
  "event_type": "page_view",
  "url": "/produkter",
  "title": "Produkter - Kraftverk",
  "referrer": "https://www.google.com/search?q=produkter", // or null
  "userAgent": navigator.userAgent,
  "timestamp": "2025-01-27T12:00:00.000Z",
  "sessionId": "sess_1737974400000_a3b5c7d9e",
  "userId": undefined, // Hashed user ID if logged in
  "device": "desktop", // "desktop", "mobile", or "tablet"
  "consent": true, // GDPR consent status
  "properties": {
    // Additional metadata
    "screenWidth": 1920,
    "screenHeight": 1080,
    "language": "sv-SE",
    // ... other properties
  }
}
```

## 🚀 Enabling Analytics Tracking

### For Development/Testing

To enable analytics tracking immediately (for testing), you can set consent in the browser console:

```javascript
// Enable tracking
localStorage.setItem('analytics_consent', 'true');

// Or use the analytics method
analytics.setUserConsent(true);
```

### For Production

You need to implement a GDPR-compliant consent banner. When the user accepts, call:

```javascript
// User accepted analytics
analytics.setUserConsent(true);

// User rejected analytics
analytics.setUserConsent(false);
```

### Example Consent Banner Component

```typescript
'use client';

import { analytics } from '@/lib/enhanced-analytics';
import { useState, useEffect } from 'react';

export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('analytics_consent');
    if (consent === null) {
      // Show banner if no choice made
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    analytics.setUserConsent(true);
    setShowBanner(false);
  };

  const handleReject = () => {
    analytics.setUserConsent(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="consent-banner">
      <p>Vi använder cookies för att analysera trafik och förbättra din upplevelse.</p>
      <button onClick={handleAccept}>Acceptera</button>
      <button onClick={handleReject}>Avvisa</button>
    </div>
  );
}
```

## 📊 What Gets Tracked

### Automatic Tracking
- ✅ Page views (with traffic source detection)
- ✅ Geo-location data (country, city, etc.)
- ✅ Scroll depth
- ✅ Time on page
- ✅ Form interactions
- ✅ CTA clicks
- ✅ Button clicks
- ✅ Link clicks

### Manual Tracking
- ✅ Custom events
- ✅ Product views
- ✅ Add to cart
- ✅ Checkout events
- ✅ Purchase events
- ✅ Membership actions
- ✅ Class bookings

## 🔍 Testing Traffic Sources

To test different traffic sources:

1. **Direct Traffic**: Open URL directly in browser (no referrer)
2. **Organic Search**: Click link from Google search results
3. **Social Media**: Click link from Facebook/Instagram post
4. **Email**: Click link from email newsletter
5. **Referral**: Click link from another website

The customer portal will automatically categorize each visit based on the `referrer` value.

## 📝 Notes

- **UTM Parameters**: The customer portal automatically processes UTM parameters if included in URLs
- **Session Persistence**: Session IDs persist for the browser session (until tab/window closes)
- **Consent Default**: Default consent is `false` (GDPR compliant) - tracking won't work until consent is given
- **Backward Compatibility**: Old event format still works, but new format is preferred

## 🔗 Endpoints

- Analytics: `POST https://source-database.onrender.com/api/ingest/analytics`
- Tenant: `kraftverk`
- Authentication: `X-Tenant` header with tenant ID

## ✅ Verification

After implementation, verify in browser console:
1. Check for debug logs: `🔍 [DEBUG] Enhanced analytics...`
2. Check for success logs: `✅ [SUCCESS] Enhanced analytics tracked...`
3. If consent is false: `⚠️ [GDPR] User has not given consent...`

In the customer portal dashboard, traffic sources should appear categorized as:
- Direkt (Direct)
- Sök (Organic/Search)
- Sociala medier (Social)
- E-post (Email)
- Referral (Other)

