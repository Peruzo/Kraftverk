# Enhanced Analytics Integration Guide

## Overview

This guide explains how to implement comprehensive data collection from your Kraftverk website to the customer portal using a single API key with all necessary permissions.

## What Data We Collect

### 📊 Analytics Data
- Page views and unique visitors
- Session duration and bounce rate
- Traffic sources (organic, direct, referral, social)
- Geographic data (countries, regions, cities)
- Device and browser breakdown
- Conversion funnels
- Retention cohorts

### ⚡ Performance Data
- Core Web Vitals (LCP, CLS, INP, FCP, TTFB)
- Page load times
- Error tracking
- System health metrics

### 📝 Form Analytics
- Form completion rates
- Field drop-off analysis
- Form performance metrics
- Error tracking

### 🛒 E-commerce Data
- Purchase events
- Product views
- Cart interactions
- Revenue tracking
- Membership conversions

### 🎯 Campaign Data
- Campaign views and clicks
- Discount applications
- Conversion tracking

## Implementation Steps

### Step 1: Create API Key

Run the API key creation script:

```bash
node scripts/create-analytics-api-key.js
```

This creates an API key with comprehensive permissions:
- Analytics (read, write, export)
- Forms (read, write, export)
- Performance (read, write, export)
- E-commerce (read, write, export)
- Real-time updates (read, write)
- Campaigns (read, write, export)
- Memberships (read, write, export)
- Bookings (read, write, export)

### Step 2: Configure Environment Variables

Add to your `.env.local`:

```bash
# Analytics API Key (from Step 1)
NEXT_PUBLIC_ANALYTICS_API_KEY=your_analytics_api_key_here

# Source Portal Integration (existing)
SOURCE_API_KEY=kraftverk_secure_api_key_here

# Website URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Test Integration

Run the test script:

```bash
node scripts/test-analytics-integration.js
```

This verifies:
- API key permissions
- Analytics event tracking
- Data retrieval
- Performance metrics
- E-commerce events

### Step 4: Start Development Server

```bash
npm run dev
```

Visit your website and check browser console for analytics logs.

## Data Collection Features

### Automatic Tracking

The enhanced analytics system automatically tracks:

#### Page Analytics
- Page views on route changes
- Time spent on each page
- Scroll depth (25%, 50%, 75%, 100%)
- Page visibility changes

#### Form Analytics
- Form start events
- Field focus/blur events
- Form submissions
- Form abandonment tracking
- Completion time analysis

#### User Interactions
- Button clicks
- CTA clicks (elements with `data-track="cta"`)
- Link clicks (internal vs external)
- Scroll behavior

#### Performance Monitoring
- Core Web Vitals (LCP, CLS, INP, FCP)
- Page load times
- JavaScript errors
- Unhandled promise rejections

#### E-commerce Events
- Product views (membership plans)
- Add to cart (membership selection)
- Checkout initiation
- Purchase completion
- Campaign applications

### Manual Tracking

You can also manually track events:

```typescript
import { analytics } from '@/lib/enhanced-analytics';

// Track custom events
analytics.sendCustomEvent('custom_event', {
  custom_property: 'value'
});

// Track membership actions
analytics.trackMembershipView('base', 'Base Medlemskap', 399);

// Track class bookings
analytics.trackClassBooking('Yoga', 'Anna Svensson', '18:00', 'class_123');

