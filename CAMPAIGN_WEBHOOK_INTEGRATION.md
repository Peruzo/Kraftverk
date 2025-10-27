# Campaign Price Integration Guide

## Overview

The Kraftverk Studio website supports dynamic campaign pricing by calling the customer portal API during checkout. When you create a campaign with custom pricing in the customer portal, Kraftverk will automatically fetch and use those prices when customers make purchases.

## Architecture

1. **Customer Portal** creates campaigns and stores prices in Stripe
2. **Kraftverk** calls the customer portal API during checkout
3. **Checkout** uses campaign price if available, otherwise default price

## Customer Portal API Endpoint

**URL:** `https://source.database.onrender.com/api/campaigns/price/:productId?tenant=kraftverk`

**Method:** `GET`

**Authentication:** Optional (if your portal requires it)

### Request

```
GET /api/campaigns/price/test-kund?tenant=kraftverk
```

### Response

```json
{
  "success": true,
  "hasCampaignPrice": true,
  "priceId": "price_1ABC123xyz",
  "campaignId": "camp_123",
  "campaignName": "Summer Promotion 2024"
}
```

**Response when no campaign:**

```json
{
  "success": false,
  "hasCampaignPrice": false
}
```

## Webhook Events

### `price.updated` - Update Campaign Price

Triggered when a new Stripe Price is created for a campaign.

**Payload:**
```json
{
  "action": "price.updated",
  "priceUpdate": {
    "stripePriceId": "price_1ABC123xyz",
    "originalProductId": "test-kund",
    "campaignId": "campaign_abc123",
    "campaignName": "Summer Promotion 2024"
  }
}
```

**Fields:**
- `action` (required): Must be `"price.updated"`
- `priceUpdate` (required): Object containing price information
  - `stripePriceId` (required): The Stripe Price ID created in your Stripe dashboard
  - `originalProductId` (required): The product ID this price applies to (e.g., "test-kund", "base", "flex")
  - `campaignId` (required): Unique campaign identifier
  - `campaignName` (optional): Human-readable campaign name for logging

**Response:**
```json
{
  "success": true,
  "message": "Price updated",
  "priceId": "price_1ABC123xyz",
  "activeCampaigns": 1
}
```

## How It Works on Kraftverk Side

Kraftverk's checkout process:

1. Customer clicks to purchase "test-kund"
2. Kraftverk calls: `GET /api/campaigns/price/test-kund?tenant=kraftverk`
3. If campaign exists: Uses the campaign price ID from customer portal
4. If no campaign: Uses default price ID from configuration
5. Creates Stripe checkout session with the determined price
6. Customer sees the correct price at checkout

## Integration Flow

### 1. Create Product & Price in Stripe

When you create a campaign in the customer portal:

1. Go to your Stripe Dashboard
2. Products → Create Product
3. Set up the product name and price
4. For subscription products: Select "Recurring" and set interval (e.g., "Monthly")
5. For one-time products: Select "One-time"
6. Copy the **Price ID** (starts with `price_`)

### 2. Store Campaign in Your Database

Store the campaign with the Stripe Price ID:

```javascript
const campaign = {
  id: "camp_123",
  name: "Summer Promotion 2024",
  stripePriceId: "price_1ABC123xyz",
  originalProductId: "test-kund",
  startDate: "2024-06-01",
  endDate: "2024-08-31",
  status: "active"
};
```

### 3. Create API Endpoint

Create an API endpoint in your customer portal to return campaign prices:

```javascript
// GET /api/campaigns/price/:productId
app.get('/api/campaigns/price/:productId', async (req, res) => {
  const { productId } = req.params;
  const { tenant } = req.query;
  
  // Find active campaign for this product
  const campaign = await db.campaigns.findOne({
    where: {
      originalProductId: productId,
      tenant: tenant,
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }
  });
  
  if (campaign && campaign.stripePriceId) {
    res.json({
      success: true,
      hasCampaignPrice: true,
      priceId: campaign.stripePriceId,
      campaignId: campaign.id,
      campaignName: campaign.name
    });
  } else {
    res.json({
      success: false,
      hasCampaignPrice: false
    });
  }
});
```

### 4. Test the API

Test that your endpoint returns the correct data:

```bash
curl "https://source.database.onrender.com/api/campaigns/price/test-kund?tenant=kraftverk"
```

Expected response:
```json
{
  "success": true,
  "hasCampaignPrice": true,
  "priceId": "price_1ABC123xyz",
  "campaignId": "camp_123",
  "campaignName": "Summer Promotion 2024"
}
```

## Product ID Mapping

The `originalProductId` must match one of these product IDs in Kraftverk:

