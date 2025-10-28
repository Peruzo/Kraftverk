import { NextRequest, NextResponse } from "next/server";
import { getActiveCampaigns, hydrateCampaignsFromPersistence } from "@/lib/campaigns-store";
import { Campaign } from "@/lib/campaigns";

export async function GET(request: NextRequest) {
  try {
    await hydrateCampaignsFromPersistence();
    const all = getActiveCampaigns();
    const now = new Date();
    const active = all.filter(c => c.status === 'active' && new Date(c.startDate) <= now && new Date(c.endDate) >= now);
    return NextResponse.json({ campaigns: active, count: active.length });
  } catch (error) {
    console.error('active campaigns api error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


