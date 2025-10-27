# Customer Portal → Kraftverk Webhook Integration

## Architecture Overview

Kraftverk uses a **webhook-based architecture** to ensure reliable, independent operation. When you create or update campaigns in your customer portal, you send webhooks to Kraftverk so it can store campaign prices locally and use them during checkout.

```
┌─────────────────┐
│ Customer Portal │ ← Manages campaigns
└────────┬────────┘
         │
         │ Webhooks
         │
         ▼
┌─────────────────┐
│  Kraftverk      │ ← Stores campaigns locally
│                 │    Independent & Fast
└─────────────────┘
```

**Why webhooks?**
- ✅ Kraftverk works independently (no dependency on customer portal being up)
- ✅ Fast checkout (local lookup, no API calls)
- ✅ Reliable (Stripe is source of truth)
- ✅ Scalable (each service operates independently)

---

## Webhook Endpoint

**URL:** `https://kraftverk-test-kund.onrender.com/api/campaigns/webhook`

**Method:** `POST`

**Authentication:** Required

```
Authorization: Bearer YOUR_SOURCE_API_KEY
```

**Set in Render:** `SOURCE_API_KEY` environment variable

---

## Required Webhook Events

### 1. `price.updated` - New Campaign Price

**When to send:**
- Creating a new campaign with custom pricing
- Updating an existing campaign's price
- Creating a Stripe Price for a product

**Payload:**
```json
{
  "action": "price.updated",
  "priceUpdate": {
    "stripePriceId": "price_1ABC123xyz",
    "originalProductId": "test-kund",
    "campaignId": "camp_summer_2024",
    "campaignName": "Summer Promotion 2024"
  }
}
```

**Fields Required:**
- `action`: `"price.updated"` (required)
- `priceUpdate` (required):
  - `stripePriceId` (required): The Stripe Price ID you created
  - `originalProductId` (required): Product ID in Kraftverk (see mapping below)
  - `campaignId` (required): Unique campaign identifier
  - `campaignName` (optional): Human-readable name

**Success Response:**
```json
{
  "success": true,
  "message": "Price updated",
  "priceId": "price_1ABC123xyz",
  "activeCampaigns": 1
}
```

### 2. `created` - New Campaign

**When to send:**
- Creating a campaign in your dashboard

**Payload:**
```json
{
  "action": "created",
  "campaign": {
    "id": "camp_summer_2024",
    "name": "Summer Promotion 2024",
    "type": "discount",
    "status": "active",
    "discountType": "percentage",
    "discountValue": 20,
    "products": ["test-kund", "base"],
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-08-31T23:59:59Z",
    "stripePriceId": "price_1ABC123xyz",
    "originalProductId": "test-kund",
    "usageCount": 0
  }
}
```

### 3. `deleted` - End Campaign

**When to send:**
- Ending or deleting a campaign

**Payload:**
```json
{
  "action": "deleted",
  "campaign": {
    "id": "camp_summer_2024"
  }
}
```

### 4. `ping` - Health Check

**When to use:**
- Testing the webhook connection
- Verifying `SOURCE_API_KEY` is configured

