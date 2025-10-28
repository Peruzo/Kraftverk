import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Test the new simplified analytics format
    const testEvent = {
      type: 'test_event',
      url: 'https://kraftverk.com/test',
      path: '/test',
      title: 'Test Page',
      timestamp: new Date().toISOString(),
      referrer: 'https://google.com',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      screenWidth: 1920,
      screenHeight: 1080,
      properties: {
        test: true,
        message: 'Testing simplified analytics'
      }
    };

    const payload = {
      tenant: 'kraftverk',
      events: [testEvent]
    };

    // Test sending to the new endpoint
    const response = await fetch('https://source-database.onrender.com/api/ingest/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant': 'kraftverk',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Simplified analytics test successful',
        payload: payload,
        response: result
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: 'Analytics test failed',
        details: errorText,
        payload: payload
      }, { status: 500 });
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Analytics test failed'
    }, { status: 500 });
  }
}
