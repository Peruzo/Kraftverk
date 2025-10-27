# Campaign Integration - Quick Reference

## 🎯 What Customer Portal Needs to Do

Send ONE webhook when creating/updating campaign prices:

```bash
POST https://kraftverk-test-kund.onrender.com/api/campaigns/webhook
Authorization: Bearer YOUR_SOURCE_API_KEY
Content-Type: application/json

{
  "action": "price.updated",
  "priceUpdate": {
    "stripePriceId": "price_YOUR_STRIPE_PRICE_ID",
    "originalProductId": "test-kund",
    "campaignId": "your-campaign-id",
    "campaignName": "Campaign Name"
  }
}
```

That's it! Kraftverk will store it locally and use it during checkout.

---

## 🏗️ How Kraftverk Works

```javascript
// In Kraftverk's checkout (simplified)
async function createCheckout(productId) {
  // Local lookup - no external API calls!
  const campaignPrice = await getCampaignPriceForProduct('kraftverk', productId);
  
  const priceId = campaignPrice?.hasCampaignPrice
    ? campaignPrice.priceId  // 🎯 Campaign price
    : regularPriceId;        // 💰 Regular price
    
  // Create checkout with appropriate price
  return await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'payment'
  });
}
```

---

## ✅ Implementation Status

- ✅ Webhook endpoint ready: `/api/campaigns/webhook`
- ✅ Local campaign storage: `campaigns-store.ts`
- ✅ Campaign price service: `campaign-price-service.ts`
- ✅ Checkout integration: Reads from local store
- ✅ Documentation: `CUSTOMER_PORTAL_WEBHOOK_GUIDE.md`

---

## 📝 Product IDs to Use

When sending `price.updated`, use these `originalProductId` values:

- `"base"` - Base Medlemskap
- `"flex"` - Flex Medlemskap
- `"studio-plus"` - Studio+ Medlemskap
- `"dagpass"` - Dagpass
- `"test-kund"` - Test Kund
- `"gym-shirt"` - Gym Tröja
- `"gym-hoodie"` - Gym Sweatshirt
- `"gym-bottle"` - Gym Vattenflaska
- `"keychain"` - Nyckelring
- `"gym-bag"` - Gymväska

---

## 🧪 Testing

1. Send test webhook:
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

2. Check Response:
```json
{
  "success": true,
  "message": "Price updated",
  "priceId": "price_TEST123",
  "activeCampaigns": 1
}
```

3. Test Checkout:
- Visit https://kraftverk-test-kund.onrender.com/medlemskap
- Click "Test Kund"
- Stripe checkout should show your campaign price

---

## 🔗 Architecture

```
Customer Portal          Kraftverk
──────────────          ──────────
Creates Price          │
       │                │
       │ Webhook        │ Stores locally
       ├───────────────►│ (fast!)
       │                │
       │                │ User checkout
       │                │ Reads local
       │                │ Fast response
       │                ▼
                        Stripe Checkout
```

**No external API calls during checkout!**

---

## 📚 Complete Documentation

- `CUSTOMER_PORTAL_WEBHOOK_GUIDE.md` - Full guide with examples
- `WEBHOOK_ARCHITECTURE.md` - Architecture overview
- `CAMPAIGN_INTEGRATION_SUMMARY.md` - This file

---

## 🚀 Next Steps

1. Customer Portal: Send first webhook with real Stripe Price ID
2. Kraftverk: Receives and stores locally
3. Test: Purchase product and verify campaign price is used
4. Deploy: Both systems ready for production

