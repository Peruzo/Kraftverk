/**
 * Script to create a product in the main Stripe account
 * This avoids the connected account business name issue
 * 
 * Usage: node scripts/create-main-account-product.js
 */

const Stripe = require('stripe');

// Initialize Stripe with your main account secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createMainAccountProduct() {
  try {
    console.log('🚀 Creating product in main Stripe account...\n');

    // Create a product for Base Medlemskap
    const product = await stripe.products.create({
      name: 'Base Medlemskap',
      description: 'Grundläggande medlemskap med off-peak tillgång - 399 SEK/månad',
    });

    console.log('✅ Product created:');
    console.log(`   Product ID: ${product.id}\n`);

    // Create a price for 399 SEK/month
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 39900, // 399 SEK in öre
      currency: 'sek',
      recurring: {
        interval: 'month',
      },
    });

    console.log('✅ Price created:');
    console.log(`   Price ID: ${price.id}\n`);

    // Output the configuration to update
    console.log('📋 Update your stripe-config.ts with this price ID:');
    console.log(`
export const STRIPE_PRICE_MAPPING = {
  "base": "${price.id}",
  "flex": "${price.id}", // Using same price for now
  "studio-plus": "${price.id}", // Using same price for now
  "dagpass": "${price.id}", // Using same price for now
  "class-booking": "${price.id}", // Using same price for now
} as const;
    `);

    console.log('\n🎯 Next steps:');
    console.log('1. Copy the price ID above');
    console.log('2. Update src/lib/stripe-config.ts with the new price ID');
    console.log('3. Commit and push the changes');
    console.log('4. Test the payment flow');

  } catch (error) {
    console.error('❌ Error creating product:', error.message);
  }
}

// Run the script
createMainAccountProduct();
