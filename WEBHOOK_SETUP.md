# Stripe Webhook Setup Guide

## Overview

This guide explains how to set up Stripe webhooks for automatic inventory tracking in the Kraftverk website.

## Webhook Endpoint

**URL**: `https://your-domain.com/webhooks/stripe-payments`

## Required Environment Variables

Ensure these are set in your production environment:

```env
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe Dashboard)
```

## Stripe Dashboard Configuration

### 1. Create Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://your-domain.com/webhooks/stripe-payments`
4. Select the following events:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `customer.subscription.deleted`

### 2. Get Webhook Secret

1. After creating the webhook, click on it
2. Copy the "Signing secret" (starts with `whsec_`)
3. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

## How It Works

### Purchase Flow
1. Customer completes purchase → Stripe sends `checkout.session.completed`
2. Webhook receives event with `tenant: "kraftverk"`
3. System matches `price_id` to inventory items
4. **Inventory automatically decreases by purchased quantity**

### Refund Flow
1. Refund is processed → Stripe sends `refund.succeeded`
2. System matches refund to original purchase
3. **Inventory automatically increases by refunded quantity**

## Product Mapping

The webhook maps Stripe price IDs to product IDs:

```javascript
const productMapping = {
  "price_1SL5CPP6vvUUervCs6aA8L23": "gym-shirt",
  "price_1SL5CpP6vvUUervCS0hGh5i4": "gym-hoodie", 
  "price_1SL5D4P6vvUUervCoRbUt0GS": "gym-bottle",
  "price_1SL5DMP6vvUUervCUFG0B0Ei": "keychain",
  "price_1SL5DhP6vvUUervCpwAMofHP": "gym-bag",
  "price_1SKhYSP6vvUUervCTpvpt0QO": "base-membership",
  "price_1SKwUeP6vvUUervCMqO3Xv7v": "flex-membership",
  "price_1SL2xzP6vvUUervCtqpdm124": "studio-plus-membership",
  "price_1SKwweP6vvUUervCxH3vVYhG": "dagpass",
};
```

## Testing

### 1. Test Webhook Endpoint

Visit: `https://your-domain.com/api/webhook-test`

Should return:
```json
{
  "message": "Stripe webhook endpoint is ready",
  "endpoint": "/webhooks/stripe-payments",
  "events": ["checkout.session.completed", "payment_intent.succeeded", ...],
  "tenant": "kraftverk",
  "status": "active"
}
```

### 2. Test Purchase Flow

1. Make a test purchase on kraftverk website
2. Check server logs for webhook processing messages
3. Verify inventory system receives the update

### 3. Test Refund Flow

1. Process a refund in Stripe Dashboard
2. Check that inventory increases by refunded quantity
3. Verify webhook logs show refund processing

## Expected Behavior

- ✅ **One purchase = -1 inventory**
- ✅ **One refund = +1 inventory**
- ✅ **Automatic low stock notifications**
- ✅ **Dashboard updates in real-time**
- ✅ **Works for both simple products and variants**

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check endpoint URL is correct
   - Verify webhook secret is set correctly
   - Check server logs for errors

2. **Inventory not updating**
   - Verify tenant metadata is set to "kraftverk"
   - Check product mapping includes your price IDs
   - Verify inventory system is receiving updates

3. **Signature verification failed**
   - Ensure `STRIPE_WEBHOOK_SECRET` is correct
   - Check that the webhook secret matches Stripe Dashboard

### Debug Logs

The webhook logs all events with prefixes:
- `📦 Webhook received: [event_type]`
- `✅ Checkout session completed: [session_id]`
- `📊 Inventory update: [product_details]`
- `⚠️ Skipping webhook - wrong tenant: [tenant]`

## Security

- Webhook signature verification ensures events are from Stripe
- Tenant filtering prevents processing events from other systems
- All sensitive data is logged securely

## Support

If you encounter issues:
1. Check server logs for webhook processing messages
2. Verify Stripe Dashboard webhook configuration
3. Test with Stripe CLI for local development
4. Contact support with specific error messages
