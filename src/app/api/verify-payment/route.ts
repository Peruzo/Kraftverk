import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Extract customer and payment data
    const customerEmail = session.customer_email;
    const customerName = session.metadata?.customerName || '';
    const productType = session.metadata?.productType || '';
    const amount = session.amount_total; // Amount in cents
    const currency = session.currency;
    const paymentIntent = session.payment_intent;
    
    // Get payment method details
    let cardBrand = '';
    let cardLast4 = '';
    let cardExpMonth = '';
    let cardExpYear = '';
    
    if (paymentIntent) {
      try {
        const paymentIntentDetails = await stripe.paymentIntents.retrieve(paymentIntent as string);
        const paymentMethod = paymentIntentDetails.payment_method;
        if (paymentMethod && typeof paymentMethod === 'string') {
          const pm = await stripe.paymentMethods.retrieve(paymentMethod);
          if (pm.card) {
            cardBrand = pm.card.brand || '';
            cardLast4 = pm.card.last4 || '';
            cardExpMonth = pm.card.exp_month?.toString() || '';
            cardExpYear = pm.card.exp_year?.toString() || '';
          }
        }
      } catch (error) {
        console.error('Error fetching payment method details:', error);
      }
    }
    
    // Map product type to display name
    const productNames: Record<string, string> = {
      'gym-shirt': 'Kraftverk Gym Shirt',
      'gym-hoodie': 'Kraftverk Gym Hoodie',
      'gym-bottle': 'Kraftverk Gym Bottle',
      'keychain': 'Kraftverk Keychain',
      'gym-bag': 'Kraftverk Gym Bag',
      'base': 'Base Medlemskap',
      'flex': 'Flex Medlemskap',
      'studio-plus': 'Studio+ Medlemskap',
      'dagpass': 'Dagpass',
    };
    
    const productName = productNames[productType] || productType;
    
    // Return payment data
    return NextResponse.json({
      success: true,
      sessionId,
      amount,
      currency,
      customerEmail,
      customerName,
      cardBrand,
      cardLast4,
      cardExpMonth,
      cardExpYear,
      productType,
      productName,
      priceId: session.metadata?.priceId || '',
      productId: productType,
      quantity: 1,
      inventoryAction: 'purchase',
      userId: session.metadata?.userId || '',
      paymentMethod: 'card',
      customerId: session.customer || '',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json({ 
      error: "Payment verification failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
