import { NextRequest, NextResponse } from "next/server";
import { analytics } from "@/lib/analytics";
import { Campaign } from "@/lib/campaigns";
// DB-backed repo (Postgres)
import { prisma } from "@/lib/prisma";
import { 
  upsertActivePrice,
  writeHistory,
  isProcessed,
  markProcessed,
  getAllActive,
  getActivePrice,
  markActiveExpired
} from "@/lib/campaigns-repo";

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
    // No-op for DB path
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
        // Accept but DB truth is price.* events; record history if needed
        console.log(`ℹ️ Campaign ${action} received (metadata only)`);
        return NextResponse.json({ success: true, message: `Campaign ${action}` });

      case 'deleted':
        // Handled via price.deleted; ignore
        return NextResponse.json({ success: true, message: 'Campaign delete acknowledged' });

      case 'price.updated':
      case 'price.created':
        if (priceUpdate) {
          console.log(`[CAMPAIGN WEBHOOK] Processing price update`, priceUpdate);
          const tenantId = priceUpdate?.metadata?.tenant || 'kraftverk';
          const productId = priceUpdate.originalProductId;
          const eventIdStr = eventId || stripeEvent?.id;

          if (await isProcessed(eventIdStr)) {
            return NextResponse.json({ success: true, message: 'duplicate ignored' });
          }

          await prisma.$transaction(async () => {
            await upsertActivePrice({
              tenantId,
              productId,
              campaignId: priceUpdate.campaignId,
              stripePriceId: priceUpdate.stripePriceId,
              metadata: priceUpdate.metadata,
            });
            await writeHistory({
              tenantId,
              productId,
              campaignId: priceUpdate.campaignId,
              stripePriceId: priceUpdate.stripePriceId,
              status: 'active',
              eventType: action,
              eventId: eventIdStr,
              payload: { priceUpdate },
            });
            await markProcessed(eventIdStr, action, tenantId);
          });

          analytics.sendCustomEvent('campaign_price_upserted', {
            campaignId: priceUpdate.campaignId,
            campaignName: priceUpdate.campaignName,
            stripePriceId: priceUpdate.stripePriceId,
            originalProductId: productId,
          });
        }
        return NextResponse.json({ success: true, message: 'Price upserted' });

      case 'price.deleted':
        if (priceUpdate?.stripePriceId) {
          const tenantId = priceUpdate?.metadata?.tenant || 'kraftverk';
          const productId = priceUpdate.originalProductId;
          const eventIdStr = eventId || stripeEvent?.id;
          await prisma.$transaction(async () => {
            const active = await getActivePrice(tenantId, productId);
            if (active?.stripePriceId === priceUpdate.stripePriceId) {
              await markActiveExpired(tenantId, productId);
            }
            await writeHistory({
              tenantId,
              productId,
              campaignId: active?.campaignId,
              stripePriceId: priceUpdate.stripePriceId,
              status: 'expired',
              eventType: 'price.deleted',
              eventId: eventIdStr,
              payload: { priceUpdate },
            });
            await markProcessed(eventIdStr, 'price.deleted', tenantId);
          });
          return NextResponse.json({ success: true, message: 'Price deleted processed' });
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
      // DB-backed: return active campaigns for default tenant
      campaigns: await getAllActive('kraftverk'),
      count: (await getAllActive('kraftverk')).length,
      total: (await getAllActive('kraftverk')).length
    });
  } catch (error) {
    console.error('❌ Campaign fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

