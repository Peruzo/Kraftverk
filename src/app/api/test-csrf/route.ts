import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [DEBUG] Testing CSRF requirements for analytics endpoints...');
    
    // Test 1: Try without any special headers
    console.log('🧪 [DEBUG] Test 1: No special headers');
    const test1Response = await fetch('https://source-database.onrender.com/api/analytics/pageviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenant: 'kraftverk',
        events: [{
          type: 'test',
          url: 'https://test.com',
          timestamp: new Date().toISOString()
        }]
      }),
    });
    
    console.log('🧪 [DEBUG] Test 1 response status:', test1Response.status);
    const test1Body = await test1Response.text();
    console.log('🧪 [DEBUG] Test 1 response body:', test1Body);

    // Test 2: Try with X-Tenant header only
    console.log('🧪 [DEBUG] Test 2: X-Tenant header only');
    const test2Response = await fetch('https://source-database.onrender.com/api/analytics/pageviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant': 'kraftverk',
      },
      body: JSON.stringify({
        tenant: 'kraftverk',
        events: [{
          type: 'test',
          url: 'https://test.com',
          timestamp: new Date().toISOString()
        }]
      }),
    });
    
    console.log('🧪 [DEBUG] Test 2 response status:', test2Response.status);
    const test2Body = await test2Response.text();
    console.log('🧪 [DEBUG] Test 2 response body:', test2Body);

    // Test 3: Try with different endpoint
    console.log('🧪 [DEBUG] Test 3: Different endpoint - /api/ingest/analytics');
    const test3Response = await fetch('https://source-database.onrender.com/api/ingest/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant': 'kraftverk',
      },
      body: JSON.stringify({
        tenant: 'kraftverk',
        events: [{
          type: 'test',
          url: 'https://test.com',
          timestamp: new Date().toISOString()
        }]
      }),
    });
    
    console.log('🧪 [DEBUG] Test 3 response status:', test3Response.status);
    const test3Body = await test3Response.text();
    console.log('🧪 [DEBUG] Test 3 response body:', test3Body);

    return NextResponse.json({
      success: true,
      message: 'CSRF test completed',
      results: {
        test1: {
          status: test1Response.status,
          body: test1Body
        },
        test2: {
          status: test2Response.status,
          body: test2Body
        },
        test3: {
          status: test3Response.status,
          body: test3Body
        }
      }
    });
    
  } catch (error) {
    console.error('🧪 [DEBUG] CSRF test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'CSRF test failed'
    }, { status: 500 });
  }
}
