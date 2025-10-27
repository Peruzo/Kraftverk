# How to Send the Campaign Webhook

## Current Status
- ✅ Kraftverk is ready to receive webhooks
- ✅ All debugging code is deployed
- ❌ No campaigns are stored (0 campaigns in store)
- 🔄 Need to send the webhook for latest price: `price_1SMwbbP6vvUUervCjaCiPEkT`

---

## Quick Fix: Send the Webhook Now

### Option 1: Using PowerShell (Windows)

```powershell
$env:SOURCE_API_KEY="YOUR_SOURCE_API_KEY"
curl.exe -X POST https://kraftverk-test-kund.onrender.com/api/campaigns/webhook `
  -H "Authorization: Bearer $env:SOURCE_API_KEY" `
  -H "Content-Type: application/json" `
  -d '{\"action\":\"price.updated\",\"priceUpdate\":{\"stripePriceId\":\"price_1SMwbbP6vvUUervCjaCiPEkT\",\"originalProductId\":\"test-kund\",\"campaignId\":\"latest_campaign_2024\",\"campaignName\":\"Latest Campaign\"}}'
```

### Option 2: Using Git Bash or Linux

```bash
export SOURCE_API_KEY="YOUR_SOURCE_API_KEY"
curl -X POST https://kraftverk-test-kund.onrender.com/api/campaigns/webhook \
  -H "Authorization: Bearer $SOURCE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "price.updated",
    "priceUpdate": {
      "stripePriceId": "price_1SMwbbP6vvUUervCjaCiPEkT",
      "originalProductId": "test-kund",
      "campaignId": "latest_campaign_2024",
      "campaignName": "Latest Campaign"
    }
  }'
```

### Option 3: Using Postman or Browser Extension

**URL:** `https://kraftverk-test-kund.onrender.com/api/campaigns/webhook`

**Method:** `POST`

**Headers:**
```
Authorization: Bearer YOUR_SOURCE_API_KEY
Content-Type: application/json
```

**Body:**
```json
{
  "action": "price.updated",
  "priceUpdate": {
    "stripePriceId": "price_1SMwbbP6vvUUervCjaCiPEkT",
    "originalProductId": "test-kund",
    "campaignId": "latest_campaign_2024",
    "campaignName": "Latest Campaign"
  }
}
```

---

## Verify the Webhook Worked

### Step 1: Check Storage

```bash
curl https://kraftverk-test-kund.onrender.com/api/campaigns/webhook
```

Should return:
```json
{
  "campaigns": [
    {
      "id": "latest_campaign_2024",
      "originalProductId": "test-kund",
      "stripePriceId": "price_1SMwbbP6vvUUervCjaCiPEkT"
    }
  ],
  "count": 1,
  "total": 1
}
```

### Step 2: Check Render Logs

Go to Render dashboard → Logs

Look for:
```
📢 Campaign webhook received: price.updated Latest Campaign
✨ Created new campaign entry for price update: Latest Campaign (price_1SMwbbP6vvUUervCjaCiPEkT)
```

### Step 3: Test Checkout

1. Go to https://kraftverk-test-kund.onrender.com/medlemskap
2. Click "Test Kund"
3. Check Render logs for:
```
✅ Campaign price found for test-kund: price_1SMwbbP6vvUUervCjaCiPEkT
🎯 Using campaign price: price_1SMwbbP6vvUUervCjaCiPEkT for product: test-kund
```

---

## Automatic Solution (For Customer Portal Team)

Instead of manually sending webhooks, configure Customer Portal to send them automatically when Stripe prices are created.

### Implementation in Customer Portal

```javascript
// When a campaign is created and Stripe price is generated
async function createCampaign(campaignData) {
  // 1. Create Stripe price (you're already doing this)
  const price = await stripe.prices.create({
    product: campaignData.productId,
    unit_amount: campaignData.discountedPrice,
    currency: 'sek',
    metadata: {
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      original_price_id: campaign.originalPriceId,
      source: 'customer_portal',
      tenant: 'kraftverk'
    }
  });

  // 2. AUTOMATICALLY send to Kraftverk ⬅️ ADD THIS
  await fetch('https://kraftverk-test-kund.onrender.com/api/campaigns/webhook', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SOURCE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'price.updated',
      priceUpdate: {
        stripePriceId: price.id,
        originalProductId: mapPriceIdToProductId(campaignData.originalPriceId),
        campaignId: campaign.id,
        campaignName: campaign.name,
        metadata: price.metadata
      }
    })
  });

  return price;
}

// Helper function to map Stripe Price ID to Kraftverk Product ID
function mapPriceIdToProductId(stripePriceId) {
  const priceToProductMap = {
    'price_1SKx8zP6vvUUervCjfwpzNUJ': 'test-kund',
    'price_1SKhYSP6vvUUervCTpvpt0QO': 'base',
    'price_1SKwUeP6vvUUervCMqO3Xv7v': 'flex',
    'price_1SL2xzP6vvUUervCtqpdm124': 'studio-plus',
    'price_1SKwweP6vvUUervCxH3vVYhG': 'dagpass',
  };
  
  return priceToProductMap[stripePriceId] || null;
}
```

---

## What You Need from Stripe

To get the correct campaign details, go to Stripe Dashboard:

1. Go to https://dashboard.stripe.com/prices
2. Search for `price_1SMwbbP6vvUUervCjaCiPEkT`
3. Check the metadata to get:
   - Campaign name
   - Original price ID (to map to product)
   - Discount amount
4. Update the webhook payload with correct details

---

## Troubleshooting

### Error: "Unauthorized"
- Check that `SOURCE_API_KEY` is set correctly in Render
- Verify the Authorization header format

### Error: "Unknown action"
- Make sure `action` is exactly `"price.updated"` or `"price.created"`

### Campaign still not showing in checkout
- Clear browser cache
- Wait 30 seconds for Render to deploy changes
- Check Render logs for errors

---

## Next Steps

1. ✅ Send the webhook NOW (using one of the options above)
2. 🔄 Test the checkout
3. 🔧 Configure Customer Portal to send webhooks automatically
4. ✅ All future campaigns will work automatically

