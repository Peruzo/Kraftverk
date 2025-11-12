import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Campaign } from "@/lib/campaigns";
import { getActiveCampaigns, setActiveCampaigns, hydrateCampaignsFromPersistence } from "@/lib/campaigns-store";
import { isProcessed, markProcessed } from "@/lib/campaigns-repo";

function getEnv(key: string): string | undefined {
  return process.env[key];
}

function verifyAuth(request: NextRequest): boolean {
  const header = request.headers.get("authorization") || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  const token = m?.[1];
  const expected = getEnv("FRONTEND_API_KEY");
  return Boolean(token && expected && token === expected);
}

async function getRawBody(request: NextRequest): Promise<string> {
  // We use text() so HMAC is computed over the exact JSON string sent
  return await request.text();
}

function verifyHmac(request: NextRequest, raw: string): boolean {
  const secret = getEnv("FRONTEND_SYNC_SECRET");
  if (!secret) return true; // optional
  const sigHeader = request.headers.get("x-signature") || "";
  const m = sigHeader.match(/^sha256=(.+)$/i);
  if (!m) return false;
  const expected = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(m[1], "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

function normalizeCampaign(payload: any): Campaign {
  // Minimal normalization to our Campaign interface used in the app
  const nowIso = new Date().toISOString();
  return {
    id: payload.campaignId,
    name: payload.name,
    type: payload.type || "discount",
    status: payload.status || "active",
    discountType: payload.discountType === "fixed_amount" ? "fixed" : payload.discountType || "percentage",
    discountValue: Number(payload.discountValue ?? 0),
    products: Array.isArray(payload.products) ? payload.products : [],
    startDate: payload.startDate || nowIso,
    endDate: payload.endDate || nowIso,
    stripePriceId: undefined,
    originalProductId: undefined,
    usageCount: 0,
    maxUses: undefined,
  } as Campaign;
}

function upsertCampaign(campaign: Campaign) {
  const current = getActiveCampaigns();
  const idx = current.findIndex(c => c.id === campaign.id);
  if (idx >= 0) {
    current[idx] = campaign;
  } else {
    current.push(campaign);
  }
  setActiveCampaigns(current);
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const raw = await getRawBody(request);
    if (!verifyHmac(request, raw)) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 403 });
    }

    // Idempotency by header
    const idemKey = request.headers.get("idempotency-key") || "";
    const idemId = idemKey ? `sync:${idemKey}` : undefined;
    if (idemId && (await isProcessed(idemId))) {
      return NextResponse.json({ success: true, message: "duplicate ignored" });
    }

    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    // Basic validation
    if (!payload?.campaignId || !payload?.name || !payload?.startDate || !payload?.endDate) {
      return NextResponse.json({ success: false, message: "Missing required campaign fields" }, { status: 400 });
    }

    await hydrateCampaignsFromPersistence();
    const campaign = normalizeCampaign(payload);
    upsertCampaign(campaign);

    if (idemId) {
      await markProcessed(idemId, "campaign.sync", payload?.tenant || "");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Campaign sync error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}



