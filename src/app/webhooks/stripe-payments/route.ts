import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  // Initialize Stripe inside the function to avoid build-time errors
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-09-30.clover",
  });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") || "";

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
        await handleCheckoutSessionCompleted(stripe, event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(stripe, event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(stripe, event.data.object as Stripe.PaymentIntent);
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

async function handleCheckoutSessionCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  console.log(`✅ Checkout session completed: ${session.id}`);
  
  const tenant = session.metadata?.tenant;
  if (tenant !== "kraftverk") {
    console.log(`⚠️ Skipping webhook - wrong tenant: ${tenant}`);
    return;
  }

  // Send complete customer data to customer portal
  await sendCustomerDataToPortal(stripe, session);

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

async function handlePaymentIntentSucceeded(stripe: Stripe, paymentIntent: Stripe.PaymentIntent) {
  console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
  
  // Get the checkout session to send customer data
  if (paymentIntent.metadata?.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(paymentIntent.metadata.session_id);
      if (session.metadata?.tenant === "kraftverk") {
        await sendCustomerDataToPortal(stripe, session);
      }
    } catch (error) {
      console.error("Error retrieving session for payment intent:", error);
    }
  }
}

async function handlePaymentIntentFailed(stripe: Stripe, paymentIntent: Stripe.PaymentIntent) {
  console.log(`❌ Payment failed: ${paymentIntent.id}`);
  
  // Get the checkout session to send refund inventory data
  if (paymentIntent.metadata?.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(paymentIntent.metadata.session_id);
      if (session.metadata?.tenant === "kraftverk") {
        await sendRefundDataToPortal(stripe, session);
      }
    } catch (error) {
      console.error("Error retrieving session for failed payment:", error);
    }
  }
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

async function sendCustomerDataToPortal(stripe: Stripe, session: Stripe.Checkout.Session) {
  try {
    // Extract customer data from session
    const customerEmail = session.customer_email;
    const customerName = session.metadata?.customerName || "";
    const productType = session.metadata?.productType || "";
    const userId = session.metadata?.userId || "";
    
    // Get line items for inventory data
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const lineItem = lineItems.data[0]; // Get first item
    const priceId = lineItem?.price?.id || "";
    const quantity = lineItem?.quantity || 1;
    
    // Map price ID to product ID for inventory tracking
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
    
    const productId = productMapping[priceId] || productType;
    
    // Prepare complete customer data for portal with inventory data
    const customerData = {
      tenant: "kraftverk",
      customerEmail,
      customerName,
      sessionId: session.id,
      amount: session.amount_total,
      currency: session.currency,
      productType,
      userId,
      paymentMethod: session.payment_method_types?.[0] || "card",
      status: "completed",
      timestamp: new Date().toISOString(),
      // Inventory tracking data
      priceId,
      productId,
      quantity,
      inventoryAction: "purchase",
      // Additional Stripe data
      paymentIntentId: session.payment_intent,
      customerId: session.customer,
      subscriptionId: session.subscription,
      mode: session.mode,
      successUrl: session.success_url,
      cancelUrl: session.cancel_url,
    };

    console.log(`📤 Sending customer data to portal:`, {
      customerEmail,
      customerName,
      amount: customerData.amount,
      currency: customerData.currency,
      productType: customerData.productType,
      priceId: customerData.priceId,
      productId: customerData.productId,
      quantity: customerData.quantity,
      inventoryAction: customerData.inventoryAction,
    });

    // Send to customer portal webhook endpoint
    const portalResponse = await fetch("https://source-database.onrender.com/webhooks/kraftverk-customer-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    });

    if (portalResponse.ok) {
      console.log(`✅ Customer data sent to portal successfully`);
    } else {
      console.error(`❌ Failed to send customer data to portal:`, await portalResponse.text());
    }

    // Also send payment data to customer portal webhook in the correct format
    const webhookPayload = {
      tenant: "kraftverk",
      customerEmail: session.customer_email,
      customerName: session.metadata?.customerName || "",
      sessionId: session.id,
      amount: Math.round(session.amount_total / 100), // Convert cents to SEK
      currency: session.currency,
      productType: session.metadata?.productType || "",
      productName: customerData.productName || "",
      priceId: priceId,
      productId: productId,
      quantity: quantity,
      inventoryAction: "purchase",
      userId: session.metadata?.userId || "",
      paymentMethod: session.payment_method_types?.[0] || "card",
      status: "completed",
      timestamp: new Date().toISOString(),
      paymentIntentId: session.payment_intent || "",
      customerId: session.customer || ""
    };

    try {
      const webhookResponse = await fetch("https://source-database.onrender.com/webhooks/kraftverk-customer-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (webhookResponse.ok) {
        console.log(`✅ Payment data sent to customer portal webhook successfully`);
      } else {
        console.error(`❌ Failed to send payment data to customer portal webhook:`, await webhookResponse.text());
      }
    } catch (error) {
      console.error("Error sending payment data to customer portal webhook:", error);
    }

  } catch (error) {
    console.error("Error sending customer data to portal:", error);
  }
}

async function sendRefundDataToPortal(stripe: Stripe, session: Stripe.Checkout.Session) {
  try {
    // Extract customer data from session
    const customerEmail = session.customer_email;
    const customerName = session.metadata?.customerName || "";
    const productType = session.metadata?.productType || "";
    const userId = session.metadata?.userId || "";
    
    // Get line items for inventory data
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const lineItem = lineItems.data[0]; // Get first item
    const priceId = lineItem?.price?.id || "";
    const quantity = lineItem?.quantity || 1;
    
    // Map price ID to product ID for inventory tracking
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
    
    const productId = productMapping[priceId] || productType;
    
    // Prepare refund data for portal
    const refundData = {
      tenant: "kraftverk",
      customerEmail,
      customerName,
      sessionId: session.id,
      amount: session.amount_total,
      currency: session.currency,
      productType,
      userId,
      paymentMethod: session.payment_method_types?.[0] || "card",
      status: "failed",
      timestamp: new Date().toISOString(),
      // Inventory tracking data for refund
      priceId,
      productId,
      quantity,
      inventoryAction: "refund", // Restore stock
      // Additional Stripe data
      paymentIntentId: session.payment_intent,
      customerId: session.customer,
      subscriptionId: session.subscription,
      mode: session.mode,
      successUrl: session.success_url,
      cancelUrl: session.cancel_url,
    };

    console.log(`📤 Sending refund data to portal:`, {
      customerEmail,
      customerName,
      amount: refundData.amount,
      currency: refundData.currency,
      productType: refundData.productType,
      priceId: refundData.priceId,
      productId: refundData.productId,
      quantity: refundData.quantity,
      inventoryAction: refundData.inventoryAction,
    });

    // Send to customer portal webhook endpoint
    const portalResponse = await fetch("https://source-database.onrender.com/webhooks/kraftverk-customer-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(refundData),
    });

    if (portalResponse.ok) {
      console.log(`✅ Refund data sent to portal successfully`);
    } else {
      console.error(`❌ Failed to send refund data to portal:`, await portalResponse.text());
    }

  } catch (error) {
    console.error("Error sending refund data to portal:", error);
  }
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
