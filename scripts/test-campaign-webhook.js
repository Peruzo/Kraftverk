/**
 * Test campaign webhook endpoint
 * 
 * This script tests your campaign webhook endpoint to ensure it's
 * properly configured and can receive campaign updates.
 * 
 * Usage: node scripts/test-campaign-webhook.js
 */

const API_KEY = process.env.SOURCE_API_KEY || 'kraftverk_api_key_here';
const WEBSITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testWebhook() {
  console.log('🧪 Testing campaign webhook endpoint...\n');
  
  // Test 1: Ping test
  console.log('Test 1: Ping health check');
  try {
    const pingResponse = await fetch(`${WEBSITE_URL}/api/campaigns/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        action: 'ping',
        timestamp: new Date().toISOString()
      })
    });

    const pingResult = await pingResponse.json();
    
    if (pingResponse.ok && pingResult.success) {
      console.log('✅ Ping test passed:', pingResult.message);
    } else {
      console.error('❌ Ping test failed:', pingResult);
    }
  } catch (error) {
    console.error('❌ Ping test error:', error.message);
  }

  console.log('\n');

  // Test 2: Campaign creation
  console.log('Test 2: Campaign creation webhook');
  try {
    const testCampaign = {
      id: 'test_campaign_001',
      name: 'Test Summer Sale',
      type: 'discount',
      status: 'active',
      discountType: 'percentage',
      discountValue: 20,
      products: ['base', 'flex', 'studio-plus'],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      stripeCouponId: 'test_coupon_20off',
      stripePromotionCodeId: 'test_promo_20off',
      usageCount: 0,
      maxUses: 100
    };

    const createResponse = await fetch(`${WEBSITE_URL}/api/campaigns/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        action: 'created',
        campaign: testCampaign,
        timestamp: new Date().toISOString()
      })
    });

    const createResult = await createResponse.json();
    
    if (createResponse.ok && createResult.success) {
      console.log('✅ Campaign creation test passed');
      console.log(`   Active campaigns: ${createResult.activeCampaigns}`);
    } else {
      console.error('❌ Campaign creation test failed:', createResult);
    }
  } catch (error) {
    console.error('❌ Campaign creation test error:', error.message);
  }

  console.log('\n');

  // Test 3: Fetch active campaigns
  console.log('Test 3: Fetch active campaigns');
  try {
    const fetchResponse = await fetch(`${WEBSITE_URL}/api/campaigns/webhook`, {
      method: 'GET'
    });

    const fetchResult = await fetchResponse.json();
    
    if (fetchResponse.ok) {
      console.log('✅ Campaign fetch test passed');
      console.log(`   Active campaigns: ${fetchResult.count}`);
      
      if (fetchResult.campaigns.length > 0) {
        console.log('\n📋 Active Campaigns:');
        fetchResult.campaigns.forEach((campaign, index) => {
          console.log(`   ${index + 1}. ${campaign.name} (${campaign.discountValue}${campaign.discountType === 'percentage' ? '%' : 'kr'} off)`);
        });
      }
    } else {
      console.error('❌ Campaign fetch test failed:', fetchResult);
    }
  } catch (error) {
    console.error('❌ Campaign fetch test error:', error.message);
  }

  console.log('\n');

  // Test 4: Campaign deletion
  console.log('Test 4: Campaign deletion webhook');
  try {
    const deleteResponse = await fetch(`${WEBSITE_URL}/api/campaigns/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        action: 'deleted',
        campaign: {
          id: 'test_campaign_001',
          name: 'Test Summer Sale'
        },
        timestamp: new Date().toISOString()
      })
    });

    const deleteResult = await deleteResponse.json();
    
    if (deleteResponse.ok && deleteResult.success) {
      console.log('✅ Campaign deletion test passed');
      console.log(`   Active campaigns: ${deleteResult.activeCampaigns}`);
    } else {
      console.error('❌ Campaign deletion test failed:', deleteResult);
    }
  } catch (error) {
    console.error('❌ Campaign deletion test error:', error.message);
  }

  console.log('\n🎉 All webhook tests completed!\n');
}

// Run the tests
testWebhook();

