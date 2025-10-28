import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [DEBUG] Starting comprehensive analytics debug test...');
    
    // Test 1: Page Views Endpoint
    console.log('🧪 [DEBUG] Testing page views endpoint...');
    const pageviewPayload = {
      tenant: 'kraftverk',
      events: [{
        type: 'page_view',
        url: 'https://kraftverk.com/debug-test',
        path: '/debug-test',
        timestamp: new Date().toISOString(),
        referrer: 'https://google.com',
        userAgent: 'Mozilla/5.0 (Debug Test Browser)',
        screenWidth: 1920,
        screenHeight: 1080
      }]
    };

    console.log('🧪 [DEBUG] Pageview payload:', JSON.stringify(pageviewPayload, null, 2));

    const pageviewResponse = await fetch('https://source-database.onrender.com/api/ingest/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant': 'kraftverk',
      },
      body: JSON.stringify(pageviewPayload),
    });

    console.log('🧪 [DEBUG] Pageview response status:', pageviewResponse.status);
    console.log('🧪 [DEBUG] Pageview response headers:', Object.fromEntries(pageviewResponse.headers.entries()));
    
    const pageviewResponseText = await pageviewResponse.text();
    console.log('🧪 [DEBUG] Pageview response body:', pageviewResponseText);

    // Test 2: Geo Tracking Endpoint
    console.log('🧪 [DEBUG] Testing geo tracking endpoint...');
    const geoPayload = {
      url: 'https://kraftverk.com/debug-test',
      path: '/debug-test',
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
      userAgent: 'Mozilla/5.0 (Debug Test Browser)',
      screenWidth: 1920,
      screenHeight: 1080
    };

    console.log('🧪 [DEBUG] Geo payload:', JSON.stringify(geoPayload, null, 2));

    const geoResponse = await fetch('https://source-database.onrender.com/api/statistics/track-pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant': 'kraftverk',
      },
      body: JSON.stringify(geoPayload),
    });

    console.log('🧪 [DEBUG] Geo response status:', geoResponse.status);
    console.log('🧪 [DEBUG] Geo response headers:', Object.fromEntries(geoResponse.headers.entries()));
    
    const geoResponseText = await geoResponse.text();
    console.log('🧪 [DEBUG] Geo response body:', geoResponseText);

    // Test 3: Check if endpoints are reachable
    console.log('🧪 [DEBUG] Testing endpoint reachability...');
    
    const reachabilityTests = [
      {
        name: 'Pageviews Endpoint',
        url: 'https://source-database.onrender.com/api/analytics/pageviews',
        method: 'OPTIONS'
      },
      {
        name: 'Geo Endpoint', 
        url: 'https://source-database.onrender.com/api/statistics/track-pageview',
        method: 'OPTIONS'
      }
    ];

    const reachabilityResults = [];
    for (const test of reachabilityTests) {
      try {
        const response = await fetch(test.url, { method: test.method });
        reachabilityResults.push({
          name: test.name,
          url: test.url,
          status: response.status,
          reachable: response.status < 500
        });
        console.log(`🧪 [DEBUG] ${test.name} reachability:`, response.status);
      } catch (error) {
        reachabilityResults.push({
          name: test.name,
          url: test.url,
          status: 'ERROR',
          reachable: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`🧪 [DEBUG] ${test.name} reachability ERROR:`, error);
      }
    }

    const results = {
      pageview: {
        success: pageviewResponse.ok,
        status: pageviewResponse.status,
        response: pageviewResponseText,
        payload: pageviewPayload
      },
      geo: {
        success: geoResponse.ok,
        status: geoResponse.status,
        response: geoResponseText,
        payload: geoPayload
      },
      reachability: reachabilityResults,
      timestamp: new Date().toISOString()
    };

    console.log('🧪 [DEBUG] Debug test completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Comprehensive analytics debug test completed',
      results: results,
      instructions: {
        nextSteps: [
          'Check browser console for detailed debug logs',
          'Check Network tab for failed requests',
          'Verify endpoints are reachable',
          'Test with curl commands if needed'
        ],
        curlCommands: {
          pageview: `curl -X POST https://source-database.onrender.com/api/analytics/pageviews -H "Content-Type: application/json" -H "X-Tenant: kraftverk" -d '${JSON.stringify(pageviewPayload)}' -v`,
          geo: `curl -X POST https://source-database.onrender.com/api/statistics/track-pageview -H "Content-Type: application/json" -H "X-Tenant: kraftverk" -d '${JSON.stringify(geoPayload)}' -v`
        }
      }
    });
    
  } catch (error) {
    console.error('🧪 [DEBUG] Debug test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Analytics debug test failed',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
