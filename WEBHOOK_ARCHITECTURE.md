# Campaign Pricing Architecture - Final Design

## Overview

Kraftverk uses a **webhook-based architecture** where the customer portal sends campaign price updates to Kraftverk, which stores them locally. This ensures Kraftverk operates independently and reliably.

---

## Architecture Diagram

```
┌─────────────────┐         ┌──────────────┐
│ Customer Portal │         │   Stripe     │
│  (Manages)      │◄────────┤  (Source)    │
└────────┬────────┘         └──────────────┘
         │
         │ POST /api/campaigns/webhook
         │ action: "price.updated"
         ↓
┌─────────────────┐
│   Kraftverk     │
│  (Receives &    │
│   Stores)       │
│                 │
│  campaigns: []  │ ← Stored in memory
│                 │    (or database)
└────────┬────────┘
         │
         │ User clicks checkout
         ↓
┌─────────────────┐
│  Checkout       │
│  (Reads local   │
│   campaigns)    │
│                 │
│  Uses campaign  │ → Stripe checkout
│  price if found │   with correct price
└─────────────────┘
```

---

## How It Works

### 1. Campaign Creation Flow

```
Customer Portal                Kraftverk
─────────────────              ──────────
1. Create Stripe Price          │
2. Store in database            │
3. Send webhook ───────────────►│
                                 │ Store campaign
                                 │ ✅ Ready
```

### 2. Checkout Flow

```
User                 Kraftverk
─────────────────   ──────────
Clicks checkout     │
                    │ Read from local store
                    │ Fast lookup
                    │
                    ▼ Use campaign price
                    │ or default price
                    │
Stripe checkout ◄───┤
```

---

## Key Files

### For Kraftverk (This Repository)

1. **`src/lib/campaigns-store.ts`**
   - Stores campaigns in memory
   - In production: use database/Redis

2. **`src/app/api/campaigns/webhook/route.ts`**
   - Receives webhooks from customer portal
   - Handles: `ping`, `created`, `deleted`, `price.updated`

3. **`src/app/api/checkout/route.ts`**
   - Uses `getCampaignPriceId()` from campaigns store
   - Falls back to default price if no campaign

4. **`src/lib/campaigns.ts`**
   - `getCampaignPriceId()` - reads from local store
   - `findApplicableCampaign()` - matches products

---

## Webhook Integration for Customer Portal

### Required: Send Webhook on Price Update

```javascript
// When Stripe price is created for a campaign
const webhookPayload = {
  action: "price.updated",
  priceUpdate: {
    stripePriceId: "price_CREATED_IN_STRIPE",
    originalProductId: "test-kund",
    campaignId: "your-campaign-id",
    campaignName: "Campaign Name"
  }
};

await fetch('https://kraftverk-test-kund.onrender.com/api/campaigns/webhook', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SOURCE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(webhookPayload)
});
```

### See Complete Guide

For detailed integration instructions, see:
- **`CUSTOMER_PORTAL_WEBHOOK_GUIDE.md`** - Complete guide for customer portal team

---

## Benefits

### ✅ Independence
- Kraftverk works without calling customer portal API
- No dependency during checkout
- Fast response times

### ✅ Reliability
- Campaigns stored locally
- Falls back to default prices
- No single point of failure

### ✅ Scalability
- Services scale independently
- No tight coupling
- Easy to maintain

---

## Testing

### 1. Send Test Webhook

```bash
curl -X POST https://kraftverk-test-kund.onrender.com/api/campaigns/webhook \
  -H "Authorization: Bearer YOUR_SOURCE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "price.updated",
    "priceUpdate": {
      "stripePriceId": "price_TEST123",
      "originalProductId": "test-kund",
      "campaignId": "test_campaign",
      "campaignName": "Test Campaign"
    }
  }'
```

### 2. Check Logs

Look for:
```
✨ Created new campaign entry for price update
```

### 3. Test Checkout

1. Go to /medlemskap
2. Click "Test Kund"
3. Check logs for:
```
🎯 Using campaign price price_TEST123 for product test-kund
```

---

## Environment Variables Required

### Kraftverk (Render)
```
SOURCE_API_KEY=your_api_key  # For webhook authentication
STRIPE_SECRET_KEY=sk_...     # Stripe secret key
```

### Customer Portal
Should listen to Stripe webhooks and send to Kraftverk when campaigns change.

---

## Data Flow Summary

1. **Customer Portal** creates campaign + Stripe Price
2. **Customer Portal** sends webhook to Kraftverk
3. **Kraftverk** receives and stores locally
4. **User** starts checkout on Kraftverk
5. **Kraftverk** reads from local store (fast!)
6. **Checkout** uses campaign price or default
7. **Stripe** processes payment with correct price

---

## Production Considerations

### Current: In-Memory Storage
- Campaigns stored in `activeCampaigns` array
- Lost on server restart
- Sufficient for MVP/testing

### Production: Database Storage
Replace in-memory with database:

```typescript
// In campaigns-store.ts
import { prisma } from '@/lib/prisma';

export async function addOrUpdateCampaign(campaign: Campaign) {
  await prisma.campaign.upsert({
    where: { id: campaign.id },
    update: campaign,
    create: campaign
  });
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
  return await prisma.campaign.findMany({
    where: {
      status: 'active',
      endDate: { gte: new Date() }
    }
  });
}
```

---

**Status:** ✅ Implemented and ready for testing

**Next Steps:**
1. Customer portal sends first `price.updated` webhook
2. Verify in Render logs
3. Test checkout with campaign price
4. Deploy to production

