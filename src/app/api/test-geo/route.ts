import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Test the correct pageview endpoint
    const testEvent = {
      type: 'page_view',
      url: 'https://kraftverk.com/test',
      path: '/test',
      timestamp: new Date().toISOString(),
      referrer: 'https://google.com',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      screenWidth: 1920,
      screenHeight: 1080
    };

    const pageviewPayload = {
      tenant: 'kraftverk',
      events: [testEvent]
    };

    // Test pageview endpoint
    const pageviewResponse = await fetch('https://source-database.onrender.com/api/analytics/pageviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant': 'kraftverk',
      },
      body: JSON.stringify(pageviewPayload),
    });

    // Test geo endpoint
    const geoPayload = {
      url: 'https://kraftverk.com/test',
      path: '/test',
      timestamp: new Date().toISOString(),
      tenant: 'kraftverk',
      geo: {
        country: 'Sweden',
        countryCode: 'SE',
        region: 'Stockholm',
        city: 'Stockholm',
        latitude: 59.3293,
        longitude: 18.0686,
        timezone: 'Europe/Stockholm'
      },
      referrer: 'https://google.com',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      screenWidth: 1920,
      screenHeight: 1080
    };

    const geoResponse = await fetch('https://source-database.onrender.com/api/statistics/track-pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant': 'kraftverk',
      },
      body: JSON.stringify(geoPayload),
    });

    const results = {
      pageview: {
        success: pageviewResponse.ok,
        status: pageviewResponse.status,
        response: pageviewResponse.ok ? await pageviewResponse.json() : await pageviewResponse.text()
      },
      geo: {
        success: geoResponse.ok,
        status: geoResponse.status,
        response: geoResponse.ok ? await geoResponse.json() : await geoResponse.text()
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Analytics endpoints test completed',
      payloads: {
        pageview: pageviewPayload,
        geo: geoPayload
      },
      results: results
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Analytics test failed'
    }, { status: 500 });
  }
}
