/**
 * Stripe Product Mapping for Kraftverk
 * Maps local product IDs to Stripe Product IDs (NOT price IDs)
 * 
 * This follows Tanja's approach: hardcoded mapping allows querying all active 
 * prices for a product, enabling automatic campaign detection via 
 * "newest active price wins"
 * 
 * No environment variables needed - simpler and more reliable!
 */

export const STRIPE_PRODUCT_MAPPING: Record<string, string> = {
  // Memberships
  'base': 'prod_THG4m4gSRybp0y',          // Gym Base
  'flex': 'prod_THVVyb98mumIla',          // Gym Flex
  'studio-plus': 'prod_THcCUqn2W4QXau',   // Studio+
  'dagpass': 'prod_THVyiRsRKlbHHu',       // Dagspass Gym
  'test-kund': 'prod_TKDbhT66WmDjbx',     // Test Kampanj
  
  // Products
  'gym-shirt': 'prod_THeVCK4X7SqU5e',     // Kraftverk Gym Shirt
  'gym-hoodie': 'prod_THeVD9WFd9I8oK',    // Kraftverk Gym Hoodie
  'gym-bottle': 'prod_THeW8b25muIeiJ',    // Kraftverk Gym Bottle
  'keychain': 'prod_THeW9rCEtkPIgG',      // Kraftverk Keychain
  'gym-bag': 'prod_THeWrbRmcLb7lh',       // Kraftverk Gym Bag
};

/**
 * Get Stripe Product ID for a local product key
 * @param productKey - Local product identifier (e.g., 'flex', 'gym-shirt')
 * @returns Stripe Product ID (e.g., 'prod_xxx') or null if not found
 */
export function getStripeProductIdForKey(productKey: string): string | null {
  return STRIPE_PRODUCT_MAPPING[productKey] || null;
}

/**
 * Inverse lookup: Find local product key from Stripe Product ID
 * @param stripeProductId - Stripe Product ID (e.g., 'prod_xxx')
 * @returns Local product key or null if not found
 */
export function getProductKeyFromStripeProductId(stripeProductId: string): string | null {
  for (const [key, value] of Object.entries(STRIPE_PRODUCT_MAPPING)) {
    if (value === stripeProductId) {
      return key;
    }
  }
  return null;
}


