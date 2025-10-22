# Campaign Management - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Configure Environment Variables

Add to `.env.local`:

```bash
SOURCE_API_KEY=kraftverk_secure_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Register Webhook

```bash
node scripts/register-campaign-webhook.js
```

### Step 3: Test Integration

```bash
node scripts/test-campaign-webhook.js
```

## ✅ Verify It's Working

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/medlemskap
3. Create a test campaign (see below)
4. Refresh the page - you should see campaign badges!

## 🧪 Create a Test Campaign

```bash
curl -X POST http://localhost:3000/api/campaigns/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "action": "created",
    "campaign": {
      "id": "test_sale",
      "name": "Test Sale",
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

## 🎯 What You'll See

- **Campaign Badge**: "20% rabatt" on pricing cards
- **Discounted Price**: Original price with strikethrough
- **Checkout**: Discount automatically applied in Stripe

## 📚 Need More Details?

- **Full Guide**: `CAMPAIGN_INTEGRATION_GUIDE.md`
- **Implementation Summary**: `CAMPAIGN_IMPLEMENTATION_SUMMARY.md`

## 🆘 Troubleshooting

### Campaigns Not Showing?
1. Check if `SOURCE_API_KEY` is set
2. Verify campaign dates are current
3. Check console for errors

### Webhook Not Working?
1. Test with: `node scripts/test-campaign-webhook.js`
2. Check API key authentication
3. Verify URL is accessible

### Stripe Discount Not Applied?
1. Create a coupon in Stripe Dashboard
2. Use the coupon ID in campaign
3. Check Stripe logs for errors

## 📝 Campaign Data Structure

```json
{
  "id": "campaign_id",           // Unique ID
  "name": "Summer Sale",         // Display name
  "status": "active",            // active | scheduled | expired | paused
  "discountType": "percentage",  // percentage | fixed
  "discountValue": 20,           // 20% or 20 kr
  "products": ["base", "flex"],  // Membership IDs
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "stripeCouponId": "coupon_123" // Stripe coupon ID
}
```

## 🔗 API Endpoints

- **POST** `/api/campaigns/webhook` - Receive campaign updates
- **GET** `/api/campaigns/webhook` - Fetch active campaigns

---

**That's it! You're ready to use campaigns! 🎉**

