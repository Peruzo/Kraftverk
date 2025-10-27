import { NextRequest, NextResponse } from "next/server";
import { analytics } from "@/lib/analytics";

// Store active campaigns in memory (or use database/Redis in production)
let activeCampaigns: any[] = [];

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
    // Verify API key
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, campaign, timestamp, priceUpdate } = body;

    console.log(`📢 Campaign webhook received: ${action}`, campaign?.name || priceUpdate?.productId);

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
        const existingIndex = activeCampaigns.findIndex(c => c.id === campaign.id);
        
        if (existingIndex >= 0) {
          activeCampaigns[existingIndex] = campaign;
          console.log(`✅ Campaign updated: ${campaign.name}`);
        } else {
          activeCampaigns.push(campaign);
          console.log(`✅ Campaign created: ${campaign.name}`);
        }

        // Track campaign event
        analytics.sendCustomEvent('campaign_updated', {
          campaignId: campaign.id,
          campaignName: campaign.name,
          action: action,
        });

        return NextResponse.json({ 
          success: true, 
          message: `Campaign ${action}`,
          activeCampaigns: activeCampaigns.length
        });

      case 'deleted':
        // Remove campaign
        activeCampaigns = activeCampaigns.filter(c => c.id !== campaign.id);
        console.log(`🗑️ Campaign deleted: ${campaign.name}`);

        return NextResponse.json({ 
          success: true, 
          message: 'Campaign deleted',
          activeCampaigns: activeCampaigns.length
        });

      case 'price.updated':
        // Handle Stripe price update - link to campaign
        if (priceUpdate) {
          const { stripePriceId, originalProductId, campaignId, campaignName } = priceUpdate;
          
          // Find the campaign to update
          let campaignToUpdate = activeCampaigns.find(c => c.id === campaignId);
          
          if (campaignToUpdate) {
            // Update existing campaign with price
            campaignToUpdate.stripePriceId = stripePriceId;
            campaignToUpdate.originalProductId = originalProductId;
            
            console.log(`💰 Price updated for campaign ${campaignToUpdate.name}: ${stripePriceId}`);
            
            // Track price update
            analytics.sendCustomEvent('campaign_price_updated', {
              campaignId: campaignToUpdate.id,
              campaignName: campaignToUpdate.name,
              stripePriceId,
              originalProductId,
            });
          } else {
            // Create new campaign entry for price-only update
            const newCampaign = {
              id: campaignId,
              name: campaignName || `Price Campaign ${campaignId}`,
              type: 'discount',
              status: 'active',
              discountType: 'percentage',
              discountValue: 0,
              products: originalProductId ? [originalProductId] : [],
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
              stripePriceId: stripePriceId,
              originalProductId: originalProductId,
              usageCount: 0,
            };
            
            activeCampaigns.push(newCampaign);
            
            console.log(`✨ Created new campaign entry for price update: ${newCampaign.name} (${stripePriceId})`);
            
            // Track price creation
            analytics.sendCustomEvent('campaign_created', {
              campaignId: newCampaign.id,
              campaignName: newCampaign.name,
              stripePriceId,
              originalProductId,
            });
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Price updated',
          priceId: priceUpdate?.stripePriceId,
          activeCampaigns: activeCampaigns.length
        });

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
    const campaignsWithPrices = activeCampaigns.filter(campaign => 
      campaign.stripePriceId && campaign.originalProductId
    );

    console.log(`📊 Returning ${campaignsWithPrices.length} campaigns with prices`);
    
    return NextResponse.json({ 
      campaigns: campaignsWithPrices,
      count: campaignsWithPrices.length,
      total: activeCampaigns.length
    });
  } catch (error) {
    console.error('❌ Campaign fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

