/**
 * Shared Campaign Store
 * Stores campaigns in memory - in production use database/Redis
 */

import { Campaign } from "./campaigns";

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
    activeCampaigns[existingIndex] = campaign;
  } else {
    activeCampaigns.push(campaign);
  }
}

export function removeCampaign(campaignId: string): void {
  activeCampaigns = activeCampaigns.filter(c => c.id !== campaignId);
}

export function findCampaignById(campaignId: string): Campaign | undefined {
  return activeCampaigns.find(c => c.id === campaignId);
}