// Track campaign interactions
analytics.trackCampaignView('summer_sale', 'Summer Sale');
```

## Data Structure

### Analytics Event Format

```typescript
interface AnalyticsEvent {
  event_id: string;           // Unique event identifier
  tenant_id: string;          // 'kraftverk'
  session_id: string;          // Session identifier
  user_id?: string;           // Hashed user ID (if logged in)
  timestamp: string;           // ISO timestamp
  page: string;                // Current page path
  referrer: string;            // Referring URL
  source: string;              // Traffic source
  device: string;              // Device type
  event_type: string;          // Event type
  event_props: object;         // Event-specific data
  user_agent: string;          // Browser user agent
  load_time: number;           // Page load time
  custom_dimensions: object;   // Custom data
  domain: string;              // Website domain
}
```

### Event Types

#### Page Events
- `page_view` - Page visits
- `scroll_depth` - Scroll percentage
- `time_on_page` - Time spent on page

#### Form Events
- `form_start` - Form interaction begins
- `form_field_focus` - Field focused
- `form_field_blur` - Field unfocused
- `form_submit` - Form submitted
- `form_abandon` - Form abandoned

#### E-commerce Events
- `product_view` - Product/membership viewed
- `add_to_cart` - Item added to cart
- `checkout_initiated` - Checkout started
- `purchase` - Purchase completed

#### Performance Events
- `performance` - Performance metrics
- `error` - JavaScript errors

#### User Interaction Events
- `cta_click` - CTA button clicked
- `button_click` - Button clicked
- `link_click` - Link clicked

## API Endpoints

### Analytics Tracking
**POST** `/api/statistics/track`

Sends analytics events to customer portal.

**Headers:**
```json
{
  "Content-Type": "application/json",
  "X-API-Key": "your_analytics_api_key"
}
```

**Body:**
```json
{
  "event_id": "uuid",
  "tenant_id": "kraftverk",
  "session_id": "sess_abc123",
  "event_type": "page_view",
  "event_props": {
    "page_title": "Medlemskap",
    "page_category": "membership"
  },
  // ... other fields
}
```

### Data Retrieval
**GET** `/api/analytics/events`

Retrieves analytics data from customer portal.

**Headers:**
```json
{
  "X-API-Key": "your_analytics_api_key"
}
```

**Query Parameters:**
- `tenantId` - Tenant identifier
- `limit` - Number of events to retrieve
- `startDate` - Start date filter
- `endDate` - End date filter

## Testing

### Manual Testing

1. **Start dev server**: `npm run dev`
2. **Visit pages**: Navigate through your website
3. **Check console**: Look for analytics logs
4. **Interact with forms**: Fill out forms and submit
5. **Click buttons**: Click various buttons and CTAs
6. **Test checkout**: Go through membership selection

### Automated Testing

```bash
# Test API key creation
node scripts/create-analytics-api-key.js

# Test analytics integration
node scripts/test-analytics-integration.js
```

### What to Look For

In browser console:
```
📊 Analytics tracked: page_view { page_title: "Medlemskap", ... }
📊 Analytics tracked: form_submit { form_id: "contact", ... }
📊 Analytics tracked: cta_click { cta_text: "Välj plan", ... }
📊 Analytics tracked: performance { metric: "lcp", lcp: 1200 }
```

## Privacy & GDPR Compliance

### Data Protection
- User IDs are hashed for privacy
- IP addresses are not stored
- Session data is anonymized
- Custom dimensions can be configured

### Consent Management
- Analytics tracking respects user preferences
- Can be disabled via environment variable
- No personal data collected without consent

## Troubleshooting

### Analytics Not Tracking

1. **Check API key**: Ensure `NEXT_PUBLIC_ANALYTICS_API_KEY` is set
2. **Check console**: Look for error messages
3. **Test endpoint**: Run `node scripts/test-analytics-integration.js`
4. **Check network**: Verify customer portal is accessible

### Performance Issues

1. **Rate limiting**: Check API key rate limits
2. **Batch events**: Events are sent individually (can be optimized)
3. **Error handling**: Failed requests are logged but don't block UI

### Data Not Appearing

1. **Check permissions**: Verify API key has required permissions
2. **Check tenant**: Ensure tenant ID matches
3. **Check timestamps**: Data may take time to appear in dashboard

## Production Deployment

### Environment Variables

Ensure these are set in production:

```bash
NEXT_PUBLIC_ANALYTICS_API_KEY=your_production_api_key
SOURCE_API_KEY=kraftverk_production_api_key
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### Monitoring

Monitor these metrics:
- Analytics event success rate
- API key usage and limits
- Performance impact
- Error rates

### Optimization

For production:
- Implement event batching
- Add retry logic for failed requests
- Optimize payload size
- Add data sampling for high-traffic sites

## Support

For issues or questions:
1. Check browser console for errors
2. Run test scripts to verify integration
3. Review customer portal documentation
4. Contact customer portal support team

---

**Last Updated**: January 15, 2025  
**Version**: 2.0.0  
**Integration**: Enhanced Analytics → Customer Portal
