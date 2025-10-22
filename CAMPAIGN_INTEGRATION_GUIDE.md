# Campaign Management Integration Guide

## Overview

This guide explains how to use the campaign management system integrated into Kraftverk Studio. The system allows you to receive campaign updates from the Source customer portal and automatically apply discounts to memberships via Stripe.

## Architecture

```
Source Portal (source-database.onrender.com)
    │
    ├─► Webhook → /api/campaigns/webhook
    │   └─► Updates local campaign cache
    │
    └─► Campaign Data
        ├─► Fetched by PricingCard component
        └─► Applied to Stripe checkout
```

## Features

✅ **Webhook Integration** - Receive real-time campaign updates from Source portal  
✅ **Automatic Price Updates** - Display discounted prices on membership cards  
✅ **Stripe Integration** - Apply coupon codes automatically at checkout  
✅ **Campaign Badges** - Visual indicators for active discounts  
✅ **Analytics Tracking** - Track campaign application and usage  

## Setup Instructions

### 1. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Source Portal Integration
SOURCE_API_KEY=kraftverk_secure_api_key_here

# Stripe Configuration (already set)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Website URL
NEXT_PUBLIC_APP_URL=https://kraftverk-test-kund.onrender.com
```

### 2. Register Webhook with Source Portal

Run the registration script:

```bash
node scripts/register-campaign-webhook.js
```

This registers your website to receive campaign webhooks from the Source portal.

### 3. Test the Integration

Run the test script:

```bash
node scripts/test-campaign-webhook.js
```

This tests:
- Webhook ping (health check)
- Campaign creation
- Campaign fetching
- Campaign deletion

### 4. Verify in Browser

1. Start your development server: `npm run dev`
2. Navigate to `/medlemskap`
3. You should see campaign badges on applicable memberships
4. Prices should show strikethrough with discounted price

## API Endpoints

### Webhook Endpoint

**POST `/api/campaigns/webhook`**

Receives campaign updates from Source portal.

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {SOURCE_API_KEY}"
}
```

**Payload:**
```json
{
  "action": "created|updated|deleted|ping",
  "campaign": {
    "id": "campaign_123",
    "name": "Summer Sale",
    "type": "discount",
    "status": "active",
    "discountType": "percentage",
    "discountValue": 20,
    "products": ["base", "flex", "studio-plus"],
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "stripeCouponId": "coupon_abc123",
    "stripePromotionCodeId": "promo_abc123",
    "usageCount": 0,
    "maxUses": 100
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign created",
  "activeCampaigns": 1
}
```

### Get Active Campaigns

**GET `/api/campaigns/webhook`**

Fetches all active campaigns.

**Response:**
```json
{
  "campaigns": [
    {
      "id": "campaign_123",
      "name": "Summer Sale",
      "discountValue": 20,
      "discountType": "percentage",
      ...
    }
  ],
  "count": 1
}
```

## Campaign Service Functions

### `fetchActiveCampaigns()`

Fetches all active campaigns from the webhook endpoint.

```typescript
import { fetchActiveCampaigns } from '@/lib/campaigns';

const campaigns = await fetchActiveCampaigns();
```

### `findApplicableCampaign(productId, campaigns)`

Finds applicable campaign for a specific product.

```typescript
import { findApplicableCampaign } from '@/lib/campaigns';

const campaign = findApplicableCampaign('base', campaigns);
```

### `calculateDiscountedPrice(originalPrice, campaign)`

Calculates discounted price based on campaign.

```typescript
import { calculateDiscountedPrice } from '@/lib/campaigns';

const discountedPrice = calculateDiscountedPrice(399, campaign);
```

### `formatDiscount(campaign)`

Formats discount for display (e.g., "20% rabatt").

```typescript
import { formatDiscount } from '@/lib/campaigns';

const discountText = formatDiscount(campaign);
```

## Component Integration

### PricingCard Component

The `PricingCard` component automatically:
1. Fetches active campaigns on mount
2. Finds applicable campaigns for the membership
3. Displays discounted price with strikethrough
4. Shows campaign badge
5. Passes campaign ID to checkout

