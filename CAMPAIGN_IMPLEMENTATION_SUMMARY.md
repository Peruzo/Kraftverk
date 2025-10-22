# Campaign Management Implementation Summary

## ✅ Implementation Complete

The campaign management system has been successfully integrated into Kraftverk Studio. This system enables automatic price updates and discount application based on campaigns created in the Source customer portal.

## 📦 Files Created

### API Routes
- **`src/app/api/campaigns/webhook/route.ts`** - Webhook endpoint for receiving campaign updates
  - POST endpoint: Handles campaign created/updated/deleted/ping actions
  - GET endpoint: Returns all active campaigns
  - API key authentication
  - In-memory campaign storage (can be upgraded to database)

### Libraries
- **`src/lib/campaigns.ts`** - Campaign service with utility functions
  - `fetchActiveCampaigns()` - Fetch campaigns from API
  - `findApplicableCampaign()` - Find campaign for product
  - `calculateDiscountedPrice()` - Calculate discounted price
  - `formatDiscount()` - Format discount for display
  - `isCampaignValid()` - Validate campaign status

### Scripts
- **`scripts/register-campaign-webhook.js`** - Register webhook with Source portal
- **`scripts/test-campaign-webhook.js`** - Test webhook integration

### Documentation
- **`CAMPAIGN_INTEGRATION_GUIDE.md`** - Comprehensive setup and usage guide
- **`.env.example`** - Updated with campaign environment variables

## 🔧 Files Modified

### Components
- **`src/components/membership/PricingCard.tsx`**
  - Added campaign loading on mount
  - Display discounted prices with strikethrough
  - Show campaign badges
  - Pass campaign ID to checkout

- **`src/components/membership/PricingCard.module.css`**
  - Added `.campaignBadge` style
  - Added `.originalPrice` style for strikethrough

- **`src/components/ui/Badge.tsx`**
  - Added "accent" variant support

- **`src/components/ui/Badge.module.css`**
  - Added `.accent` style with turquoise color

### Pages
- **`src/app/medlemskap/page.tsx`**
  - Updated `handleMembershipSelect` to accept `campaignId`
  - Pass `campaignId` to checkout API
  - Updated all PricingCard `onSelect` callbacks

### API
- **`src/app/api/checkout/route.ts`**
  - Accept `campaignId` parameter
  - Fetch campaign details from webhook API
  - Apply Stripe coupon discount if campaign found
  - Track campaign application via analytics
  - Include `campaignId` in session metadata

## 🎯 Key Features

### 1. Webhook Integration
- Receives campaign updates from Source portal
- Supports actions: `created`, `updated`, `deleted`, `ping`
- API key authentication for security
- Real-time campaign synchronization

### 2. Campaign Display
- Automatic campaign badge on applicable memberships
- Original price shown with strikethrough
- Discounted price highlighted in accent color
- Visual indicator: "20% rabatt" or "100 kr rabatt"

### 3. Stripe Integration
- Automatic coupon application at checkout
- Campaign tracking in Stripe metadata
- Support for percentage and fixed discounts
- Graceful fallback if campaign unavailable

### 4. Analytics Integration
- Track campaign application events
- Track campaign updates (created/updated/deleted)
- Integration with existing Kraftverk analytics service
- Sends data to Source customer portal

## 📋 Environment Variables Required

Add these to `.env.local`:

```bash
# Source Portal Integration
SOURCE_API_KEY=kraftverk_secure_api_key_here

# Stripe (already configured)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Website URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Setup Steps

### 1. Configure Environment
```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local and add your API keys
```

### 2. Register Webhook
```bash
node scripts/register-campaign-webhook.js
```

### 3. Test Integration
```bash
node scripts/test-campaign-webhook.js
```

### 4. Verify in Browser
```bash
npm run dev
# Navigate to http://localhost:3000/medlemskap
```

## 🔄 Campaign Flow

```
1. Source Portal → Create Campaign
   ↓
2. Webhook → POST /api/campaigns/webhook
   ↓
3. Campaign stored in memory
   ↓
4. PricingCard → Fetches active campaigns
   ↓
5. Display discounted price + badge
   ↓
6. User clicks "Välj plan"
   ↓
7. Checkout API → Fetch campaign details
   ↓
