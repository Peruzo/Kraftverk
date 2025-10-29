// Stripe configuration and price mapping for KraftverkStudio

export const STRIPE_PRICE_MAPPING = {
  // Membership prices - Using main account price IDs
  "base": "price_1SKhYSP6vvUUervCTpvpt0QO", // 399 SEK/month
  "flex": "price_1SKwUeP6vvUUervCMqO3Xv7v", // 599 SEK/month
  "studio-plus": "price_1SL2xzP6vvUUervCtqpdm124", // 899 SEK/month
  "dagpass": "price_1SKwweP6vvUUervCxH3vVYhG", // 149 SEK one-time
  "test-kund": "price_1SNZ9tP6vvUUervC25e3efk4", // Test Kampanj (new Stripe price)
  
  // Class booking prices
  "class-booking": "price_1SKhYSP6vvUUervCTpvpt0QO", // 99 SEK one-time (using base price for now)
  
  // Product prices - Using real price IDs from Stripe dashboard
  "gym-shirt": "price_1SL5CPP6vvUUervCs6aA8L23", // 299 SEK one-time
  "gym-hoodie": "price_1SL5CpP6vvUUervCS0hGh5i4", // 599 SEK one-time
  "gym-bottle": "price_1SL5D4P6vvUUervCoRbUt0GS", // 149 SEK one-time
  "keychain": "price_1SL5DMP6vvUUervCUFG0B0Ei", // 39 SEK one-time
  "gym-bag": "price_1SL5DhP6vvUUervCpwAMofHP", // 499 SEK one-time

  // PT Packages (using existing prices for now)
  "pt-starter": "price_1SKhYSP6vvUUervCTpvpt0QO", // 2999 SEK one-time (using base price)
  "pt-progress": "price_1SKwUeP6vvUUervCMqO3Xv7v", // 4999 SEK one-time (using flex price)
  "pt-transform": "price_1SL2xzP6vvUUervCtqpdm124", // 8999 SEK one-time (using studio+ price)
} as const;

export type ProductType = keyof typeof STRIPE_PRICE_MAPPING;

/**
 * Get Stripe price ID for a given product type
 * @param productType - The product type (membership ID or 'class-booking')
 * @returns Stripe price ID
 */
export function getStripePriceId(productType: string): string {
  // Check if it's a membership ID
  if (productType in STRIPE_PRICE_MAPPING) {
    return STRIPE_PRICE_MAPPING[productType as ProductType];
  }
  
  // Default to class booking price for any other product type
  return STRIPE_PRICE_MAPPING["class-booking"];
}

/**
 * Get product name for display purposes
 * @param productType - The product type
 * @returns Human-readable product name
 */
export function getProductDisplayName(productType: string): string {
  const displayNames: Record<string, string> = {
    "base": "Base Medlemskap",
    "flex": "Flex Medlemskap", 
    "studio-plus": "Studio+ Medlemskap",
    "dagpass": "Dagpass",
    "test-kund": "Test Kampanj Medlemskap",
    "class-booking": "Klassbokning",
    "gym-shirt": "Gym Tröja",
    "gym-hoodie": "Gym Sweatshirt",
    "gym-bottle": "Gym Vattenflaska",
    "keychain": "Nyckelring",
    "gym-bag": "Gymväska",
    "pt-starter": "PT Startpaket",
    "pt-progress": "PT Framsteg",
    "pt-transform": "PT Transformation",
  };
  
  return displayNames[productType] || "Produkt";
}
