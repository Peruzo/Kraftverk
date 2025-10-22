// Stripe configuration and price mapping for KraftverkStudio

export const STRIPE_PRICE_MAPPING = {
  // Membership prices - Using main account price IDs
  "base": "price_1SKhYSP6vvUUervCTpvpt0QO", // 399 SEK/month
  "flex": "price_1SKwUeP6vvUUervCMqO3Xv7v", // 599 SEK/month
  "studio-plus": "price_1SL2xzP6vvUUervCtqpdm124", // 899 SEK/month
  "dagpass": "price_1SKwweP6vvUUervCxH3vVYhG", // 149 SEK one-time
  
  // Class booking prices
  "class-booking": "price_1SKhYSP6vvUUervCTpvpt0QO", // 99 SEK one-time (using base price for now)
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
    "class-booking": "Klassbokning",
  };
  
  return displayNames[productType] || "Produkt";
}
