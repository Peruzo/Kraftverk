import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripePriceId, getProductDisplayName } from "@/lib/stripe-config";
import { analytics } from "@/lib/analytics";

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
    const priceId = getStripePriceId(productType);
    const productName = getProductDisplayName(productType);

    // Track checkout initiation
    analytics.trackCheckout('initiated');
    
    // Track action for customer portal
    if (productId) {
      analytics.trackMembershipAction('product_checkout_initiated', productType);
    } else {
      analytics.trackMembershipAction('checkout_initiated', productType);
    }

    // Get origin for redirect URLs
    const origin = request.headers.get("origin") || 
                   (process.env.NODE_ENV === "development" 
                     ? "http://localhost:3000" 
                     : process.env.NEXT_PUBLIC_APP_URL);

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
    const stripe = getStripeClient();
    
    // Determine if this is a subscription (membership) or one-time payment (class booking/products)
    const isSubscription = membershipId && membershipId !== "dagpass" && !productId;
    const mode = isSubscription ? "subscription" : "payment";
    
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
      customer_email: customerEmail || undefined,
      custom_text: {
        submit: {
          message: `Tack för att du väljer ${productName}!`,
        },
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    analytics.trackCheckout('failed');
    return NextResponse.json({ 
      error: "Payment initialization failed" 
    }, { status: 500 });
  }
}






