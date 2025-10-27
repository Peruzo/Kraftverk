/**
 * Test Enterprise Analytics Integration Script
 * Verifies that analytics and statistics data is being collected correctly
 * 
 * Usage: node scripts/test-analytics-integration.js
 */

const CUSTOMER_PORTAL_URL = 'https://source-database.onrender.com';
const ANALYTICS_API_KEY = process.env.ANALYTICS_API_KEY || 'your-analytics-api-key';
const STATISTICS_API_KEY = process.env.STATISTICS_API_KEY || 'your-statistics-api-key';
const TENANT_ID = 'kraftverk';

async function testEnterpriseAnalyticsIntegration() {
  console.log('🧪 Testing Kraftverk Enterprise Analytics Integration...\n');
  
  // Test 1: Check Analytics API key permissions
  console.log('Test 1: Analytics API Key Permissions');
  try {
    const response = await fetch(`${CUSTOMER_PORTAL_URL}/api/enterprise/api-keys/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ANALYTICS_API_KEY
      },
      body: JSON.stringify({
        tenantId: TENANT_ID,
        requiredPermissions: ['analytics', 'forms']
      })
    });

    const result = await response.json();
    
    if (response.ok && result.valid) {
      console.log('✅ Analytics API key permissions verified');
      console.log(`   Permissions: ${result.permissions.join(', ')}`);
    } else {
      console.error('❌ Analytics API key verification failed:', result);
    }
  } catch (error) {
    console.error('❌ Analytics API key test error:', error.message);
  }

  console.log('\n');

  // Test 2: Check Statistics API key permissions
  console.log('Test 2: Statistics API Key Permissions');
  try {
    const response = await fetch(`${CUSTOMER_PORTAL_URL}/api/enterprise/api-keys/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': STATISTICS_API_KEY
      },
      body: JSON.stringify({
        tenantId: TENANT_ID,
        requiredPermissions: ['analytics', 'forms', 'performance', 'ecommerce', 'realTimeUpdates']
      })
    });

    const result = await response.json();
    
    if (response.ok && result.valid) {
      console.log('✅ Statistics API key permissions verified');
      console.log(`   Permissions: ${result.permissions.join(', ')}`);
    } else {
      console.error('❌ Statistics API key verification failed:', result);
    }
  } catch (error) {
    console.error('❌ Statistics API key test error:', error.message);
  }

  console.log('\n');

  // Test 3: Send test analytics event to pageviews endpoint
  console.log('Test 3: Analytics Event Tracking (Pageviews)');
  try {
    const testEvent = {
      event_id: 'test_' + Date.now(),
      tenant_id: TENANT_ID,
      session_id: 'test_session_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      page: '/test',
      referrer: 'https://test-referrer.com',
      source: 'test',
      device: 'desktop',
      event_type: 'page_view',
      event_props: {
        page_title: 'Test Page',
        page_category: 'test'
      },
      user_agent: 'Test User Agent',
      load_time: 1000,
      custom_dimensions: {
        test_dimension: 'test_value'
      },
      domain: 'localhost'
    };

    const response = await fetch(`${CUSTOMER_PORTAL_URL}/api/pageviews/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ANALYTICS_API_KEY
      },
      body: JSON.stringify(testEvent)
    });

    if (response.ok) {
      console.log('✅ Analytics event sent successfully');
      console.log(`   Event ID: ${testEvent.event_id}`);
    } else {
      console.error('❌ Analytics event tracking failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Analytics event test error:', error.message);
  }

  console.log('\n');

  // Test 4: Send test statistics event
  console.log('Test 4: Statistics Event Tracking');
  try {
    const testEvent = {
      event_id: 'stats_test_' + Date.now(),
      tenant_id: TENANT_ID,
      session_id: 'test_session_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      page: '/test',
      referrer: '',
      source: 'direct',
      device: 'desktop',
      event_type: 'performance',
      event_props: {
        lcp: 1200,
        cls: 0.1,
        fcp: 800,
        load_time: 2000
      },
      user_agent: 'Test User Agent',
      load_time: 1000,
      custom_dimensions: {},
      domain: 'localhost'
    };

    const response = await fetch(`${CUSTOMER_PORTAL_URL}/api/statistics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': STATISTICS_API_KEY
      },
      body: JSON.stringify(testEvent)
    });

    if (response.ok) {
      console.log('✅ Statistics event sent successfully');
      console.log(`   Event ID: ${testEvent.event_id}`);
    } else {
      console.error('❌ Statistics event tracking failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Statistics event test error:', error.message);
  }

  console.log('\n');

  // Test 5: Check analytics data retrieval
  console.log('Test 5: Analytics Data Retrieval');
  try {
    const response = await fetch(`${CUSTOMER_PORTAL_URL}/api/analytics/statistics`, {
      method: 'GET',
      headers: {
        'X-API-Key': ANALYTICS_API_KEY
      },
      params: new URLSearchParams({
        tenantId: TENANT_ID,
        limit: '10'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Analytics data retrieval successful');
      console.log(`   Data points found: ${data.length || 0}`);
    } else {
      console.error('❌ Analytics data retrieval failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Analytics data retrieval error:', error.message);
  }

  console.log('\n');

  // Test 6: Check statistics data retrieval
  console.log('Test 6: Statistics Data Retrieval');
  try {
    const response = await fetch(`${CUSTOMER_PORTAL_URL}/api/statistics/overview`, {
      method: 'GET',
      headers: {
        'X-API-Key': STATISTICS_API_KEY
      },
      params: new URLSearchParams({
        tenantId: TENANT_ID
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Statistics data retrieval successful');
      console.log(`   Overview data available: ${Object.keys(data).length > 0}`);
    } else {
      console.error('❌ Statistics data retrieval failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Statistics data retrieval error:', error.message);
  }

  console.log('\n');

  // Test 7: E-commerce events
  console.log('Test 7: E-commerce Events');
  try {
    const testEcommerceData = {
      event_id: 'ecommerce_test_' + Date.now(),
      tenant_id: TENANT_ID,
      session_id: 'test_session_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      page: '/medlemskap',
      referrer: '',
      source: 'direct',
      device: 'desktop',
      event_type: 'product_view',
      event_props: {
        product_id: 'base',
        product_name: 'Base Medlemskap',
        category: 'membership',
        price: 399,
        currency: 'SEK'
      },
      user_agent: 'Test User Agent',
      load_time: 1000,
      custom_dimensions: {},
      domain: 'localhost'
    };

    const response = await fetch(`${CUSTOMER_PORTAL_URL}/api/statistics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': STATISTICS_API_KEY
      },
      body: JSON.stringify(testEcommerceData)
    });

    if (response.ok) {
      console.log('✅ E-commerce event sent successfully');
      console.log(`   Product: ${testEcommerceData.event_props.product_name}`);
    } else {
      console.error('❌ E-commerce event failed:', response.status);
    }
  } catch (error) {
    console.error('❌ E-commerce event error:', error.message);
  }

  console.log('\n🎉 Enterprise analytics integration tests completed!\n');
  
  console.log('📋 Next Steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Visit your website and interact with it');
  console.log('3. Check browser console for analytics logs');
  console.log('4. Verify data appears in customer portal dashboard\n');
  
  console.log('🔍 What to Look For:');
  console.log('- Analytics events: 📊 Analytics tracked: page_view');
  console.log('- Statistics events: 📈 Statistics tracked: performance');
  console.log('- Page view events on route changes');
  console.log('- Form interaction tracking');
  console.log('- Button and CTA click tracking');
  console.log('- Scroll depth tracking');
  console.log('- Performance metrics (Core Web Vitals)');
  console.log('- E-commerce events (membership views, checkout)');
}

// Run the tests
testEnterpriseAnalyticsIntegration();

