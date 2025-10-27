/**
 * Campaign Price Service for Kraftverk
 * Provides local lookup of campaign prices without external API calls
 */

import { getActiveCampaigns, findCampaignById } from "./campaigns-store";
import { Campaign } from "./campaigns";

interface CampaignPriceResult {
  hasCampaignPrice: boolean;
  priceId?: string;
  campaignId?: string;
  campaignName?: string;
}

/**
 * Get campaign price for a specific product
 * @param tenant - Tenant identifier (e.g., 'kraftverk')
 * @param productId - Product ID to check
 * @returns Campaign price information or null
 */
export async function getCampaignPriceForProduct(
  tenant: string,
  productId: string
): Promise<CampaignPriceResult | null> {
  try {
    // Get all active campaigns from local store
    const allCampaigns = getActiveCampaigns();
    
    // Find campaign that matches this product
    const campaign = allCampaigns.find(c => 
      c.originalProductId === productId && 
      c.status === 'active' &&
      isCampaignActive(c)
    );
    
    if (campaign && campaign.stripePriceId) {
      console.log(`✅ Campaign price found for ${productId}: ${campaign.stripePriceId}`);
      
      return {
        hasCampaignPrice: true,
        priceId: campaign.stripePriceId,
        campaignId: campaign.id,
        campaignName: campaign.name,
      };
    }
    
    console.log(`ℹ️ No campaign price for ${productId}`);
    return {
      hasCampaignPrice: false,
    };
  } catch (error) {
    console.error('Error getting campaign price:', error);
    return null;
  }
}

/**
 * Check if campaign is currently active based on dates
 */
function isCampaignActive(campaign: Campaign): boolean {
  const now = new Date();
  const startDate = new Date(campaign.startDate);
  const endDate = new Date(campaign.endDate);
  
  return now >= startDate && now <= endDate;
}

/**
 * Get all active campaigns for a tenant
 * @param tenant - Tenant identifier
 * @returns Array of active campaigns
 */
export async function getActiveCampaignsForTenant(tenant: string): Promise<Campaign[]> {
  const allCampaigns = getActiveCampaigns();
  
  return allCampaigns.filter(campaign => 
    campaign.status === 'active' && 
    isCampaignActive(campaign)
  );
}

