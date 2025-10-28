-- Campaign Pricing Tables for PostgreSQL
-- Run this in Render Database UI or via psql

-- CampaignPrice table
CREATE TABLE IF NOT EXISTS "CampaignPrice" (
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "campaignId" TEXT,
    "stripePriceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "validFrom" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("tenantId", "productId", "status")
);

-- CampaignPriceHistory table
CREATE TABLE IF NOT EXISTS "CampaignPriceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "campaignId" TEXT,
    "stripePriceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT,
    "payload" JSONB,
    "validFrom" TIMESTAMP NOT NULL,
    "validTo" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ProcessedWebhookEvent table
CREATE TABLE IF NOT EXISTS "ProcessedWebhookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS "CampaignPrice_tenantId_productId_idx" ON "CampaignPrice"("tenantId", "productId");
CREATE INDEX IF NOT EXISTS "CampaignPriceHistory_tenantId_productId_createdAt_idx" ON "CampaignPriceHistory"("tenantId", "productId", "createdAt");

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('CampaignPrice', 'CampaignPriceHistory', 'ProcessedWebhookEvent');

