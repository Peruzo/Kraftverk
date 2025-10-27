import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

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
        
        // Check if this is a campaign price
        if (price.metadata.original_price_id && price.metadata.source === 'customer_portal') {
          console.log('🎯 This is a CAMPAIGN PRICE!');
          console.log('   Campaign Name:', price.metadata.campaign_name);
          console.log('   Original Price ID:', price.metadata.original_price_id);
          console.log('   Tenant:', price.metadata.tenant);
          
          // Try to match to Kraftverk product
          const productId = mapPriceIdToProductId(price.metadata.original_price_id);
          console.log('   Mapped to Product ID:', productId);
          
          if (productId) {
            console.log(`✅ Should send to Kraftverk campaigns webhook for product: ${productId}`);
          } else {
            console.log('❌ Could not map original_price_id to product ID');
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

/**
 * Map Stripe Price ID to Kraftverk Product ID
 */
function mapPriceIdToProductId(stripePriceId: string): string | null {
  // This should match the prices in src/lib/stripe-config.ts
  const priceToProductMap: Record<string, string> = {
    'price_1SKx8zP6vvUUervCjfwpzNUJ': 'test-kund',
    'price_1SKhYSP6vvUUervCTpvpt0QO': 'base',
    'price_1SKwUeP6vvUUervCMqO3Xv7v': 'flex',
    'price_1SL2xzP6vvUUervCtqpdm124': 'studio-plus',
    'price_1SKwweP6vvUUervCxH3vVYhG': 'dagpass',
  };
  
  return priceToProductMap[stripePriceId] || null;
}