- **`base`** - Base Medlemskap
- **`flex`** - Flex Medlemskap  
- **`studio-plus`** - Studio+ Medlemskap
- **`dagpass`** - Dagpass
- **`test-kund`** - Test Kund
- **`gym-shirt`** - Gym Tröja
- **`gym-hoodie`** - Gym Sweatshirt
- **`gym-bottle`** - Gym Vattenflaska
- **`keychain`** - Nyckelring
- **`gym-bag`** - Gymväska

## How It Works

1. **Customer Portal** creates a campaign with a Stripe Price
2. **Webhook** sends `price.updated` to Kraftverk
3. **Kraftverk** stores the campaign with the new price ID
4. **Checkout** automatically uses the campaign price for matching products
5. Customers see the discounted/updated price at checkout

## Updating Campaign Prices

To update an existing campaign price:

1. Create a new Price in Stripe for the same product
2. Send a new `price.updated` webhook with the same `campaignId`
3. The new price will replace the old one

```json
{
  "action": "price.updated",
  "priceUpdate": {
    "stripePriceId": "price_NEW_UPDATED_PRICE",
    "originalProductId": "test-kund",
    "campaignId": "camp_123",
    "campaignName": "Summer Promotion 2024 - Updated"
  }
}
```

## Ending Campaigns

To end a campaign (remove custom pricing):

```json
{
  "action": "deleted",
  "campaign": {
    "id": "camp_123"
  }
}
```

This will restore the default pricing for that product.

## Testing

### 1. Test Webhook

Send a ping to verify the endpoint is working:

```json
{
  "action": "ping"
}
```

Expected response:
```json
{
  "success": true,
  "message": "Pong",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Test Price Update

1. Create a test campaign
2. Send the `price.updated` webhook
3. Try to purchase the product on Kraftverk
4. Check Render logs to confirm the campaign price is used

## Error Handling

### Unauthorized (401)
```
Authorization header missing or invalid
```

### Bad Request (400)
```
Missing required fields in priceUpdate object
```

### Success
Always check the response:
```json
{
  "success": true,
  "message": "Price updated",
  "priceId": "price_1ABC123xyz",
  "activeCampaigns": 1
}
```

## Security

- **API Key Required**: All webhooks require authentication
- **Source Verification**: Only requests from your customer portal will be accepted
- **Environment Variable**: Set `SOURCE_API_KEY` in Render for your customer portal

## Monitoring

Monitor the Render logs to verify:
- Webhook is received successfully
- Campaign is created/updated
- Prices are being used in checkout

Look for these log messages:
- `✨ Created new campaign entry for price update`
- `🎯 Using campaign price price_XXX for product test-kund`
- `✅ Stripe session created successfully`

## Support

If you encounter issues:
1. Check Render logs for error messages
2. Verify the API key is set correctly
3. Ensure the `originalProductId` matches existing product IDs
4. Confirm the Stripe Price ID is valid and exists in your Stripe account

## Example: Complete Integration

```javascript
// Your customer portal code

async function createCampaign() {
  // 1. Create Stripe Price
  const price = await stripe.prices.create({
    product: 'prod_TEST',
    unit_amount: 29900, // 299 SEK in öre
    currency: 'sek',
    recurring: {
      interval: 'month',
    },
  });

  // 2. Store campaign in your database
  const campaign = await db.campaigns.create({
    data: {
      id: `camp_${Date.now()}`,
      name: 'Summer Promotion',
      stripePriceId: price.id,
      originalProductId: 'test-kund',
      tenant: 'kraftverk',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      status: 'active'
    }
  });

  // 3. Campaign is now available via API
  // Kraftverk will automatically fetch it during checkout
  
  return campaign;
}
```

## Testing Campaign Prices

### Test Your API Endpoint

```bash
# Test with a product that has a campaign
curl "https://source.database.onrender.com/api/campaigns/price/test-kund?tenant=kraftverk"

# Expected: Campaign price returned
{
  "success": true,
  "hasCampaignPrice": true,
  "priceId": "price_1ABC123xyz",
  "campaignId": "camp_123",
  "campaignName": "Summer Promotion"
}

# Test with a product without a campaign
curl "https://source.database.onrender.com/api/campaigns/price/base?tenant=kraftverk"

# Expected: No campaign
{
  "success": false,
  "hasCampaignPrice": false
}
```

### Test Checkout on Kraftverk

1. Go to https://kraftverk-test-kund.onrender.com/medlemskap
2. Click "Test Kund"
3. Check Render logs for:
   ```
   🔍 Looking for campaign price for product: test-kund
   🎯 Campaign price found for test-kund: price_CAMPAIGN_123
   ✅ Found campaign price: price_CAMPAIGN_123 for product: test-kund
   🎯 Using campaign price price_CAMPAIGN_123 for product test-kund
   ```

---

**Last Updated:** January 2024  
**Version:** 2.0 (Updated for API-based architecture)

