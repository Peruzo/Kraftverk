import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripePriceId, getProductDisplayName } from "@/lib/stripe-config";

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
    const { membershipId, classInstanceId, userId } = body;

    if (!membershipId && !classInstanceId) {
      return NextResponse.json({ 
        error: "membershipId or classInstanceId required" 
      }, { status: 400 });
    }

    // Determine product type and get corresponding Stripe price
    const productType = membershipId || "class-booking";
    const priceId = getStripePriceId(productType);
    const productName = getProductDisplayName(productType);

    // Get origin for redirect URLs
    const origin = request.headers.get("origin") || 
                   (process.env.NODE_ENV === "development" 
                     ? "http://localhost:3000" 
                     : process.env.NEXT_PUBLIC_APP_URL);

    // Create Stripe checkout session
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        membershipId: membershipId || "",
        classInstanceId: classInstanceId || "",
        userId: userId || "",
        productType: productType,
      },
      customer_email: userId ? `${userId}@example.com` : undefined,
      custom_text: {
        submit: {
          message: `Tack för att du väljer ${productName}!`,
        },
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ 
      error: "Payment initialization failed" 
    }, { status: 500 });
  }
}






