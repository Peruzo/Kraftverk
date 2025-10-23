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

    // Send to customer portal
    const portalResponse = await fetch("https://source-database.onrender.com/webhooks/kraftverk-customer-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    });

    if (portalResponse.ok) {
      const result = await portalResponse.json();
      console.log("✅ Test data sent to portal successfully:", result);
      return NextResponse.json({ 
        success: true, 
        message: "Customer data sent to portal",
        portalResponse: result,
        data: customerData 
      });
    } else {
      const errorText = await portalResponse.text();
      console.error("❌ Failed to send test data to portal:", errorText);
      return NextResponse.json({ 
        success: false, 
        message: "Failed to send to portal",
        error: errorText,
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
