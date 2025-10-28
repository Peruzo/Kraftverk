/**
 * Campaign Price Service for Kraftverk
 * Provides local lookup of campaign prices without external API calls
 */

import { getActivePrice, getAllActive } from "./campaigns-repo";
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
    // DB-backed: fetch directly
    const active = await getActivePrice(tenant, productId);
    
    console.log(`🔍 getCampaignPriceForProduct(${tenant}, ${productId})`);
    console.log(`   Active price present: ${Boolean(active)}`);
    
  const campaign = active
      ? ({
          id: active.campaignId || 'campaign',
          name: (active.metadata as any)?.campaign_name || 'Kampanj',
          type: 'discount',
          status: 'active',
          discountType: 'fixed',
          discountValue: 0,
          products: [productId],
          startDate: (active.validFrom as unknown as Date)?.toString?.() || new Date().toISOString(),
          endDate: active.validTo ? (active.validTo as unknown as Date).toString?.() : new Date(Date.now()+365*24*60*60*1000).toISOString(),
          stripePriceId: active.stripePriceId,
          originalProductId: productId,
          usageCount: 0,
          createdAt: undefined,
          updatedAt: undefined,
        } as unknown as Campaign)
      : undefined;
    
    if (campaign) {
      console.log(`✅ Found matching campaign: ${campaign.id}`);
    } else {
      console.log(`❌ No matching campaign found for product: ${productId}`);
    }
    
    if (campaign && campaign.stripePriceId) {
      console.log(`✅ Campaign price found for ${productId}: ${campaign.stripePriceId}`);
      
      return {
        hasCampaignPrice: true,
        priceId: campaign.stripePriceId,
        campaignId: campaign.id,
        campaignName: campaign.name,
      };
    }
    
    console.log(`ℹ️ No campaign price for ${productId} - using default price`);
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
  // DB-backed: fetch from PostgreSQL
  const active = await getAllActive(tenant);
  
  // Transform to Campaign type for compatibility
  return active.map(c => ({
    id: c.campaignId || 'campaign',
    name: (c.metadata as any)?.campaign_name || 'Kampanj',
    type: 'discount' as const,
    status: 'active' as const,
    discountType: 'fixed' as const,
    discountValue: 0,
    products: [c.productId],
    startDate: (c.validFrom as unknown as Date)?.toString?.() || new Date().toISOString(),
    endDate: c.validTo ? (c.validTo as unknown as Date).toString?.() : new Date(Date.now()+365*24*60*60*1000).toISOString(),
    stripePriceId: c.stripePriceId,
    originalProductId: c.productId,
    usageCount: 0,
    createdAt: undefined,
    updatedAt: undefined,
  } as unknown as Campaign));
}

