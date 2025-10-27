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
          const { stripePriceId, originalProductId, campaignId } = priceUpdate;
          
          // Find the campaign to update
          const campaignToUpdate = activeCampaigns.find(c => c.id === campaignId);
          
          if (campaignToUpdate) {
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
            console.warn(`⚠️ Campaign ${campaignId} not found for price update`);
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Price updated',
          priceId: priceUpdate?.stripePriceId
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
    // Filter only active campaigns
    const now = new Date();
    const active = activeCampaigns.filter(campaign => 
      campaign.status === 'active' &&
      new Date(campaign.startDate) <= now &&
      new Date(campaign.endDate) >= now
    );

    return NextResponse.json({ 
      campaigns: active,
      count: active.length
    });
  } catch (error) {
    console.error('❌ Campaign fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

