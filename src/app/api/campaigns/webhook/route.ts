import { NextRequest, NextResponse } from "next/server";
import { analytics } from "@/lib/analytics";
import { Campaign } from "@/lib/campaigns";
import { 
  getActiveCampaigns, 
  addOrUpdateCampaign, 
  removeCampaign, 
  findCampaignById,
  deactivateOlderCampaignsForProduct,
  hydrateCampaignsFromPersistence,
} from "@/lib/campaigns-store";

// Verify API key middleware
function verifyApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const expectedKey = process.env.SOURCE_API_KEY;
  
  if (!authHeader || !expectedKey) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return token === expectedKey;
}

export async function POST(request: NextRequest) {
  try {
    // Hydrate campaigns first to ensure persistence before updates
    await hydrateCampaignsFromPersistence();
    // Verify API key
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, campaign, timestamp, priceUpdate, eventId, stripeEvent } = body;

    console.log(`📢 Campaign webhook received: ${action}`, campaign?.name || priceUpdate?.campaignName);
    
    // Log event ID if provided (for debugging specific events)
    if (eventId) {
      console.log(`   Event ID: ${eventId}`);
    }

    switch (action) {
      case 'ping':
        // Respond to health check
        return NextResponse.json({ 
          success: true, 
          message: 'Pong',
          timestamp: new Date().toISOString()
        });

      case 'created':
      case 'updated':
        // Update campaign in memory/database
        addOrUpdateCampaign(campaign);
        console.log(`✅ Campaign ${action}: ${campaign.name}`);

        // Track campaign event
        analytics.sendCustomEvent('campaign_updated', {
          campaignId: campaign.id,
          campaignName: campaign.name,
          action: action,
        });

        return NextResponse.json({ 
          success: true, 
          message: `Campaign ${action}`,
          activeCampaigns: getActiveCampaigns().length
        });

      case 'deleted':
        // Remove campaign
        removeCampaign(campaign.id);
        console.log(`🗑️ Campaign deleted: ${campaign.name}`);

        return NextResponse.json({ 
          success: true, 
          message: 'Campaign deleted',
          activeCampaigns: getActiveCampaigns().length
        });

      case 'price.updated':
      case 'price.created':
        // Handle Stripe price update - UPSERT behavior
        if (priceUpdate) {
          console.log(`[CAMPAIGN WEBHOOK] Processing price update`, priceUpdate);
          const { stripePriceId, originalProductId, campaignId, campaignName, metadata } = priceUpdate;

          // 1) Upsert campaign entry
          let campaignToUpdate = findCampaignById(campaignId);

          if (!campaignToUpdate) {
            campaignToUpdate = {
              id: campaignId,
              name: campaignName || `Price Campaign ${campaignId}`,
              type: 'discount',
              status: 'active',
              discountType: 'percentage',
              discountValue: 0,
              products: originalProductId ? [originalProductId] : [],
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              usageCount: 0,
              originalProductId,
              stripePriceId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as Campaign;

            console.log(`✨ Upserting new campaign for price update: ${campaignToUpdate.name} (${stripePriceId})`);
          } else {
            campaignToUpdate.stripePriceId = stripePriceId;
            campaignToUpdate.originalProductId = originalProductId;
            campaignToUpdate.updatedAt = new Date().toISOString();
            console.log(`💰 Updated existing campaign ${campaignToUpdate.name} with new price: ${stripePriceId}`);
          }

          addOrUpdateCampaign(campaignToUpdate);

          // 2) Deactivate older campaigns for the same product to avoid picking outdated prices
          if (originalProductId) {
            deactivateOlderCampaignsForProduct(originalProductId, campaignToUpdate.id);
          }

          // Track
          analytics.sendCustomEvent('campaign_price_upserted', {
            campaignId: campaignToUpdate.id,
            campaignName: campaignToUpdate.name,
            stripePriceId,
            originalProductId,
          });

          console.log(`✅ Successfully upserted campaign with price ID: ${stripePriceId}`);
        }

        return NextResponse.json({
          success: true,
          message: 'Price upserted',
          priceId: priceUpdate?.stripePriceId,
          activeCampaigns: getActiveCampaigns().length,
        });

      case 'price.deleted':
        // Deactivate campaign entries that reference this price
        if (priceUpdate?.stripePriceId) {
          const priceIdToRemove = priceUpdate.stripePriceId;
          const all = getActiveCampaigns();
          let changed = false;
          all.forEach(c => {
            if (c.stripePriceId === priceIdToRemove) {
              c.status = 'expired';
              c.updatedAt = new Date().toISOString();
              addOrUpdateCampaign(c);
              changed = true;
            }
          });

          console.log(`🗓️ price.deleted processed for ${priceIdToRemove} — updated=${changed}`);

          return NextResponse.json({
            success: true,
            message: 'Price deleted processed',
            priceId: priceIdToRemove,
            activeCampaigns: getActiveCampaigns().length,
          });
        }
        return NextResponse.json({ error: 'Missing priceUpdate.stripePriceId' }, { status: 400 });

      default:
        return NextResponse.json({ 
          error: 'Unknown action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Campaign webhook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET endpoint to fetch active campaigns
export async function GET(request: NextRequest) {
  try {
    // Return all campaigns with price IDs (both active and for price lookup)
    // This allows checkout to find campaign prices
    const allCampaigns = getActiveCampaigns();
    const campaignsWithPrices = allCampaigns.filter(campaign => 
      campaign.stripePriceId && campaign.originalProductId
    );

    console.log(`📊 Total campaigns in store: ${allCampaigns.length}`);
    console.log(`📊 Campaigns with prices: ${campaignsWithPrices.length}`);
    
    // Log all campaigns for debugging
    allCampaigns.forEach(campaign => {
      console.log(`   - ${campaign.id}: ${campaign.originalProductId} → ${campaign.stripePriceId}`);
    });

    return NextResponse.json({ 
      campaigns: campaignsWithPrices,
      allCampaigns: allCampaigns, // Include all for debugging
      count: campaignsWithPrices.length,
      total: allCampaigns.length
    });
  } catch (error) {
    console.error('❌ Campaign fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

