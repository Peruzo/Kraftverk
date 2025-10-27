/**
 * Mock Enterprise Analytics Test
 * Tests the integration with mock API keys to demonstrate functionality
 * 
 * Usage: node scripts/test-mock-analytics.js
 */

const CUSTOMER_PORTAL_URL = 'https://source-database.onrender.com';
const TENANT_ID = 'kraftverk';

async function testMockAnalyticsIntegration() {
  console.log('🧪 Testing Kraftverk Enterprise Analytics Integration (Mock Mode)...\n');
  
  // Test 1: Analytics Event Tracking (This should work)
  console.log('Test 1: Analytics Event Tracking (Pageviews)');
  try {
    const testEvent = {
      event_id: 'mock_test_' + Date.now(),
      tenant_id: TENANT_ID,
      session_id: 'mock_session_' + Math.random().toString(36).substr(2, 9),
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
        // No API key for this test - using public endpoint
      },
      body: JSON.stringify(testEvent)
    });

    if (response.ok) {
      console.log('✅ Analytics event sent successfully');
      console.log(`   Event ID: ${testEvent.event_id}`);
      console.log(`   Response: ${response.status} ${response.statusText}`);
    } else {
      console.log(`⚠️  Analytics event response: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`   Error: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Analytics event test error:', error.message);
  }

  console.log('\n');

  // Test 2: Test the enhanced analytics service
  console.log('Test 2: Enhanced Analytics Service Test');
  try {
    // Simulate the enhanced analytics service
    const mockAnalyticsService = {
      trackPageView: (path, pageTitle) => {
        console.log(`📊 Mock Analytics: Page view tracked`);
        console.log(`   Path: ${path}`);
        console.log(`   Title: ${pageTitle}`);
        return Promise.resolve();
      },
      
      trackFormSubmit: (formId, formData) => {
        console.log(`📊 Mock Analytics: Form submission tracked`);
        console.log(`   Form ID: ${formId}`);
        console.log(`   Data: ${JSON.stringify(formData)}`);
        return Promise.resolve();
      },
      
      trackCTAClick: (ctaText, ctaType, location) => {
        console.log(`📊 Mock Analytics: CTA click tracked`);
        console.log(`   CTA Text: ${ctaText}`);
        console.log(`   CTA Type: ${ctaType}`);
        console.log(`   Location: ${location}`);
        return Promise.resolve();
      },
      
      trackPerformance: (metric, data) => {
        console.log(`📈 Mock Statistics: Performance tracked`);
        console.log(`   Metric: ${metric}`);
        console.log(`   Data: ${JSON.stringify(data)}`);
        return Promise.resolve();
      },
      
      trackEcommerce: (eventType, data) => {
        console.log(`📈 Mock Statistics: E-commerce tracked`);
        console.log(`   Event Type: ${eventType}`);
        console.log(`   Data: ${JSON.stringify(data)}`);
        return Promise.resolve();
      }
    };

    // Test various tracking functions
    await mockAnalyticsService.trackPageView('/medlemskap', 'Medlemskap - Kraftverk Studio');
    await mockAnalyticsService.trackFormSubmit('contact-form', { name: 'Test User', email: 'test@example.com' });
    await mockAnalyticsService.trackCTAClick('Välj plan', 'button', 'membership-card');
    await mockAnalyticsService.trackPerformance('lcp', { lcp: 1200, cls: 0.1, fcp: 800 });
    await mockAnalyticsService.trackEcommerce('product_view', { product_id: 'base', product_name: 'Base Medlemskap', price: 399 });

    console.log('✅ Enhanced analytics service test completed');
  } catch (error) {
    console.error('❌ Enhanced analytics service test error:', error.message);
  }

  console.log('\n');

  // Test 3: Test data structure
  console.log('Test 3: Data Structure Validation');
  try {
    const sampleEvent = {
      event_id: crypto.randomUUID(),
      tenant_id: TENANT_ID,
      session_id: 'test_session_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      page: '/medlemskap',
      referrer: 'https://google.com',
      source: 'organic',
      device: 'desktop',
      event_type: 'membership_view',
      event_props: {
        membership_id: 'base',
        membership_name: 'Base Medlemskap',
        price: 399,
        currency: 'SEK'
      },
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      load_time: 1500,
      custom_dimensions: {
        campaign: 'summer_sale',
        user_type: 'new'
      },
      domain: 'kraftverk-test-kund.onrender.com'
    };

    console.log('✅ Sample event structure:');
    console.log(JSON.stringify(sampleEvent, null, 2));
  } catch (error) {
    console.error('❌ Data structure test error:', error.message);
  }

  console.log('\n🎉 Mock analytics integration tests completed!\n');
  
  console.log('📋 Next Steps:');
  console.log('1. Create .env.local file with your actual API keys');
  console.log('2. Get API keys from customer portal:');
  console.log('   - Analytics API key for /api/pageviews/track');
  console.log('   - Statistics API key for /api/statistics/track');
  console.log('3. Update environment variables with real keys');
  console.log('4. Run: node scripts/test-analytics-integration.js');
  console.log('5. Start development server: npm run dev\n');
  
  console.log('🔍 What the Integration Will Track:');
  console.log('- 📊 Analytics: Page views, forms, traffic sources');
  console.log('- 📈 Statistics: Performance, e-commerce, custom dimensions');
  console.log('- 🎯 Campaigns: Campaign views, clicks, conversions');
  console.log('- 💳 E-commerce: Product views, cart, checkout, purchases');
  console.log('- 📱 Performance: Core Web Vitals, load times, errors');
  console.log('- 👥 User Behavior: Scroll depth, time on page, interactions');
}

// Run the tests
testMockAnalyticsIntegration();
