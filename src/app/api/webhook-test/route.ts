import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Stripe webhook endpoint is ready",
    endpoint: "/webhooks/stripe-payments",
    events: [
      "checkout.session.completed",
      "payment_intent.succeeded", 
      "payment_intent.payment_failed",
      "invoice.payment_succeeded",
      "customer.subscription.deleted"
    ],
    tenant: "kraftverk",
    status: "active"
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  console.log("🧪 Webhook test received:", body);
  
  return NextResponse.json({
    message: "Webhook test successful",
    received: body,
    timestamp: new Date().toISOString()
  });
}
