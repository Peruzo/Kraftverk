import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getProductDisplayName } from "@/lib/stripe-config";
// Note: Checkout route is server-side, so we can't use client-side analytics here
// Analytics tracking for checkout initiation happens client-side before redirect
import { getStripeProductIdForKey } from "@/lib/product-mapping";

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });
}

async function getLatestActivePriceIdForProduct(productKey: string): Promise<string> {
  const stripe = getStripeClient();
  const productId = getStripeProductIdForKey(productKey);
  if (!productId) {
    throw new Error(`No Stripe Product ID configured for product key: ${productKey}`);
  }
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 10 });
  const sorted = prices.data.sort((a, b) => (b.created || 0) - (a.created || 0));
  const latest = sorted[0];
  if (!latest) {
    throw new Error(`No active price found for product key: ${productKey} (Stripe product ${productId})`);
  }
  return latest.id;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      membershipId, 
      classInstanceId, 
      productId, 
      userId, 
      campaignId,
      customerEmail,
      customerName 
    } = body;

    if (!membershipId && !classInstanceId && !productId) {
      return NextResponse.json({ 
        error: "membershipId, classInstanceId, or productId required" 
      }, { status: 400 });
    }

    // Determine product type and get corresponding Stripe price
    const productType = membershipId || classInstanceId || productId || "class-booking";
    
    // Use Tanja's approach: ALWAYS query Stripe for latest active price
    // This automatically handles campaigns (newest active price wins)
    console.log(`🔍 [CHECKOUT] Fetching latest active price for product: ${productType}`);
    let priceId: string;
    
    try {
      priceId = await getLatestActivePriceIdForProduct(productType);
      console.log(`✅ [CHECKOUT] Using latest active Stripe price: ${priceId} for product: ${productType}`);
    } catch (error) {
      console.error(`❌ [CHECKOUT] Failed to get price for product "${productType}":`, error);
      throw error;
    }
    
    const productName = getProductDisplayName(productType);

    // Note: Checkout initiation tracking happens client-side before calling this API
    // This ensures we have proper sessionId, device, and consent data

    // Get origin for redirect URLs
    const requestOrigin = request.headers.get("origin") || 
                         request.headers.get("referer")?.replace(/\/[^/]*$/, '') || 
                         request.url?.replace(/\/api\/.*$/, '');
    
    const origin = requestOrigin || 
                   process.env.NEXT_PUBLIC_APP_URL || 
                   "https://kraftverk-test-kund.onrender.com";
    
    // Determine if this is a subscription (membership) or one-time payment (class booking/products)
    // Note: test-kund uses a one-time price in Stripe, so we use payment mode for now
    const isSubscription = membershipId && 
                           membershipId !== "dagpass" && 
                           membershipId !== "test-kund" && 
                           !productId;
    const mode = isSubscription ? "subscription" : "payment";
    
    console.log("Using origin for redirect URLs:", origin);
    console.log("Checkout request details:", {
      membershipId,
      productId,
      productType,
      priceId,
      mode,
    });

    // Validate email if provided
    if (customerEmail && (!customerEmail.includes('@') || customerEmail.split('@').length !== 2)) {
      console.error("Invalid email format:", customerEmail);
      return NextResponse.json({ 
        error: "Invalid email address format" 
      }, { status: 400 });
    }

    // Fetch campaign discount if campaignId provided
    let campaignDiscount = undefined;
    if (campaignId) {
      try {
        const campaignResponse = await fetch(
          `${origin}/api/campaigns/webhook`,
          { method: 'GET' }
        );
        const { campaigns } = await campaignResponse.json();
        const campaign = campaigns.find((c: any) => c.id === campaignId);
        
        if (campaign && campaign.stripeCouponId) {
          campaignDiscount = [{ coupon: campaign.stripeCouponId }];
          
          // Note: Campaign applied tracking happens client-side when user selects campaign
          // Server-side route cannot use client-side analytics
          console.log(`✅ Campaign applied: ${campaign.name} (${campaign.id})`);
        }
      } catch (error) {
        console.error('Failed to fetch campaign:', error);
        // Continue checkout without campaign discount
      }
    }

    // Create Stripe checkout session
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY is not configured in environment");
      return NextResponse.json({ 
        error: "Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables." 
      }, { status: 500 });
    }

    const stripe = getStripeClient();
    
    console.log(`Membership ID: ${membershipId}, Mode: ${mode}`);
    
    console.log("Creating Stripe checkout session with:", {
      priceId,
      mode,
      hasCampaignDiscount: !!campaignDiscount,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      discounts: campaignDiscount,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        tenant: "kraftverk",
        tenantId: "kraftverk",
        membershipId: membershipId || "",
        classInstanceId: classInstanceId || "",
        productId: productId || "",
        userId: userId || "",
        productType: productType,
        campaignId: campaignId || "",
        customerEmail: customerEmail || "",
        customerName: customerName || "",
      },
      customer_email: (customerEmail && customerEmail.includes('@') && customerEmail.split('@').length === 2) 
                      ? customerEmail 
                      : undefined,
      custom_text: {
        submit: {
          message: `Tack för att du väljer ${productName}!`,
        },
      },
    });

    console.log("✅ Stripe session created successfully:", session.id);
    console.log('💳 [DEBUG] Stripe session created:', {
      id: session.id,
      url: session.url,
      metadata: session.metadata,
      customer_email: session.customer_email,
      mode: session.mode,
      amount_total: session.amount_total,
      currency: session.currency
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Note: Checkout failure tracking happens client-side (can't use client-side analytics here)
    return NextResponse.json({ 
      error: "Payment initialization failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}






