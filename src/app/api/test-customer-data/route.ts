import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simulate customer data that would be sent to portal
    const customerData = {
      tenant: "kraftverk",
      customerEmail: body.customerEmail || "test@example.com",
      customerName: body.customerName || "Test Customer",
      sessionId: "test_session_123",
      amount: body.amount || 399,
      currency: "SEK",
      productType: body.productType || "base_membership",
      userId: "test-user",
      paymentMethod: "card",
      status: "completed",
      timestamp: new Date().toISOString(),
    };

    console.log("🧪 Test customer data:", customerData);

    // Send to customer portal (if configured)
    if (process.env.CUSTOMER_PORTAL_URL && process.env.PORTAL_INBOUND_TOKEN) {
      const portalResponse = await fetch(`${process.env.CUSTOMER_PORTAL_URL}/webhooks/stripe-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.PORTAL_INBOUND_TOKEN}`,
        },
        body: JSON.stringify(customerData),
      });

      if (portalResponse.ok) {
        console.log("✅ Test data sent to portal successfully");
        return NextResponse.json({ 
          success: true, 
          message: "Customer data sent to portal",
          data: customerData 
        });
      } else {
        console.error("❌ Failed to send test data to portal:", await portalResponse.text());
        return NextResponse.json({ 
          success: false, 
          message: "Failed to send to portal",
          data: customerData 
        });
      }
    } else {
      console.log("⚠️ Portal environment variables not configured");
      return NextResponse.json({ 
        success: true, 
        message: "Portal not configured - data logged only",
        data: customerData 
      });
    }

  } catch (error) {
    console.error("Test customer data error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Test failed" 
    }, { status: 500 });
  }
}
