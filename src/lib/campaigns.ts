/**
 * Campaign Service for Kraftverk
 * Handles fetching and applying campaign discounts
 */

export interface Campaign {
  id: string;
  name: string;
  type: 'discount' | 'bundle' | 'trial';
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  products: string[];
  startDate: string;
  endDate: string;
  stripeCouponId?: string;
  stripePromotionCodeId?: string;
  stripePriceId?: string; // Dynamic campaign price from Stripe
  originalProductId?: string; // The product this campaign replaces
  usageCount: number;
  maxUses?: number;
}

const CAMPAIGN_API_URL = '/api/campaigns/webhook';

/**
 * Fetch all active campaigns from the webhook endpoint
 */
export async function fetchActiveCampaigns(): Promise<Campaign[]> {
  try {
    const response = await fetch(CAMPAIGN_API_URL);
    const data = await response.json();
    return data.campaigns || [];
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return [];
  }
}

/**
 * Find applicable campaign for a specific product
 */
export function findApplicableCampaign(
  productId: string,
  campaigns: Campaign[]
): Campaign | null {
  const now = new Date();
  
  return campaigns.find(campaign => 
    campaign.status === 'active' &&
    campaign.products.includes(productId) &&
    new Date(campaign.startDate) <= now &&
    new Date(campaign.endDate) >= now &&
    (!campaign.maxUses || campaign.usageCount < campaign.maxUses)
  ) || null;
}

/**
 * Calculate discounted price based on campaign
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  campaign: Campaign
): number {
  if (campaign.discountType === 'percentage') {
    return originalPrice * (1 - campaign.discountValue / 100);
  } else {
    return Math.max(0, originalPrice - campaign.discountValue);
  }
}

/**
 * Format discount for display (e.g., "20% rabatt" or "100 kr rabatt")
 */
export function formatDiscount(campaign: Campaign): string {
  if (campaign.discountType === 'percentage') {
    return `${campaign.discountValue}% rabatt`;
  } else {
    return `${campaign.discountValue} kr rabatt`;
  }
}

/**
 * Check if a campaign is currently valid
 */
export function isCampaignValid(campaign: Campaign): boolean {
  const now = new Date();
  return (
    campaign.status === 'active' &&
    new Date(campaign.startDate) <= now &&
    new Date(campaign.endDate) >= now &&
    (!campaign.maxUses || campaign.usageCount < campaign.maxUses)
  );
}

/**
 * Get campaign price ID for a product
 * Returns the campaign price if a valid campaign exists, otherwise null
 */
export async function getCampaignPriceId(productId: string): Promise<string | null> {
  try {
    const campaigns = await fetchActiveCampaigns();
    const campaign = findApplicableCampaign(productId, campaigns);
    
    // Return the campaign's Stripe price ID if it exists and is valid
    if (campaign && campaign.stripePriceId && isCampaignValid(campaign)) {
      return campaign.stripePriceId;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get campaign price:', error);
    return null;
  }
}

