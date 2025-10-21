/**
 * Script to create Stripe products and prices for Kraftverk
 * Run this script to set up your Stripe products
 * 
 * Usage: node scripts/setup-stripe-products.js
 */

const Stripe = require('stripe');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createStripeProducts() {
  try {
    console.log('🚀 Creating Stripe products for Kraftverk...\n');

    // 1. Base Medlemskap - 399 SEK/month
    const baseProduct = await stripe.products.create({
      name: 'Base Medlemskap',
      description: 'Grundläggande medlemskap med off-peak tillgång',
    });

    const basePrice = await stripe.prices.create({
      product: baseProduct.id,
      unit_amount: 39900, // 399 SEK in öre
      currency: 'sek',
      recurring: {
        interval: 'month',
      },
    });

    console.log('✅ Base Medlemskap created:');
    console.log(`   Product ID: ${baseProduct.id}`);
    console.log(`   Price ID: ${basePrice.id}\n`);

    // 2. Flex Medlemskap - 599 SEK/month
    const flexProduct = await stripe.products.create({
      name: 'Flex Medlemskap',
      description: 'Flexibelt medlemskap med full tillgång',
    });

    const flexPrice = await stripe.prices.create({
      product: flexProduct.id,
      unit_amount: 59900, // 599 SEK in öre
      currency: 'sek',
      recurring: {
        interval: 'month',
      },
    });

    console.log('✅ Flex Medlemskap created:');
    console.log(`   Product ID: ${flexProduct.id}`);
    console.log(`   Price ID: ${flexPrice.id}\n`);

    // 3. Studio+ Medlemskap - 899 SEK/month
    const studioPlusProduct = await stripe.products.create({
      name: 'Studio+ Medlemskap',
      description: 'Premium medlemskap med recovery-zon och PT-kredit',
    });

    const studioPlusPrice = await stripe.prices.create({
      product: studioPlusProduct.id,
      unit_amount: 89900, // 899 SEK in öre
      currency: 'sek',
      recurring: {
        interval: 'month',
      },
    });

    console.log('✅ Studio+ Medlemskap created:');
    console.log(`   Product ID: ${studioPlusProduct.id}`);
    console.log(`   Price ID: ${studioPlusPrice.id}\n`);

    // 4. Dagpass - 99 SEK one-time
    const dagpassProduct = await stripe.products.create({
      name: 'Dagpass',
      description: 'Enstaka träningspass',
    });

    const dagpassPrice = await stripe.prices.create({
      product: dagpassProduct.id,
      unit_amount: 9900, // 99 SEK in öre
      currency: 'sek',
    });

    console.log('✅ Dagpass created:');
    console.log(`   Product ID: ${dagpassProduct.id}`);
    console.log(`   Price ID: ${dagpassPrice.id}\n`);

    // 5. Class Booking - 99 SEK one-time
    const classBookingProduct = await stripe.products.create({
      name: 'Klassbokning',
      description: 'Bokning av träningsklass',
    });

    const classBookingPrice = await stripe.prices.create({
      product: classBookingProduct.id,
      unit_amount: 9900, // 99 SEK in öre
      currency: 'sek',
    });

    console.log('✅ Class Booking created:');
    console.log(`   Product ID: ${classBookingProduct.id}`);
    console.log(`   Price ID: ${classBookingPrice.id}\n`);

    // Output the configuration to update
    console.log('📋 Update your stripe-config.ts with these price IDs:');
    console.log(`
export const STRIPE_PRICE_MAPPING = {
  "base": "${basePrice.id}",
  "flex": "${flexPrice.id}",
  "studio-plus": "${studioPlusPrice.id}",
  "dagpass": "${dagpassPrice.id}",
  "class-booking": "${classBookingPrice.id}",
} as const;
    `);

  } catch (error) {
    console.error('❌ Error creating Stripe products:', error.message);
  }
}

// Run the script
createStripeProducts();
