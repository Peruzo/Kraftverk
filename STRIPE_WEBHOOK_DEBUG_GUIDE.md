# Stripe Webhook Debugging Guide

## Your Event ID: `evt_1SMwbbP6vvUUervCahaTOkbc`

This guide helps you trace the specific event and understand why Kraftverk isn't receiving campaign price updates.

---

## Method 1: Query Event from Stripe API (Recommended)

Run this script locally to see the full event details:

```bash
node scripts/debug-stripe-event.js evt_1SMwbbP6vvUUervCahaTOkbc
```

This will:
1. Fetch the event from Stripe
2. Show all metadata
3. Tell you which product it should map to
4. Generate the exact webhook payload to send to Kraftverk

---

## Method 2: Set Up Stripe Webhook Endpoint

### Step 1: Configure in Stripe Dashboard

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://kraftverk-test-kund.onrender.com/api/webhooks/stripe`
4. Select events to listen for:
   - `price.created`
   - `price.updated`
   - `coupon.created`
5. Copy the **Signing secret**

### Step 2: Add to Render

Add environment variable in Render:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 3: Test

After redeploy, check Render logs when a price is created. You should see:

```
📦 Stripe Event: price.created (ID: evt_xxxxx)
💰 Price Created: {...}
🎯 This is a CAMPAIGN PRICE!
   Campaign Name: ...
   Original Price ID: ...
   Mapped to Product ID: test-kund
```

---

## Method 3: Manually Resend Event

### Option A: Using Stripe CLI (if you have it)

```bash
stripe events resend evt_1SMwbbP6vvUUervCahaTOkbc
```

### Option B: Using Stripe Dashboard

1. Go to [Stripe Dashboard → Events](https://dashboard.stripe.com/events)
2. Search for `evt_1SMwbbP6vvUUervCahaTOkbc`
3. Click "Resend"
4. Select your webhook endpoint

---

## Expected Flow

### When a campaign is created in Customer Portal:

1. **Customer Portal** creates Stripe prices
2. **Stripe** sends `price.created` webhook to:
   - Your Customer Portal (if configured)
   - Kraftverk's `/api/webhooks/stripe` endpoint (if configured)
3. **Kraftverk** receives event, extracts:
   - `price.id` → The campaign price ID
   - `price.metadata.original_price_id` → Maps to product
   - `price.metadata.campaign_name` → Campaign name
4. **Kraftverk** creates campaign entry in local store
5. **Checkout** uses campaign price instead of regular price

---

## Current Issue Analysis

Based on your logs, two prices were created:
- `price_1SMucMP6vvUUervCSniVZFEV` (5.41 SEK)
- `price_1SMucNP6vvUUervCS0tr7AeI` (174.65 SEK) ✅ This one is for test-kund

The second price has:
```json
{
  "metadata": {
    "original_price_id": "price_1SKx8zP6vvUUervCjfwpzNUJ", // ← This is test-kund
    "campaign_name": "Tester för oktober",
    "source": "customer_portal"
  }
}
```

### Why Kraftverk isn't receiving it:

**The Customer Portal needs to send a webhook to Kraftverk.**

Kraftverk doesn't automatically listen to Stripe webhooks yet. You have three options:

---

## Solution 1: Automated (Recommended)

Configure Customer Portal to automatically send webhooks when Stripe prices are created:

```javascript
// In customer portal - Stripe webhook handler
app.post('/webhooks/stripe', async (req, res) => {
  const event = req.body;
  
  if (event.type === 'price.created') {
    const price = event.data.object;
    
    // Check if this is a campaign price
    if (price.metadata.source === 'customer_portal' && 
        price.metadata.original_price_id) {
      
      // Map to Kraftverk product ID
      const productId = mapPriceIdToProduct(price.metadata.original_price_id);
      
      if (productId) {
        // Send to Kraftverk
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
              originalProductId: productId,
              campaignId: price.metadata.campaign_id || `camp_${Date.now()}`,
              campaignName: price.metadata.campaign_name,
              metadata: price.metadata
            }
          })
        });
        
        console.log('✅ Forwarded to Kraftverk:', price.id, '→', productId);
      }
    }
  }
  
  res.json({ received: true });
});
```

---

## Solution 2: Immediate Test (Manual)

Send this webhook manually for the current campaign:

```bash
curl -X POST https://kraftverk-test-kund.onrender.com/api/campaigns/webhook \
  -H "Authorization: Bearer YOUR_SOURCE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "price.updated",
    "priceUpdate": {
      "stripePriceId": "price_1SMucNP6vvUUervCS0tr7AeI",
      "originalProductId": "test-kund",
      "campaignId": "tester_oktober_2024",
      "campaignName": "Tester för oktober"
    }
  }'
```

Then try purchasing "test-kund" - it should show **174.65 SEK** instead of **499 SEK**.

---

## Debugging Commands

### Check if campaign is stored:

```bash
curl https://kraftverk-test-kund.onrender.com/api/campaigns/webhook
```

Should return:
```json
{
  "campaigns": [{
    "id": "tester_oktober_2024",
    "originalProductId": "test-kund",
    "stripePriceId": "price_1SMucNP6vvUUervCS0tr7AeI"
  }],
  "count": 1
}
```

### Test a purchase:

1. Go to https://kraftverk-test-kund.onrender.com/medlemskap
2. Click "test-kund" product
3. Check Render logs for:
   ```
   🔍 getCampaignPriceForProduct(kraftverk, test-kund)
   ✅ Campaign price found: price_1SMucNP6vvUUervCS0tr7AeI
   🎯 Using campaign price: price_1SMucNP6vvUUervCS0tr7AeI
   ```

---

## Mapping Stripe Prices to Products

Update this mapping in Customer Portal when new products are added:

```javascript
const priceToProductMap = {
  'price_1SKx8zP6vvUUervCjfwpzNUJ': 'test-kund',
  'price_1SKhYSP6vvUUervCTpvpt0QO': 'base',
  'price_1SKwUeP6vvUUervCMqO3Xv7v': 'flex',
  'price_1SL2xzP6vvUUervCtqpdm124': 'studio-plus',
  'price_1SKwweP6vvUUervCxH3vVYhG': 'dagpass',
};
```

---

## Next Steps

1. ✅ Code is deployed with debugging
2. 🔄 Configure Customer Portal to send webhooks automatically
3. ✅ Test with manual webhook first
4. 🔍 Check Render logs for campaign price lookup
5. ✅ Verify checkout shows discounted price

---

## Troubleshooting

### Webhook not received:
- Check Render environment variables
- Verify webhook URL is correct
- Check that `STRIPE_WEBHOOK_SECRET` is set

### Campaign not stored:
- Check authorization header (`SOURCE_API_KEY`)
- Verify payload format matches schema
- Check Render logs for errors

### Checkout not using campaign price:
- Check Render logs for `getCampaignPriceForProduct`
- Verify campaign is in local store
- Check date ranges (startDate/endDate)

---

## Support

If you need help:
1. Run `node scripts/debug-stripe-event.js evt_xxxxx`
2. Check Render logs
3. Verify environment variables
4. Test with manual webhook first

