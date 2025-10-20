// Stripe configuration and price mapping for KraftverkStudio

export const STRIPE_PRICE_MAPPING = {
  // Membership prices
  "base": "price_1SKMd4P9UcprUpsCuMucEymm",
  "flex": "price_1SKMd4P9UcprUpsCuMucEymm", 
  "studio-plus": "price_1SKMd4P9UcprUpsCuMucEymm",
  "dagpass": "price_1SKMd4P9UcprUpsCuMucEymm",
  
  // Class booking prices (using same price for demo)
  "class-booking": "price_1SKMd4P9UcprUpsCuMucEymm",
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