8. Stripe session → Apply coupon discount
   ↓
9. User completes payment
```

## 🎨 Visual Changes

### Before
```
┌─────────────────┐
│ Base Medlemskap │
│                 │
│ 399 kr/mån      │
│                 │
│ [Välj plan]     │
└─────────────────┘
```

### After (with campaign)
```
┌─────────────────┐
│ 🏷️ 20% rabatt   │
│ Base Medlemskap │
│                 │
│ 399  319 kr/mån │
│  ̶̶̶               │
│ [Välj plan]     │
└─────────────────┘
```

## 🧪 Testing

### Manual Test: Create Campaign
```bash
curl -X POST http://localhost:3000/api/campaigns/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "action": "created",
    "campaign": {
      "id": "summer_sale_2024",
      "name": "Summer Sale",
      "type": "discount",
      "status": "active",
      "discountType": "percentage",
      "discountValue": 20,
      "products": ["base", "flex", "studio-plus"],
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.000Z",
      "stripeCouponId": "YOUR_STRIPE_COUPON_ID",
      "usageCount": 0,
      "maxUses": 100
    }
  }'
```

### Manual Test: Fetch Campaigns
```bash
curl http://localhost:3000/api/campaigns/webhook
```

## 📊 Analytics Events

### Campaign Applied
```typescript
{
  event: 'campaign_applied',
  campaignId: 'summer_sale_2024',
  campaignName: 'Summer Sale',
  productType: 'base'
}
```

### Campaign Updated
```typescript
{
  event: 'campaign_updated',
  campaignId: 'summer_sale_2024',
  campaignName: 'Summer Sale',
  action: 'created'
}
```

## 🔒 Security

✅ **API Key Authentication** - Webhook endpoint requires valid API key  
✅ **HTTPS Only** - Production webhooks must use HTTPS  
✅ **Environment Variables** - Sensitive keys stored in .env.local  
✅ **Input Validation** - Webhook payload validated  
✅ **Error Handling** - Graceful fallback if campaign unavailable  

## 🚧 Future Enhancements

### Database Storage
Replace in-memory campaign storage with database:
```typescript
// prisma/schema.prisma
model Campaign {
  id              String   @id
  name            String
  type            String
  status          String
  discountType    String
  discountValue   Int
  products        String[] // JSON array
  startDate       DateTime
  endDate         DateTime
  stripeCouponId  String?
  usageCount      Int      @default(0)
  maxUses         Int?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Real-time Updates
Add WebSocket or Server-Sent Events for live price updates:
```typescript
// Real-time campaign updates without page refresh
const eventSource = new EventSource('/api/campaigns/stream');
eventSource.onmessage = (event) => {
  const campaign = JSON.parse(event.data);
  updatePricing(campaign);
};
```

### Campaign Scheduling
Add scheduled campaign activation:
```typescript
// Cron job to activate/deactivate campaigns
cron.schedule('0 * * * *', async () => {
  await checkScheduledCampaigns();
});
```

### Usage Tracking
Track individual campaign usage in Stripe:
```typescript
// Increment usage count when campaign is used
await incrementCampaignUsage(campaignId);
```

## 📝 Notes

- Campaigns are stored in memory (restart clears data)
- Campaign dates are validated on fetch
- Max usage limits are checked before application
- Stripe coupon IDs must be created separately in Stripe
- API key must match between Source portal and Kraftverk

## ✨ Success Criteria

✅ Webhook endpoint responds to ping  
✅ Campaigns are created/updated/deleted via webhook  
✅ Active campaigns are fetched and displayed  
✅ Discounted prices shown with strikethrough  
✅ Campaign badges visible on applicable memberships  
✅ Campaign ID passed to checkout  
✅ Stripe coupon applied at checkout  
✅ Analytics events tracked  
✅ No linting errors  
✅ Documentation complete  

## 🎉 Conclusion

The campaign management system is fully integrated and ready for use. Follow the setup steps in the guide to configure your environment and start using campaigns.

For detailed usage instructions, refer to `CAMPAIGN_INTEGRATION_GUIDE.md`.

---

**Implementation Date**: January 15, 2025  
**Version**: 1.0.0  
**Status**: ✅ Complete

