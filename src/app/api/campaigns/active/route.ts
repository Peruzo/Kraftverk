import { NextRequest, NextResponse } from "next/server";
import { getAllActive } from "@/lib/campaigns-repo";

export async function GET(request: NextRequest) {
  try {
    const tenant = new URL(request.url).searchParams.get('tenant') || 'kraftverk';
    const active = await getAllActive(tenant);
    return NextResponse.json({ campaigns: active, count: active.length });
  } catch (error) {
    console.error('active campaigns api error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


