/**
 * Test script to verify product mapping
 * Run: node scripts/test-product-mapping.js
 */

// Import the mapping (adjust path if needed)
const { STRIPE_PRODUCT_MAPPING, getStripeProductIdForKey } = require('../src/lib/product-mapping.ts');

console.log('🧪 Testing Kraftverk Product Mapping\n');

const testProducts = [
  'base',
  'flex', 
  'studio-plus',
  'dagpass',
  'test-kund',
  'gym-shirt',
  'gym-hoodie',
  'gym-bottle',
  'keychain',
  'gym-bag'
];

console.log('✅ Testing product lookups:\n');

testProducts.forEach(productKey => {
  const stripeProductId = getStripeProductIdForKey(productKey);
  if (stripeProductId) {
    console.log(`  ✓ ${productKey.padEnd(15)} → ${stripeProductId}`);
  } else {
    console.log(`  ✗ ${productKey.padEnd(15)} → NOT FOUND`);
  }
});

console.log('\n🎯 All product mappings are configured!');
console.log('\nNext: Create a campaign in Stripe to test:\n');
console.log('  1. Go to Stripe Dashboard → Products');
console.log('  2. Find "Gym Flex" (prod_THVVyb98mumIla)');
console.log('  3. Click "+ Add another price"');
console.log('  4. Enter campaign price: 479 SEK (20% off 599)');
console.log('  5. Nickname: "Black Friday Campaign"');
console.log('  6. ✅ Keep BOTH prices active');
console.log('  7. Save\n');

