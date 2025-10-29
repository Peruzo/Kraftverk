-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app";

-- CreateEnum (create in current schema, then move to app)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CampaignStatus') THEN
        CREATE TYPE "CampaignStatus" AS ENUM ('active', 'expired', 'scheduled', 'paused');
    END IF;
END $$;

-- Move enum to app schema if not already there
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type t 
               JOIN pg_namespace n ON t.typnamespace = n.oid 
               WHERE t.typname = 'CampaignStatus' AND n.nspname != 'app') THEN
        ALTER TYPE "CampaignStatus" SET SCHEMA "app";
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "app"."CampaignPrice" (
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "campaignId" TEXT,
    "stripePriceId" TEXT NOT NULL,
    "status" "app"."CampaignStatus" NOT NULL DEFAULT 'active',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignPrice_pkey" PRIMARY KEY ("tenantId","productId","status")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "app"."CampaignPriceHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "campaignId" TEXT,
    "stripePriceId" TEXT NOT NULL,
    "status" "app"."CampaignStatus" NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT,
    "payload" JSONB,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "app"."ProcessedWebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CampaignPrice_tenantId_productId_idx" ON "app"."CampaignPrice"("tenantId", "productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CampaignPriceHistory_tenantId_productId_createdAt_idx" ON "app"."CampaignPriceHistory"("tenantId", "productId", "createdAt");