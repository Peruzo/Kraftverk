import { Campaign } from "./campaigns";

/**
 * Lightweight persistence layer using Upstash Redis REST API if configured.
 * Falls back to no-op if credentials are missing, keeping current in-memory behavior.
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL || "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN || "";
const CAMPAIGNS_KEY = process.env.CAMPAIGNS_REDIS_KEY || "kraftverk:campaigns:v1";

function hasRedis(): boolean {
  return Boolean(REDIS_URL && REDIS_TOKEN);
}

async function redisPipeline<T = any>(commands: (string | number)[][]): Promise<T[]> {
  const response = await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    // Upstash is external; keep a conservative timeout via AbortController if needed
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upstash pipeline error: ${response.status} ${text}`);
  }
  return (await response.json()) as T[];
}

export async function loadPersistedCampaigns(): Promise<Campaign[] | null> {
  try {
    if (!hasRedis()) return null;
    const [getRes] = await redisPipeline([["GET", CAMPAIGNS_KEY]]);
    const value = (getRes && getRes.result) as string | null;
    if (!value) return [];
    const parsed = JSON.parse(value) as Campaign[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("❌ Failed to load campaigns from Redis:", error);
    return null;
  }
}

export async function persistCampaigns(campaigns: Campaign[]): Promise<boolean> {
  try {
    if (!hasRedis()) return false;
    const payload = JSON.stringify(campaigns);
    await redisPipeline([["SET", CAMPAIGNS_KEY, payload]]);
    return true;
  } catch (error) {
    console.error("❌ Failed to persist campaigns to Redis:", error);
    return false;
  }
}