### Checkout Flow

1. User clicks "Välj plan" on pricing card
2. PricingCard passes `campaignId` to parent
3. Parent calls `/api/checkout` with `campaignId`
4. Checkout API fetches campaign details
5. Stripe session created with coupon discount
6. User redirected to Stripe checkout

## Campaign Badge Styles

Campaign badges are displayed using the `Badge` component with `variant="accent"`:

```css
.accent {
  background: rgba(34, 211, 238, 0.15);
  color: var(--color-accent);
}
```

Original price shows with strikethrough:

```css
.originalPrice {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-muted);
  text-decoration: line-through;
  margin-right: var(--space-2);
}
```

## Analytics Tracking

Campaign events are automatically tracked:

### Campaign Applied
```typescript
analytics.sendCustomEvent('campaign_applied', {
  campaignId: campaign.id,
  campaignName: campaign.name,
  productType: productType,
});
```

### Campaign Updated
```typescript
analytics.sendCustomEvent('campaign_updated', {
  campaignId: campaign.id,
  campaignName: campaign.name,
  action: 'created|updated|deleted',
});
```

## Testing Campaigns

### Create Test Campaign

Use the Source customer portal to create a campaign with:

- **Products**: `["base", "flex", "studio-plus"]`
- **Discount Type**: `percentage` or `fixed`
- **Discount Value**: `20` (for 20% or 20 kr)
- **Start Date**: Current date
- **End Date**: Future date
- **Stripe Coupon ID**: Your Stripe coupon ID

### Manual Webhook Test

```bash
curl -X POST http://localhost:3000/api/campaigns/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "action": "created",
    "campaign": {
      "id": "test_campaign",
      "name": "Test Sale",
      "type": "discount",
      "status": "active",
      "discountType": "percentage",
      "discountValue": 20,
      "products": ["base"],
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.000Z",
      "stripeCouponId": "YOUR_COUPON_ID",
      "usageCount": 0
    }
  }'
```

## Troubleshooting

### Campaigns Not Showing

1. **Check API key**: Ensure `SOURCE_API_KEY` is set correctly
2. **Check webhook registration**: Run `node scripts/register-campaign-webhook.js`
3. **Check campaign dates**: Ensure campaign is currently active
4. **Check product IDs**: Ensure campaign products match membership IDs

### Webhook Not Receiving Updates

1. **Check URL**: Ensure webhook URL is accessible from internet
2. **Check authentication**: Verify API key matches
3. **Check logs**: Look for webhook errors in console
4. **Test manually**: Use curl to test webhook endpoint

### Stripe Discount Not Applied

1. **Check coupon ID**: Ensure `stripeCouponId` is valid in Stripe
2. **Check coupon status**: Ensure coupon is active in Stripe
3. **Check metadata**: Verify `campaignId` is passed to checkout
4. **Check logs**: Look for Stripe errors in console

## Security Considerations

1. **API Key Protection**: Never commit `SOURCE_API_KEY` to version control
2. **Webhook Verification**: API key is verified for all webhook requests
3. **HTTPS Only**: All webhook communication must use HTTPS in production
4. **Rate Limiting**: Consider implementing rate limiting on webhook endpoint

## Production Deployment

### Environment Variables

Ensure these are set in production:

```bash
SOURCE_API_KEY=kraftverk_production_api_key
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### Webhook Registration

After deployment, re-register webhook with production URL:

```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.com \
SOURCE_API_KEY=kraftverk_production_api_key \
node scripts/register-campaign-webhook.js
```

### Monitoring

Monitor these metrics:
- Webhook success/failure rate
- Campaign application rate
- Checkout conversion with campaigns
- Stripe coupon usage

## Support

For issues or questions:
1. Check console logs for errors
2. Run test scripts to verify integration
3. Review Source portal documentation
4. Contact Source portal support team

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0  
**Integration**: Source Customer Portal → Kraftverk Studio

