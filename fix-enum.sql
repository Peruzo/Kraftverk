-- Fix: Create CampaignStatus enum in app schema
-- Run this in DBeaver connected to Render database

-- Ensure app schema exists
CREATE SCHEMA IF NOT EXISTS "app" AUTHORIZATION kraftverk;

-- Create enum directly in app schema
DO $$
BEGIN
    -- Check if enum exists in app schema
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_type t 
        JOIN pg_namespace n ON t.typnamespace = n.oid 
        WHERE t.typname = 'CampaignStatus' AND n.nspname = 'app'
    ) THEN
        -- Create enum directly in app schema using search_path
        SET LOCAL search_path TO app;
        CREATE TYPE "CampaignStatus" AS ENUM ('active', 'expired', 'scheduled', 'paused');
        RESET search_path;
    END IF;
END $$;

-- Alternative: If the above doesn't work, try this approach:
-- Drop if exists in wrong schema first
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_type t 
        JOIN pg_namespace n ON t.typnamespace = n.oid 
        WHERE t.typname = 'CampaignStatus' AND n.nspname != 'app'
    ) THEN
        DROP TYPE "CampaignStatus" CASCADE;
    END IF;
END $$;

-- Create enum in app schema (PostgreSQL 11+)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_type t 
        JOIN pg_namespace n ON t.typnamespace = n.oid 
        WHERE t.typname = 'CampaignStatus' AND n.nspname = 'app'
    ) THEN
        -- Create type qualified with schema
        EXECUTE 'CREATE TYPE app."CampaignStatus" AS ENUM (''active'', ''expired'', ''scheduled'', ''paused'')';
    END IF;
END $$;

-- Verify enum was created
SELECT 
    t.typname as enum_name,
    n.nspname as schema_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'CampaignStatus'
GROUP BY t.typname, n.nspname;

