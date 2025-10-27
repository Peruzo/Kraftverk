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

    const response = await fetch(`${CUSTOMER_PORTAL_URL}/api/enterprise/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SOURCE_API_KEY || 'your-admin-key'}`,
      },
      body: JSON.stringify(apiKeyData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Analytics API key created successfully!\n');
      console.log('📋 API Key Details:');
      console.log(`   Key ID: ${result.keyId}`);
      console.log(`   Key: ${result.key}`);
      console.log(`   Name: ${result.name}`);
      console.log(`   Type: ${result.keyType}\n`);

      console.log('🔧 Next Steps:');
      console.log('1. Add this to your .env.local file:');
      console.log(`   NEXT_PUBLIC_ANALYTICS_API_KEY=${result.key}\n`);
      
      console.log('2. Update your layout.tsx to use EnhancedAnalyticsProvider:');
      console.log('   import EnhancedAnalyticsProvider from "@/components/providers/EnhancedAnalyticsProvider";\n');
      
      console.log('3. Replace AnalyticsProvider with EnhancedAnalyticsProvider in your layout\n');
      
      console.log('4. Test the integration:');
      console.log('   npm run dev');
      console.log('   # Visit your website and check browser console for analytics logs\n');

      console.log('📊 Data Collection Capabilities:');
      console.log('✅ Page views and unique visitors');
      console.log('✅ Session duration and bounce rate');
      console.log('✅ Traffic sources (organic, direct, referral, social)');
      console.log('✅ Geographic data (countries, regions, cities)');
      console.log('✅ Device and browser breakdown');
      console.log('✅ Core Web Vitals (LCP, CLS, INP, FCP, TTFB)');
      console.log('✅ Form completion rates and field drop-off');
      console.log('✅ E-commerce events (product views, cart, checkout)');
      console.log('✅ Campaign tracking and conversion');
      console.log('✅ Membership and booking analytics');
      console.log('✅ Error tracking and performance monitoring\n');

      return result.key;
    } else {
      console.error('❌ API key creation failed:', result);
      console.error('\n💡 Troubleshooting:');
      console.error('- Ensure SOURCE_API_KEY is set in your environment');
      console.error('- Verify the customer portal is accessible');
      console.error('- Check that you have admin permissions\n');
    }
  } catch (error) {
    console.error('❌ API key creation error:', error.message);
    console.error('\n💡 Common issues:');
    console.error('- Network connectivity problems');
    console.error('- Invalid admin API key');
    console.error('- CORS or firewall restrictions\n');
  }
}

// Run the script
createAnalyticsApiKey();

