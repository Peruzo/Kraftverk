import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`📦 Webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`✅ Checkout session completed: ${session.id}`);
  
  const tenant = session.metadata?.tenant;
  if (tenant !== "kraftverk") {
    console.log(`⚠️ Skipping webhook - wrong tenant: ${tenant}`);
    return;
  }

  // Extract product information from line items
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  
  for (const item of lineItems.data) {
    const priceId = item.price?.id;
    const quantity = item.quantity || 1;
    
    console.log(`📦 Processing inventory update: ${priceId} x${quantity}`);
    
    // Send inventory update to your inventory system
    await updateInventory(priceId!, quantity, "purchase", session.id);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
  
  // Additional payment success logic if needed
  // This could trigger email confirmations, etc.
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`❌ Payment failed: ${paymentIntent.id}`);
  
  // Handle failed payment logic
  // This could trigger retry mechanisms, notifications, etc.
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`✅ Subscription payment succeeded: ${invoice.id}`);
  
  // Handle recurring subscription payments
  // This ensures inventory tracking for subscription renewals
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`🔄 Subscription cancelled: ${subscription.id}`);
  
  // Handle subscription cancellation
  // This could trigger inventory adjustments or access removal
}

async function updateInventory(priceId: string, quantity: number, action: "purchase" | "refund", sessionId: string) {
  try {
    // Map price IDs to product IDs for inventory tracking
    const productMapping: Record<string, string> = {
      "price_1SL5CPP6vvUUervCs6aA8L23": "gym-shirt",
      "price_1SL5CpP6vvUUervCS0hGh5i4": "gym-hoodie", 
      "price_1SL5D4P6vvUUervCoRbUt0GS": "gym-bottle",
      "price_1SL5DMP6vvUUervCUFG0B0Ei": "keychain",
      "price_1SL5DhP6vvUUervCpwAMofHP": "gym-bag",
      // Membership price IDs (for tracking purposes)
      "price_1SKhYSP6vvUUervCTpvpt0QO": "base-membership",
      "price_1SKwUeP6vvUUervCMqO3Xv7v": "flex-membership",
      "price_1SL2xzP6vvUUervCtqpdm124": "studio-plus-membership",
      "price_1SKwweP6vvUUervCxH3vVYhG": "dagpass",
    };

    const productId = productMapping[priceId];
    if (!productId) {
      console.log(`⚠️ Unknown price ID: ${priceId}`);
      return;
    }

    // Send inventory update to your inventory system
    const inventoryUpdate = {
      tenant: "kraftverk",
      productId,
      priceId,
      quantity: action === "purchase" ? -quantity : quantity, // Negative for purchase, positive for refund
      action,
      sessionId,
      timestamp: new Date().toISOString(),
    };

    console.log(`📊 Inventory update:`, inventoryUpdate);

    // Here you would send the data to your inventory system
    // For now, we'll just log it
    console.log(`✅ Inventory updated: ${productId} ${action} ${quantity} units`);

  } catch (error) {
    console.error("Error updating inventory:", error);
  }
}
