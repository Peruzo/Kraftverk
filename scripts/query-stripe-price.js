/**
 * Query Stripe Price Details
 * 
 * Usage: node scripts/query-stripe-price.js price_1SMwbbP6vvUUervCjaCiPEkT
 */

const Stripe = require('stripe');

const priceId = process.argv[2];

if (!priceId) {
  console.error('❌ Please provide a price ID');
  console.log('Usage: node scripts/query-stripe-price.js <price_id>');
  process.exit(1);
}

async function queryPrice() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    console.log(`🔍 Fetching price: ${priceId}\n`);

    const price = await stripe.prices.retrieve(priceId);

    console.log('💰 Price Details:');
    console.log(`   ID: ${price.id}`);
    console.log(`   Nickname: ${price.nickname}`);
    console.log(`   Amount: ${price.unit_amount} ${price.currency.toUpperCase()}`);
    console.log(`   Type: ${price.type}`);
    console.log(`   Active: ${price.active}`);
    console.log(`   Product: ${price.product}`);
    console.log(`   Recurring: ${price.recurring ? JSON.stringify(price.recurring) : 'One-time'}\n`);

    if (price.metadata && Object.keys(price.metadata).length > 0) {
      console.log('📝 Metadata:');
      Object.entries(price.metadata).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      console.log('');

      // Check if this is a campaign price
      if (price.metadata.original_price_id) {
        console.log('🎯 This is a CAMPAIGN PRICE!\n');
        
        const productId = mapPriceIdToProductId(price.metadata.original_price_id);
        
        if (productId) {
          console.log('✅ Mapped to Kraftverk product:', productId);
          console.log('\n📤 Send this webhook to Kraftverk:\n');
          console.log(`curl -X POST https://kraftverk-test-kund.onrender.com/api/campaigns/webhook \\`);
          console.log(`  -H "Authorization: Bearer YOUR_SOURCE_API_KEY" \\`);
          console.log(`  -H "Content-Type: application/json" \\`);
          console.log(`  -d '{`);
          console.log(`    "action": "price.updated",`);
          console.log(`    "priceUpdate": {`);
          console.log(`      "stripePriceId": "${price.id}",`);
          console.log(`      "originalProductId": "${productId}",`);
          console.log(`      "campaignId": "${price.metadata.campaign_id || 'camp_' + Date.now()}",`);
          console.log(`      "campaignName": "${price.metadata.campaign_name || price.nickname}"`);
          console.log(`    }`);
          console.log(`  }'`);
          console.log('');
        } else {
          console.log('❌ Could not map to Kraftverk product');
          console.log(`   Original Price ID: ${price.metadata.original_price_id}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.statusCode === 404) {
      console.error('Price not found. Check if it exists in Stripe.');
    }
  }
}

function mapPriceIdToProductId(stripePriceId) {
  const priceToProductMap = {
    'price_1SKx8zP6vvUUervCjfwpzNUJ': 'test-kund',
    'price_1SKhYSP6vvUUervCTpvpt0QO': 'base',
    'price_1SKwUeP6vvUUervCMqO3Xv7v': 'flex',
    'price_1SL2xzP6vvUUervCtqpdm124': 'studio-plus',
    'price_1SKwweP6vvUUervCxH3vVYhG': 'dagpass',
  };
  
  return priceToProductMap[stripePriceId] || null;
}

queryPrice();

