/**
 * Shared Campaign Store
 * Stores campaigns in memory - in production use database/Redis
 */

import { Campaign } from "./campaigns";
import { loadPersistedCampaigns, persistCampaigns } from "./campaigns-persistence";

// Store active campaigns in memory
let activeCampaigns: Campaign[] = [];

export function getActiveCampaigns(): Campaign[] {
  return activeCampaigns;
}

export function setActiveCampaigns(campaigns: Campaign[]): void {
  activeCampaigns = campaigns;
}

export function addOrUpdateCampaign(campaign: Campaign): void {
  const existingIndex = activeCampaigns.findIndex(c => c.id === campaign.id);
  
  if (existingIndex >= 0) {
    activeCampaigns[existingIndex] = {
      ...activeCampaigns[existingIndex],
      ...campaign,
      updatedAt: new Date().toISOString(),
    };
  } else {
    activeCampaigns.push({
      ...campaign,
      createdAt: campaign.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  // Best-effort persist (async, fire-and-forget)
  void persistCampaigns(activeCampaigns);
}

export function removeCampaign(campaignId: string): void {
  activeCampaigns = activeCampaigns.filter(c => c.id !== campaignId);
  void persistCampaigns(activeCampaigns);
}

export function findCampaignById(campaignId: string): Campaign | undefined {
  return activeCampaigns.find(c => c.id === campaignId);
}

/**
 * Deactivate older campaign entries for a given product when a new price arrives
 */
export function deactivateOlderCampaignsForProduct(productId: string, keepCampaignId?: string): void {
  const nowIso = new Date().toISOString();
  activeCampaigns = activeCampaigns.map(c => {
    if (c.originalProductId === productId && c.id !== keepCampaignId && c.status === 'active') {
      return { ...c, status: 'expired', updatedAt: nowIso };
    }
    return c;
  });
  void persistCampaigns(activeCampaigns);
}

/**
 * Initialize the in-memory store from Redis if available and memory is empty.
 */
export async function hydrateCampaignsFromPersistence(): Promise<void> {
  if (activeCampaigns.length > 0) return;
  const loaded = await loadPersistedCampaigns();
  if (loaded && Array.isArray(loaded)) {
    activeCampaigns = loaded;
    console.log(`🧊 Hydrated ${activeCampaigns.length} campaigns from Redis`);
  }
}

