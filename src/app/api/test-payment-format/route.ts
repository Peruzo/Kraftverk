import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Test payment data in the correct webhook format
    const webhookPayload = {
      tenant: "kraftverk",
      customerEmail: "test.customer@example.com",
      customerName: "Test Customer",
      sessionId: "cs_test_12345",
      amount: 499, // 499 SEK (not cents)
      currency: "SEK",
      productType: "gym_hoodie",
      productName: "Kraftverk Gym Hoodie",
      priceId: "price_1SL5CpP6vvUUervCS0hGh5i4",
      productId: "gym-hoodie",
      quantity: 1,
      inventoryAction: "purchase",
      userId: "user_123",
      paymentMethod: "card",
      status: "completed",
      timestamp: new Date().toISOString(),
      paymentIntentId: "pi_test_12345",
      customerId: "cus_test_12345"
    };

    console.log('🧪 Testing payment data format...');
    console.log('📤 Sending to customer portal webhook endpoint...');
    console.log('📋 Payload:', JSON.stringify(webhookPayload, null, 2));

    // Send to customer portal webhook endpoint
    const response = await fetch('https://source-database.onrender.com/webhooks/kraftverk-customer-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    const responseText = await response.text();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response body:', responseText);

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      response: responseText,
      payload: webhookPayload,
      message: response.ok 
        ? 'Payment data sent successfully to customer portal webhook' 
        : 'Failed to send payment data to customer portal webhook'
    });

  } catch (error) {
    console.error('❌ Error testing payment format:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error testing payment data format'
    }, { status: 500 });
  }
}
