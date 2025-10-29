// Utilities to resolve Stripe Product IDs from environment configuration

type ProductMap = Record<string, string>;

function parseJsonMap(envValue?: string | undefined): ProductMap {
  if (!envValue) return {};
  try {
    const parsed = JSON.parse(envValue);
    if (parsed && typeof parsed === 'object') {
      return parsed as ProductMap;
    }
  } catch {
    // ignore invalid JSON; fall through to empty map
  }
  return {};
}

/**
 * Resolve Stripe Product ID for a given local product key.
 * Supports two env mechanisms:
 * - STRIPE_PRODUCT_MAP: JSON string mapping keys to Stripe Product IDs
 * - Per-key variables: STRIPE_PRODUCT_<UPPER_SNAKE>=prod_...
 */
export function getStripeProductIdForKey(productKey: string): string | null {
  const jsonMap = parseJsonMap(process.env.STRIPE_PRODUCT_MAP);
  if (jsonMap[productKey]) return jsonMap[productKey];

  const envVarName = `STRIPE_PRODUCT_${productKey.replace(/[-\s]/g, '_').toUpperCase()}`;
  const fallback = process.env[envVarName];
  return fallback || null;
}

/**
 * Inverse lookup: find local product key by Stripe Product ID.
 * Uses the same env mechanisms as above.
 */
export function getProductKeyFromStripeProductId(stripeProductId: string): string | null {
  // Check JSON map first
  const jsonMap = parseJsonMap(process.env.STRIPE_PRODUCT_MAP);
  for (const [key, value] of Object.entries(jsonMap)) {
    if (value === stripeProductId) return key;
  }

  // Check per-key vars
  const envEntries = Object.entries(process.env).filter(([k]) => k.startsWith('STRIPE_PRODUCT_'));
  for (const [envKey, value] of envEntries) {
    if (value === stripeProductId) {
      const key = envKey.replace(/^STRIPE_PRODUCT_/, '')
        .toLowerCase()
        .replace(/_/g, '-');
      return key;
    }
  }
  return null;
}


