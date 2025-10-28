import { prisma } from "./prisma";
import type { CampaignStatus } from "@prisma/client";

export async function markActiveExpired(tenantId: string, productId: string) {
  await prisma.campaignPrice.updateMany({
    where: { tenantId, productId, status: "active" },
    data: { status: "expired", validTo: new Date() },
  });
}

export async function upsertActivePrice(args: {
  tenantId: string;
  productId: string;
  campaignId?: string;
  stripePriceId: string;
  metadata?: any;
}) {
  const { tenantId, productId, campaignId, stripePriceId, metadata } = args;
  await markActiveExpired(tenantId, productId);
  await prisma.campaignPrice.create({
    data: {
      tenantId,
      productId,
      campaignId,
      stripePriceId,
      status: "active",
      validFrom: new Date(),
      metadata,
    },
  });
}

export async function writeHistory(args: {
  tenantId: string;
  productId: string;
  campaignId?: string;
  stripePriceId: string;
  status: CampaignStatus;
  eventType: string;
  eventId?: string;
  payload?: any;
  validFrom?: Date;
  validTo?: Date | null;
}) {
  await prisma.campaignPriceHistory.create({
    data: {
      ...args,
      validFrom: args.validFrom ?? new Date(),
      validTo: args.validTo ?? null,
    },
  });
}

export async function isProcessed(eventId?: string) {
  if (!eventId) return false;
  const found = await prisma.processedWebhookEvent.findUnique({ where: { id: eventId } });
  return Boolean(found);
}

export async function markProcessed(eventId?: string, type?: string, tenantId?: string) {
  if (!eventId) return;
  try {
    await prisma.processedWebhookEvent.create({ data: { id: eventId, type: type ?? "", tenantId: tenantId ?? "" } });
  } catch {
    // ignore duplicates
  }
}

export async function getActivePrice(tenantId: string, productId: string) {
  return prisma.campaignPrice.findFirst({ where: { tenantId, productId, status: "active" } });
}

export async function getAllActive(tenantId: string) {
  return prisma.campaignPrice.findMany({ where: { tenantId, status: "active" } });
}


