import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { upsertActivePrice, writeHistory, markProcessed } from "@/lib/campaigns-repo";
import { getProductKeyFromStripeProductId } from "@/lib/product-mapping";

/**
 * Stripe Webhook Handler
 * Receives webhooks directly from Stripe
 * For debugging: evt_1SMwbbP6vvUUervCahaTOkbc
 */

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Stripe webhook received');
    
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-09-30.clover",
    });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature || "", webhookSecret);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`📦 Stripe Event: ${event.type} (ID: ${event.id})`);

    // Log the full event for debugging
    console.log('📋 Full event data:', JSON.stringify(event.data.object, null, 2));

    // Handle specific events
    switch (event.type) {
      case 'price.created':
        const price = event.data.object as Stripe.Price;
        console.log('💰 Price Created:', {
          id: price.id,
          nickname: price.nickname,
          metadata: price.metadata,
          product: price.product,
          unit_amount: price.unit_amount,
          currency: price.currency,
        });
        
        // If created from customer portal, auto-upsert as active campaign price
        if (price.metadata?.source === 'customer_portal') {
          console.log('🧭 [STRIPE->KV] Campaign price from customer_portal detected', {
            eventId: event.id,
            stripePriceId: price.id,
            original_price_id: price.metadata.original_price_id,
            tenant: (price.metadata as any)?.tenant,
          });
          let originProductId: string | null = null;
          try {
            if (price.metadata.original_price_id) {
              const original = await stripe.prices.retrieve(price.metadata.original_price_id);
              originProductId = (original.product as string) || null;
              console.log('🔗 Resolved original price → product', {
                originalPriceId: price.metadata.original_price_id,
                originProductId,
              });
            } else if (price.product) {
              originProductId = price.product as string;
              console.log('🔗 Using price.product as origin', { originProductId });
            }
          } catch (e) {
            console.error('❌ Failed to resolve original/product for campaign price', e);
          }

          const productKey = originProductId ? getProductKeyFromStripeProductId(originProductId) : null;
          console.log('🗺️ Product mapping result', { originProductId, productKey });

          if (productKey) {
            const tenantId = (price.metadata as any)?.tenant || 'kraftverk';
            const campaignId = (price.metadata as any)?.campaign_id || undefined;
            try {
              await upsertActivePrice({
                tenantId,
                productId: productKey,
                campaignId,
                stripePriceId: price.id,
                metadata: price.metadata,
              });
              await writeHistory({
                tenantId,
                productId: productKey,
                campaignId,
                stripePriceId: price.id,
                status: 'active',
                eventType: 'price.created',
                eventId: event.id,
                payload: { source: 'stripe.price.created' },
              });
              await markProcessed(event.id, 'price.created', tenantId);
              console.log('✅ Upserted active campaign price', {
                tenantId, productKey, campaignId, stripePriceId: price.id,
              });
            } catch (e) {
              console.error('❌ Failed to upsert active price from Stripe event', e);
            }
          } else {
            console.log('❌ No productKey from mapping. Ensure STRIPE_PRODUCT_MAP/STRIPE_PRODUCT_* env is set correctly.', {
              originProductId,
              envPresent: Boolean(process.env.STRIPE_PRODUCT_MAP),
            });
          }
        }
        break;

      case 'price.updated':
        console.log('💰 Price Updated:', event.data.object);
        break;

      case 'coupon.created':
        const coupon = event.data.object as Stripe.Coupon;
        console.log('🎫 Coupon Created:', {
          id: coupon.id,
          name: coupon.name,
          percent_off: coupon.percent_off,
          metadata: coupon.metadata,
        });
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, eventType: event.type });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ 
      error: "Webhook processing failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
// Removed hardcoded price -> product mapping; using env-based product mapping
