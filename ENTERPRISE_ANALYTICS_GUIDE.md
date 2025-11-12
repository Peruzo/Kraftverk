# Enterprise Analytics Integration Guide

## Overview

This guide explains how to implement comprehensive data collection from your Kraftverk website to the customer portal using **enterprise package** features. Since Kraftverk has an enterprise package, you get access to both Analytics and Statistics endpoints for maximum data collection.

## Enterprise Package Benefits

### 📊 Analytics Endpoints (Grow + Enterprise)
- Page views and unique visitors
- Session duration and bounce rate
- Traffic sources (organic, direct, referral, social)
- Geographic data (countries, regions, cities)
- Device and browser breakdown
- Form analytics

### 📈 Statistics Endpoints (Enterprise Only)
- Core Web Vitals (LCP, CLS, INP, FCP, TTFB)
- Performance metrics
- Advanced e-commerce tracking
- Real-time updates
- Custom dimensions
- Advanced segmentation
- Data retention
- API access

## Implementation Steps

### Step 1: Create Enterprise API Keys

Run the enterprise API key creation script:

```bash
node scripts/create-enterprise-api-keys.js
```

This creates **two separate API keys**:
1. **Analytics API Key** - For basic analytics data
2. **Statistics API Key** - For comprehensive enterprise data

### Step 2: Configure Environment Variables

Add to your `.env.local`:

```bash
# Enterprise Analytics & Statistics Configuration
IP_SALT=your-secure-salt-here

# Analytics API Keys (for both grow and enterprise customers)
ANALYTICS_API_KEYS=kraftverk:your-analytics-api-key

# Statistics API Keys (enterprise customers only)
STATISTICS_API_KEYS=kraftverk:your-statistics-api-key

# Webhook secrets for marketing data
WEBHOOK_SECRET_GOOGLE=your-google-webhook-secret
WEBHOOK_SECRET_META=your-meta-webhook-secret
WEBHOOK_SECRET_TIKTOK=your-tiktok-webhook-secret
WEBHOOK_SECRET_LINKEDIN=your-linkedin-webhook-secret

# HMAC secrets for ingest endpoints
ANALYTICS_HMAC_SECRET=your-analytics-hmac-secret
STATISTICS_HMAC_SECRET=your-statistics-hmac-secret

# Website URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Test Integration

Run the enterprise test script:

```bash
node scripts/test-analytics-integration.js
```

This tests:
- Analytics API key permissions
- Statistics API key permissions
- Analytics event tracking (pageviews endpoint)
- Statistics event tracking
- Data retrieval from both endpoints
- E-commerce events

### Step 4: Start Development Server

```bash
npm run dev
```

Visit your website and check browser console for analytics logs.

## Data Collection Architecture

### Dual Endpoint Strategy

```
Kraftverk Website
    │
    ├─► Analytics Events → /api/pageviews/track
    │   └─► Basic analytics data
    │
    └─► Statistics Events → /api/statistics/track
        └─► Comprehensive enterprise data
```

### Event Flow

1. **User Interaction** (page view, click, form submit)
2. **Enhanced Analytics Service** captures event
3. **Dual Send** to both endpoints:
   - Analytics API → `/api/pageviews/track`
   - Statistics API → `/api/statistics/track`
4. **Customer Portal** processes both streams
5. **Dashboard** shows unified analytics

## API Endpoints

### Analytics Endpoints

**POST** `/api/pageviews/track`
- Basic page view tracking
- Form analytics
- Traffic source data

**POST** `/api/pageviews_ext/track`
- Extended page view data
- Custom dimensions

**GET** `/api/analytics/statistics`
- Retrieve analytics data
- Geographic data

**GET** `/api/analytics/geo-data`
- Geographic analytics

### Statistics Endpoints (Enterprise)

**POST** `/api/statistics/track`
- Comprehensive event tracking
- Performance metrics
- E-commerce events
- Custom dimensions

**GET** `/api/statistics/overview`
- Statistics overview

**GET** `/api/statistics/traffic`
- Traffic analysis

**GET** `/api/statistics/content**
- Content performance

**GET** `/api/statistics/forms**
- Form analytics

**GET** `/api/statistics/funnels**
- Conversion funnels

**GET** `/api/statistics/cohorts**
- User cohorts

## Data Collection Features

### Automatic Tracking

The enhanced analytics system automatically tracks:

#### Analytics Events (Basic)
- Page views
- Form interactions
- Traffic sources
- Geographic data

#### Statistics Events (Enterprise)
- Core Web Vitals
- Performance metrics
- E-commerce events
- Custom dimensions
- Real-time updates

### Manual Tracking

```typescript
import { analytics } from '@/lib/enhanced-analytics';

// Track custom events (sent to both endpoints)
analytics.sendCustomEvent('custom_event', {
  custom_property: 'value'
});

// Track membership actions
analytics.trackMembershipView('base', 'Base Medlemskap', 399);

// Track performance metrics
analytics.trackPerformance('lcp', { lcp: 1200 });
```

## Environment Variables Reference

### Required Variables

```bash
# IP hashing for GDPR compliance
IP_SALT=your-secure-salt-here

# Analytics API Keys (format: tenant:key)
ANALYTICS_API_KEYS=kraftverk:your-analytics-api-key

# Statistics API Keys (format: tenant:key)
STATISTICS_API_KEYS=kraftverk:your-statistics-api-key

