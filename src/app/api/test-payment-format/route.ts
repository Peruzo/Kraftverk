import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Test payment data in the format the customer portal team expects
    const testPaymentData = {
      sessionId: "cs_test_12345",
      amount: 49900, // 499 SEK in cents
      currency: "SEK",
      status: "completed",
      customerEmail: "test.customer@example.com",
      customerName: "Test Customer",
      cardBrand: "visa",
      cardLast4: "1234",
      cardExpMonth: "12",
      cardExpYear: "25",
      productType: "gym_hoodie",
      productName: "Kraftverk Gym Hoodie",
      priceId: "price_1SL5CpP6vvUUervCS0hGh5i4",
      productId: "gym-hoodie",
      quantity: 1,
      inventoryAction: "purchase",
      userId: "user_123",
      paymentMethod: "card",
      customerId: "cus_123",
      timestamp: new Date().toISOString()
    };

    const portalPayload = {
      event: "customer_payment",
      data: testPaymentData,
      domain: "kraftverk-test-kund.onrender.com",
      tenant: "kraftverk"
    };

    console.log('🧪 Testing payment data format...');
    console.log('📤 Sending to customer portal analytics endpoint...');
    console.log('📋 Payload:', JSON.stringify(portalPayload, null, 2));

    // Send to customer portal analytics endpoint
    const response = await fetch('https://source-database.onrender.com/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(portalPayload)
    });

    const responseText = await response.text();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response body:', responseText);

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      response: responseText,
      payload: portalPayload,
      message: response.ok 
        ? 'Payment data sent successfully to customer portal' 
        : 'Failed to send payment data to customer portal'
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
