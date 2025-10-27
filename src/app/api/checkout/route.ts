import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripePriceId, getProductDisplayName } from "@/lib/stripe-config";
import { analytics } from "@/lib/analytics";
import { getCampaignPriceId } from "@/lib/campaigns";

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });
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
    
    // Check if there's a campaign price for this product
    console.log(`🔍 Looking for campaign price for product: ${productType}`);
    const campaignPriceId = await getCampaignPriceId(productType);
    
    if (campaignPriceId) {
      console.log(`✅ Found campaign price: ${campaignPriceId} for product: ${productType}`);
    } else {
      console.log(`ℹ️ No campaign price found, using default price for: ${productType}`);
    }
    
    const priceId = campaignPriceId || getStripePriceId(productType);
    const productName = getProductDisplayName(productType);
    
    // Log if using campaign price
    if (campaignPriceId) {
      console.log(`🎯 Using campaign price ${campaignPriceId} for product ${productType}`);
    }

    // Track checkout initiation (don't fail if analytics fails)
    try {
      analytics.trackCheckout('initiated');
      if (productId) {
        analytics.trackMembershipAction('product_checkout_initiated', productType);
      } else {
        analytics.trackMembershipAction('checkout_initiated', productType);
      }
    } catch (analyticsError) {
      console.warn("Analytics tracking failed:", analyticsError);
      // Continue with checkout even if analytics fails
    }

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
          
          // Track campaign applied
          analytics.sendCustomEvent('campaign_applied', {
            campaignId: campaign.id,
            campaignName: campaign.name,
            productType: productType,
          });
          
          console.log(`✅ Campaign applied: ${campaign.name}`);
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

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    analytics.trackCheckout('failed');
    return NextResponse.json({ 
      error: "Payment initialization failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}