# HMAC secrets for ingest endpoints
ANALYTICS_HMAC_SECRET=your-analytics-hmac-secret
STATISTICS_HMAC_SECRET=your-statistics-hmac-secret
```

### Optional Variables

```bash
# Webhook secrets for marketing data
WEBHOOK_SECRET_GOOGLE=your-google-webhook-secret
WEBHOOK_SECRET_META=your-meta-webhook-secret
WEBHOOK_SECRET_TIKTOK=your-tiktok-webhook-secret
WEBHOOK_SECRET_LINKEDIN=your-linkedin-webhook-secret
```

## Customer Package Configuration

### Enterprise Package Features

```javascript
// Required features for statistics
features: {
  analytics: true,
  forms: true,
  performance: true,
  ecommerce: true,
  realTimeUpdates: true,
  customDimensions: true,
  advancedSegmentation: true,
  dataRetention: true,
  apiAccess: true  // This is crucial for API key access
}
```

### API Key Permissions

#### Analytics API Key (Grow + Enterprise)
```json
{
  "permissions": [
    {
      "module": "analytics",
      "actions": ["read", "write", "export"]
    },
    {
      "module": "forms",
      "actions": ["read", "write", "export"]
    }
  ]
}
```

#### Statistics API Key (Enterprise Only)
```json
{
  "permissions": [
    {
      "module": "analytics",
      "actions": ["read", "write", "export"]
    },
    {
      "module": "forms",
      "actions": ["read", "write", "export"]
    },
    {
      "module": "performance",
      "actions": ["read", "write", "export"]
    },
    {
      "module": "ecommerce",
      "actions": ["read", "write", "export"]
    },
    {
      "module": "realTimeUpdates",
      "actions": ["read", "write"]
    },
    {
      "module": "exports",
      "actions": ["read", "export"]
    },
    {
      "module": "customDimensions",
      "actions": ["read", "write"]
    },
    {
      "module": "advancedSegmentation",
      "actions": ["read", "write"]
    },
    {
      "module": "dataRetention",
      "actions": ["read", "write"]
    },
    {
      "module": "apiAccess",
      "actions": ["read", "write"]
    }
  ]
}
```

## Testing

### Manual Testing

1. **Start dev server**: `npm run dev`
2. **Visit pages**: Navigate through your website
3. **Check console**: Look for dual analytics logs:
   - `📊 Analytics tracked: page_view`
   - `📈 Statistics tracked: performance`
4. **Interact with forms**: Fill out forms and submit
5. **Test checkout**: Go through membership selection

### Automated Testing

```bash
# Test enterprise API key creation
node scripts/create-enterprise-api-keys.js

# Test analytics integration
node scripts/test-analytics-integration.js
```

### What to Look For

In browser console:
```
📊 Analytics tracked: page_view { page_title: "Medlemskap", ... }
📈 Statistics tracked: page_view { page_title: "Medlemskap", ... }
📊 Analytics tracked: form_submit { form_id: "contact", ... }
📈 Statistics tracked: form_submit { form_id: "contact", ... }
📈 Statistics tracked: performance { metric: "lcp", lcp: 1200 }
```

## Security & Privacy

### HMAC Authentication

Both endpoints use HMAC signatures for security:

```typescript
// Analytics endpoint
headers: {
  'X-API-Key': analyticsApiKey,
  'X-HMAC-Signature': generateHmacSignature(data, analyticsHmacSecret)
}

// Statistics endpoint
headers: {
  'X-API-Key': statisticsApiKey,
  'X-HMAC-Signature': generateHmacSignature(data, statisticsHmacSecret)
}
```

### GDPR Compliance

- User IDs are hashed for privacy
- IP addresses are not stored
- Session data is anonymized
- Custom dimensions can be configured
- Data retention policies apply

## Troubleshooting

### Analytics Not Tracking

1. **Check API keys**: Ensure both `ANALYTICS_API_KEYS` and `STATISTICS_API_KEYS` are set
2. **Check console**: Look for error messages
3. **Test endpoints**: Run `node scripts/test-analytics-integration.js`
4. **Check permissions**: Verify API keys have required permissions

### Statistics Not Tracking

1. **Check enterprise package**: Ensure Kraftverk has enterprise package enabled
2. **Check statistics API key**: Verify `STATISTICS_API_KEYS` is set correctly
3. **Check permissions**: Ensure statistics API key has enterprise permissions
4. **Check HMAC secrets**: Verify `STATISTICS_HMAC_SECRET` is set

### Data Not Appearing

1. **Check both endpoints**: Data should appear in both analytics and statistics dashboards
2. **Check tenant ID**: Ensure tenant ID matches (`kraftverk`)
3. **Check timestamps**: Data may take time to appear in dashboard
4. **Check rate limits**: Ensure you're not exceeding API rate limits

## Production Deployment

### Environment Variables

Ensure these are set in production:

```bash
# Production API keys
ANALYTICS_API_KEYS=kraftverk:your_production_analytics_key
STATISTICS_API_KEYS=kraftverk:your_production_statistics_key

# Production HMAC secrets
ANALYTICS_HMAC_SECRET=your_production_analytics_hmac_secret
STATISTICS_HMAC_SECRET=your_production_statistics_hmac_secret

# Production website URL
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### Monitoring

Monitor these metrics:
- Analytics event success rate
- Statistics event success rate
- API key usage and limits
- Performance impact
- Error rates

### Optimization

For production:
- Implement event batching
- Add retry logic for failed requests
- Optimize payload size
- Add data sampling for high-traffic sites
- Monitor rate limits

## Support

For issues or questions:
1. Check browser console for errors
2. Run test scripts to verify integration
3. Review customer portal documentation
4. Contact customer portal support team

---

**Last Updated**: January 15, 2025  
**Version**: 2.0.0 Enterprise  
**Integration**: Enhanced Analytics + Statistics → Customer Portal  
**Package**: Enterprise