**Payload:**
```json
{
  "action": "ping"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pong",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Product ID Mapping

Use these exact product IDs when sending webhooks to Kraftverk:

### Memberships
- `"base"` - Base Medlemskap (399 SEK/month)
- `"flex"` - Flex Medlemskap (599 SEK/month)
- `"studio-plus"` - Studio+ Medlemskap (899 SEK/month)
- `"dagpass"` - Dagpass (149 SEK one-time)
- `"test-kund"` - Test Kund (499 SEK/month)

### Physical Products
- `"gym-shirt"` - Gym Tröja
- `"gym-hoodie"` - Gym Sweatshirt
- `"gym-bottle"` - Gym Vattenflaska
- `"keychain"` - Nyckelring
- `"gym-bag"` - Gymväska

---

## Integration Flow

### Creating a Campaign

```javascript
async function createCampaign() {
  // 1. Create Stripe Price in your Stripe account
  const price = await stripe.prices.create({
    product: 'prod_TEST',
    unit_amount: 29900, // 299 SEK (convert to öre)
    currency: 'sek',
    recurring: { interval: 'month' }, // or leave out for one-time
  });

  // 2. Store in your database
  const campaign = await db.campaigns.create({
    data: {
      id: `camp_${Date.now()}`,
      name: 'Summer Promotion 2024',
      stripePriceId: price.id,
      originalProductId: 'test-kund',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'active'
    }
  });

  // 3. Send webhook to Kraftverk
  const response = await fetch('https://kraftverk-test-kund.onrender.com/api/campaigns/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SOURCE_API_KEY}`
    },
    body: JSON.stringify({
      action: 'price.updated',
      priceUpdate: {
        stripePriceId: price.id,
        originalProductId: 'test-kund',
        campaignId: campaign.id,
        campaignName: campaign.name
      }
    })
  });

  const result = await response.json();
  console.log('Webhook sent:', result);
  
  return campaign;
}
```

### Updating a Campaign Price

When the campaign's Stripe price changes:

```javascript
async function updateCampaignPrice(campaignId, newPriceId) {
  // Send webhook with updated price
  await fetch('https://kraftverk-test-kund.onrender.com/api/campaigns/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SOURCE_API_KEY}`
    },
    body: JSON.stringify({
      action: 'price.updated',
      priceUpdate: {
        stripePriceId: newPriceId,
        originalProductId: 'test-kund',
        campaignId: campaignId,
        campaignName: 'Updated Campaign Name'
      }
    })
  });
}
```

### Ending a Campaign

```javascript
async function endCampaign(campaignId) {
  await fetch('https://kraftverk-test-kund.onrender.com/api/campaigns/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SOURCE_API_KEY}`
    },
    body: JSON.stringify({
      action: 'deleted',
      campaign: { id: campaignId }
    })
  });
}
```

---

## Testing

### 1. Test Connection

```bash
curl -X POST https://kraftverk-test-kund.onrender.com/api/campaigns/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SOURCE_API_KEY" \
  -d '{"action": "ping"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Pong",
  "timestamp": "2024-..."
}
```

### 2. Test Price Update

```bash
curl -X POST https://kraftverk-test-kund.onrender.com/api/campaigns/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SOURCE_API_KEY" \
  -d '{
    "action": "price.updated",
    "priceUpdate": {
      "stripePriceId": "price_YOUR_NEW_PRICE_ID",
      "originalProductId": "test-kund",
      "campaignId": "test_campaign_123",
      "campaignName": "Test Campaign"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Price updated",
  "priceId": "price_YOUR_NEW_PRICE_ID",
  "activeCampaigns": 1
}
```

### 3. Verify on Kraftverk

1. Send the webhook
2. Visit https://kraftverk-test-kund.onrender.com/medlemskap
3. Click "Test Kund"
4. The Stripe checkout should show your campaign price

---

## Error Handling

### 401 Unauthorized
```
Authorization header missing or API key invalid
```
**Solution:** Check `SOURCE_API_KEY` is set in Render

### 400 Bad Request
```
Missing required fields in priceUpdate
```
**Solution:** Ensure all required fields are present

### 200 Success
```json
{
  "success": true,
  "message": "Price updated",
  "priceId": "...",
  "activeCampaigns": 1
}
```

---

## Monitoring

### Check Render Logs

1. Go to https://render.com/dashboard
2. Select Kraftverk service
3. View Logs
4. Look for:
   ```
   ✨ Created new campaign entry for price update
   📊 Checking X campaigns for product: test-kund
   🎯 Using campaign price price_XXX for product test-kund
   ```

### Success Indicators

- ✅ Webhook returns `200 OK`
- ✅ `activeCampaigns` > 0 in response
- ✅ Logs show campaign created
- ✅ Kraftverk checkout shows campaign price

---

## Best Practices

### 1. Always Send Webhooks Immediately
```javascript
// After creating Stripe Price
const price = await stripe.prices.create({...});
await sendWebhook('price.updated', {...});

// After updating campaign
await db.campaigns.update({...});
await sendWebhook('price.updated', {...});
```

### 2. Include campaignName
Helps with debugging and logging:
```json
{
  "campaignName": "Summer 2024 - 20% Off"
}
```

### 3. Use Correct Product IDs
Refer to the Product ID Mapping section above

### 4. Handle Webhook Failures
```javascript
try {
  const response = await fetch(...);
  if (!response.ok) {
    // Retry or log error
    console.error('Webhook failed:', response.status);
  }
} catch (error) {
  // Handle network errors
  console.error('Webhook error:', error);
}
```

---

## Why This Architecture?

### Independence
- Kraftverk stores campaigns locally after receiving webhooks
- Checkout doesn't depend on customer portal being online
- Fast response times (no external API calls)

### Reliability
- Campaigns persist in Kraftverk's storage
- If customer portal is down, Kraftverk still works
- If Kraftverk is down temporarily, webhook retries

### Scalability
- Each service operates independently
- No tight coupling between services
- Can scale Kraftverk and customer portal separately

### Data Flow

```
1. Customer Portal creates campaign in Stripe
         ↓
2. Customer Portal sends webhook to Kraftverk
         ↓
3. Kraftverk stores campaign locally
         ↓
4. Customer purchases product
         ↓
5. Kraftverk uses stored campaign price (no API call needed)
         ↓
6. Stripe checkout with campaign price
```

---

## Summary

**What you need to do:**
1. Send `price.updated` webhook when creating/updating campaigns
2. Send `deleted` webhook when ending campaigns
3. Use correct `originalProductId` values
4. Include `SOURCE_API_KEY` in authorization header

**What Kraftverk does:**
1. Receives webhooks and stores campaigns locally
2. Uses stored campaigns during checkout
3. Falls back to default prices if no campaign
4. Operates independently (doesn't call your API)

**Benefits:**
- Fast, reliable checkout
- Independent service operation
- Easy to scale
- Real-time campaign updates via webhooks

---

**Questions or Issues?**
- Check Render logs for webhook delivery
- Test with `ping` action first
- Verify `SOURCE_API_KEY` is configured
- Ensure product IDs match exactly

