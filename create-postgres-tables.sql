-- Campaign Pricing Tables for PostgreSQL in 'app' schema
-- Run this in DBeaver/pgAdmin connected to Render database
-- Make sure you're connected as the 'kraftverk' user

-- Create app schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "app" AUTHORIZATION kraftverk;

-- Create enum type in app schema
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t 
                   JOIN pg_namespace n ON t.typnamespace = n.oid 
                   WHERE t.typname = 'CampaignStatus' AND n.nspname = 'app') THEN
        -- Create in current schema first, then move to app
        CREATE TYPE "CampaignStatus" AS ENUM ('active', 'expired', 'scheduled', 'paused');
        ALTER TYPE "CampaignStatus" SET SCHEMA "app";
    END IF;
END $$;

-- CampaignPrice table
CREATE TABLE IF NOT EXISTS app."CampaignPrice" (
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "campaignId" TEXT,
    "stripePriceId" TEXT NOT NULL,
    "status" app."CampaignStatus" NOT NULL DEFAULT 'active',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("tenantId", "productId", "status")
);

-- CampaignPriceHistory table
CREATE TABLE IF NOT EXISTS app."CampaignPriceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "campaignId" TEXT,
    "stripePriceId" TEXT NOT NULL,
    "status" app."CampaignStatus" NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT,
    "payload" JSONB,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ProcessedWebhookEvent table
CREATE TABLE IF NOT EXISTS app."ProcessedWebhookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS "CampaignPrice_tenantId_productId_idx" 
    ON app."CampaignPrice"("tenantId", "productId");
CREATE INDEX IF NOT EXISTS "CampaignPriceHistory_tenantId_productId_createdAt_idx" 
    ON app."CampaignPriceHistory"("tenantId", "productId", "createdAt");

-- Set default search_path for kraftverk user (optional, but recommended)
ALTER ROLE kraftverk SET search_path TO app, public;

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'app' 
AND table_name IN ('CampaignPrice', 'CampaignPriceHistory', 'ProcessedWebhookEvent');