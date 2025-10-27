/**
 * Enterprise API Key Management Script for Kraftverk
 * Creates both Analytics and Statistics API keys for enterprise customers
 * 
 * Usage: node scripts/create-analytics-api-key.js
 */

const CUSTOMER_PORTAL_URL = 'https://source-database.onrender.com';
const TENANT_ID = 'kraftverk';
const WEBSITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function createEnterpriseApiKeys() {
  try {
    console.log('🚀 Creating Enterprise API keys for Kraftverk...\n');
    console.log(`   Tenant: ${TENANT_ID}`);
    console.log(`   Website: ${WEBSITE_URL}`);
    console.log(`   Package: Enterprise\n`);

    // Create Analytics API Key (for both grow and enterprise customers)
    console.log('📊 Creating Analytics API Key...');
    const analyticsApiKeyData = {
      name: 'Kraftverk Analytics API Key',
      description: 'Analytics API key for collecting page views and basic analytics data',
      keyType: 'test',
      permissions: [
        {
          module: 'analytics',
          actions: ['read', 'write', 'export']
        },
        {
          module: 'forms',
          actions: ['read', 'write', 'export']
        }
      ],
      domains: [WEBSITE_URL, 'localhost', 'kraftverk-test-kund.onrender.com'],
      rateLimit: {
        requestsPerMinute: 1000,
        requestsPerHour: 10000,
        requestsPerDay: 100000
      }
    };

    const analyticsResponse = await fetch(`${CUSTOMER_PORTAL_URL}/api/enterprise/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SOURCE_API_KEY || 'your-admin-key'}`,
      },
      body: JSON.stringify(analyticsApiKeyData)
    });

    const analyticsResult = await analyticsResponse.json();

    if (!analyticsResponse.ok) {
      throw new Error(`Analytics API key creation failed: ${analyticsResult.message}`);
    }

    console.log('✅ Analytics API Key created successfully!');
    console.log(`   Key ID: ${analyticsResult.keyId}`);
    console.log(`   Key: ${analyticsResult.key}\n`);

    // Create Statistics API Key (enterprise customers only)
    console.log('📈 Creating Statistics API Key...');
    const statisticsApiKeyData = {
      name: 'Kraftverk Statistics API Key',
      description: 'Statistics API key for collecting comprehensive analytics and performance data',
      keyType: 'test',
      permissions: [
        {
          module: 'analytics',
          actions: ['read', 'write', 'export']
        },
        {
          module: 'forms',
          actions: ['read', 'write', 'export']
        },
        {
          module: 'performance',
          actions: ['read', 'write', 'export']
        },
        {
          module: 'ecommerce',
          actions: ['read', 'write', 'export']
        },
        {
          module: 'realTimeUpdates',
          actions: ['read', 'write']
        },
        {
          module: 'exports',
          actions: ['read', 'export']
        },
        {
          module: 'customDimensions',
          actions: ['read', 'write']
        },
        {
          module: 'advancedSegmentation',
          actions: ['read', 'write']
        },
        {
          module: 'dataRetention',
          actions: ['read', 'write']
        },
        {
          module: 'apiAccess',
          actions: ['read', 'write']
        }
      ],
      domains: [WEBSITE_URL, 'localhost', 'kraftverk-test-kund.onrender.com'],
      rateLimit: {
        requestsPerMinute: 2000,
        requestsPerHour: 20000,
        requestsPerDay: 200000
      }
    };

    const statisticsResponse = await fetch(`${CUSTOMER_PORTAL_URL}/api/enterprise/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SOURCE_API_KEY || 'your-admin-key'}`,
      },
      body: JSON.stringify(statisticsApiKeyData)
    });

    const statisticsResult = await statisticsResponse.json();

    if (!statisticsResponse.ok) {
      throw new Error(`Statistics API key creation failed: ${statisticsResult.message}`);
    }

    console.log('✅ Statistics API Key created successfully!');
    console.log(`   Key ID: ${statisticsResult.keyId}`);
    console.log(`   Key: ${statisticsResult.key}\n`);

    console.log('🎉 Enterprise API keys created successfully!\n');
    
    console.log('📋 Environment Variables Setup:');
    console.log('Add these to your .env.local file:\n');
    console.log('# Enterprise Analytics & Statistics Configuration');
    console.log('IP_SALT=your-secure-salt-here');
    console.log(`ANALYTICS_API_KEYS=kraftverk:${analyticsResult.key}`);
    console.log(`STATISTICS_API_KEYS=kraftverk:${statisticsResult.key}`);
    console.log('ANALYTICS_HMAC_SECRET=your-analytics-hmac-secret');
    console.log('STATISTICS_HMAC_SECRET=your-statistics-hmac-secret');
    console.log('WEBHOOK_SECRET_GOOGLE=your-google-webhook-secret');
    console.log('WEBHOOK_SECRET_META=your-meta-webhook-secret');
    console.log('WEBHOOK_SECRET_TIKTOK=your-tiktok-webhook-secret');
    console.log('WEBHOOK_SECRET_LINKEDIN=your-linkedin-webhook-secret\n');

    console.log('🔧 Next Steps:');
    console.log('1. Update your .env.local file with the variables above');
    console.log('2. Test the integration: node scripts/test-analytics-integration.js');
    console.log('3. Start your development server: npm run dev');
    console.log('4. Visit your website and check browser console for analytics logs\n');

    console.log('📊 Data Collection Capabilities:');
    console.log('✅ Analytics Endpoints:');
    console.log('   - POST /api/pageviews/track');
    console.log('   - POST /api/pageviews_ext/track');
    console.log('   - GET /api/analytics/statistics');
    console.log('   - GET /api/analytics/geo-data');
    console.log('');
    console.log('✅ Statistics Endpoints (Enterprise):');
    console.log('   - POST /api/statistics/track');
    console.log('   - GET /api/statistics/overview');
    console.log('   - GET /api/statistics/traffic');
    console.log('   - GET /api/statistics/content');
    console.log('   - GET /api/statistics/forms');
    console.log('   - GET /api/statistics/funnels');
    console.log('   - GET /api/statistics/cohorts\n');

    return {
      analyticsKey: analyticsResult.key,
      statisticsKey: statisticsResult.key
    };

  } catch (error) {
    console.error('❌ Enterprise API key creation error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('- Ensure SOURCE_API_KEY is set in your environment');
    console.error('- Verify the customer portal is accessible');
    console.error('- Check that Kraftverk has enterprise package enabled');
    console.error('- Verify admin permissions for API key creation\n');
  }
}

// Run the script
createEnterpriseApiKeys();
