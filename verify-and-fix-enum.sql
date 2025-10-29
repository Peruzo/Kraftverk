-- Verify and fix CampaignStatus enum
-- Run this in DBeaver to check the current state

-- First, check if enum exists and where
SELECT 
    t.typname as enum_name,
    n.nspname as schema_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'CampaignStatus'
GROUP BY t.typname, n.nspname;

-- Check if there's an enum in wrong schema (e.g., public)
DO $$
DECLARE
    enum_exists_in_wrong_place BOOLEAN;
BEGIN
    -- Check if enum exists in public or other schemas (not app)
    SELECT EXISTS (
        SELECT 1 
        FROM pg_type t 
        JOIN pg_namespace n ON t.typnamespace = n.oid 
        WHERE t.typname = 'CampaignStatus' AND n.nspname != 'app'
    ) INTO enum_exists_in_wrong_place;
    
    IF enum_exists_in_wrong_place THEN
        RAISE NOTICE 'Enum exists in wrong schema. Dropping and recreating in app schema.';
        -- Drop enum from wrong schema (cascade will drop dependent columns, so we need to recreate tables)
        DROP TYPE IF EXISTS "CampaignStatus" CASCADE;
    END IF;
END $$;

-- Ensure app schema exists
CREATE SCHEMA IF NOT EXISTS "app" AUTHORIZATION kraftverk;

-- Drop if exists in app (to recreate cleanly)
DROP TYPE IF EXISTS app."CampaignStatus" CASCADE;

-- Create enum directly in app schema with explicit qualification
CREATE TYPE app."CampaignStatus" AS ENUM ('active', 'expired', 'scheduled', 'paused');

-- Verify it was created correctly
SELECT 
    t.typname as enum_name,
    n.nspname as schema_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'CampaignStatus' AND n.nspname = 'app'
GROUP BY t.typname, n.nspname;

-- Recreate tables if they were dropped (from CASCADE)
-- Only run these if the tables don't exist
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

CREATE TABLE IF NOT EXISTS app."ProcessedWebhookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS "CampaignPrice_tenantId_productId_idx" 
    ON app."CampaignPrice"("tenantId", "productId");
CREATE INDEX IF NOT EXISTS "CampaignPriceHistory_tenantId_productId_createdAt_idx" 
    ON app."CampaignPriceHistory"("tenantId", "productId", "createdAt");

