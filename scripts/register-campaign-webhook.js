/**
 * Register Kraftverk website for campaign sync with Source portal
 * 
 * This script registers your website to receive campaign webhooks from
 * the Source customer portal. Run once during setup.
 * 
 * Usage: node scripts/register-campaign-webhook.js
 */

const CUSTOMER_PORTAL_URL = 'https://source-database.onrender.com';
const API_KEY = process.env.SOURCE_API_KEY || 'kraftverk_api_key_here';
const WEBSITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kraftverk-test-kund.onrender.com';

async function registerWebhook() {
  try {
    console.log('🚀 Registering campaign webhook with Source portal...\n');
    console.log(`   Portal: ${CUSTOMER_PORTAL_URL}`);
    console.log(`   Website: ${WEBSITE_URL}`);
    console.log(`   Webhook: ${WEBSITE_URL}/api/campaigns/webhook\n`);
    
    const response = await fetch(`${CUSTOMER_PORTAL_URL}/api/campaigns/webhook/register-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        websiteUrl: WEBSITE_URL,
        apiKey: API_KEY,
        webhookUrl: `${WEBSITE_URL}/api/campaigns/webhook`
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Campaign sync registered successfully!\n');
      console.log('📋 Next steps:');
      console.log('1. Test webhook endpoint with: node scripts/test-campaign-webhook.js');
      console.log('2. Create campaigns in the Source customer portal');
      console.log('3. Verify campaigns appear on your membership page\n');
    } else {
      console.error('❌ Registration failed:', result);
      console.error('\n💡 Troubleshooting:');
      console.error('- Ensure SOURCE_API_KEY is set in your .env.local file');
      console.error('- Verify the Source portal is accessible');
      console.error('- Check that your website URL is correct\n');
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    console.error('\n💡 Common issues:');
    console.error('- Network connectivity problems');
    console.error('- Invalid API key or portal URL');
    console.error('- CORS or firewall restrictions\n');
  }
}

// Run the registration
registerWebhook();

