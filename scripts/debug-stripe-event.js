/**
 * Debug Stripe Event
 * Queries Stripe API for a specific event ID
 * 
 * Usage: node scripts/debug-stripe-event.js evt_1SMwbbP6vvUUervCahaTOkbc
 */

const Stripe = require('stripe');

const eventId = process.argv[2];

if (!eventId) {
  console.error('❌ Please provide an event ID');
  console.log('Usage: node scripts/debug-stripe-event.js <event_id>');
  process.exit(1);
}

async function debugEvent() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    console.log(`🔍 Fetching event: ${eventId}\n`);

    const event = await stripe.events.retrieve(eventId);

    console.log('📦 Event Details:');
    console.log(`   ID: ${event.id}`);
    console.log(`   Type: ${event.type}`);
    console.log(`   Created: ${new Date(event.created * 1000).toISOString()}`);
    console.log(`   Live Mode: ${event.livemode}`);
    console.log(`   API Version: ${event.apiVersion}\n`);

    console.log('📋 Event Object:');
    console.log(JSON.stringify(event.data.object, null, 2));

    // Analyze based on type
    if (event.type === 'price.created') {
      const price = event.data.object;
      console.log('\n💰 Price Details:');
      console.log(`   Price ID: ${price.id}`);
      console.log(`   Nickname: ${price.nickname}`);
      console.log(`   Amount: ${price.unit_amount} ${price.currency}`);
      console.log(`   Product: ${price.product}`);
      console.log(`   Active: ${price.active}`);
      
      if (price.metadata) {
        console.log(`\n📝 Metadata:`);
        Object.entries(price.metadata).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });

        if (price.metadata.original_price_id) {
          console.log(`\n🔗 Campaign Link:`);
          console.log(`   Original Price ID: ${price.metadata.original_price_id}`);
          console.log(`   Campaign Name: ${price.metadata.campaign_name}`);
          
          // Try to identify the product
          const productId = mapPriceIdToProductId(price.metadata.original_price_id);
          if (productId) {
            console.log(`   ✅ Mapped to Kraftverk product: ${productId}`);
            console.log(`\n🎯 To update Kraftverk, send webhook with:`);
            console.log(`{`);
            console.log(`  "action": "price.updated",`);
            console.log(`  "priceUpdate": {`);
            console.log(`    "stripePriceId": "${price.id}",`);
            console.log(`    "originalProductId": "${productId}",`);
            console.log(`    "campaignId": "${price.metadata.campaign_id || 'camp_' + Date.now()}",`);
            console.log(`    "campaignName": "${price.metadata.campaign_name || 'Campaign'}"`);
            console.log(`  }`);
            console.log(`}`);
          } else {
            console.log(`   ❌ Could not map to Kraftverk product`);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
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

debugEvent();

