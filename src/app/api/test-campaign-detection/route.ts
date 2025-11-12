import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeProductIdForKey } from "@/lib/product-mapping";

/**
 * Test endpoint to verify campaign detection
 * GET /api/test-campaign-detection?productKey=flex
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productKey = searchParams.get('productKey') || 'flex';
    
    console.log(`🧪 Testing campaign detection for: ${productKey}`);
    
    // 1. Test product mapping
    const stripeProductId = getStripeProductIdForKey(productKey);
    
    if (!stripeProductId) {
      return NextResponse.json({
        error: `No Stripe Product ID mapped for: ${productKey}`,
        hint: 'Check STRIPE_PRODUCT_MAPPING in product-mapping.ts'
      }, { status: 404 });
    }
    
    console.log(`✓ Product mapping found: ${productKey} → ${stripeProductId}`);
    
    // 2. Query Stripe for all active prices
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        error: 'STRIPE_SECRET_KEY not configured'
      }, { status: 500 });
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    });
    
    const prices = await stripe.prices.list({
      product: stripeProductId,
      active: true,
      limit: 20
    });
    
    console.log(`✓ Found ${prices.data.length} active price(s)`);
    
    // 3. Sort by creation date (newest first)
    const sorted = prices.data.sort((a, b) => (b.created || 0) - (a.created || 0));
    
    // 4. Check if campaign exists (multiple active prices)
    const isCampaign = sorted.length > 1;
    
    const result: any = {
      productKey,
      stripeProductId,
      totalActivePrices: prices.data.length,
      isCampaign,
      prices: sorted.map((price, index) => ({
        index: index + 1,
        isNewest: index === 0,
        id: price.id,
        amount: price.unit_amount,
        amountFormatted: `${(price.unit_amount || 0) / 100} ${price.currency.toUpperCase()}`,
        currency: price.currency,
        nickname: price.nickname,
        created: new Date(price.created * 1000).toISOString(),
        createdTimestamp: price.created
      }))
    };
    
    // 5. Add campaign info if detected
    if (isCampaign && sorted.length >= 2) {
      const newestPrice = sorted[0];
      const originalPrice = sorted[1];
      
      const discountAmount = (originalPrice.unit_amount || 0) - (newestPrice.unit_amount || 0);
      const discountPercent = Math.round(
        (discountAmount / (originalPrice.unit_amount || 1)) * 100
      );
      
      result.campaignInfo = {
        campaignPrice: newestPrice.unit_amount,
        campaignPriceFormatted: `${(newestPrice.unit_amount || 0) / 100} ${newestPrice.currency.toUpperCase()}`,
        originalPrice: originalPrice.unit_amount,
        originalPriceFormatted: `${(originalPrice.unit_amount || 0) / 100} ${originalPrice.currency.toUpperCase()}`,
        discountAmount,
        discountPercent: `${discountPercent}%`,
        savingsFormatted: `${discountAmount / 100} ${newestPrice.currency.toUpperCase()}`,
        description: newestPrice.nickname || 'Campaign price'
      };
      
      console.log('🎯 Campaign detected!', result.campaignInfo);
    } else {
      console.log('💰 No campaign - using standard price');
    }
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

