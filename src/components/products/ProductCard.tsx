"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { analytics } from "@/lib/enhanced-analytics";
import styles from "./ProductCard.module.css";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stripeProductId: string;
}

interface ProductCardProps {
  product: Product;
  onPurchase: (product: Product) => void;
  loading?: boolean;
}

interface PriceInfo {
  found: boolean;
  priceId?: string;
  amount?: number;
  currency?: string;
  isCampaign?: boolean;
  campaignInfo?: {
    originalAmount: number;
    discountPercent: number;
    description?: string;
  };
}

export default function ProductCard({ product, onPurchase, loading = false }: ProductCardProps) {
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  // Fetch latest price from Stripe (Tanja's approach: newest active price wins)
  useEffect(() => {
    async function fetchLatestPrice() {
      try {
        const response = await fetch(
          `/api/test-campaign-detection?productKey=${encodeURIComponent(product.id)}`,
          { cache: 'no-store' }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.totalActivePrices > 0) {
            const newestPrice = data.prices[0];
            
            setPriceInfo({
              found: true,
              priceId: newestPrice.id,
              amount: newestPrice.amount,
              currency: newestPrice.currency,
              isCampaign: data.isCampaign,
              campaignInfo: data.campaignInfo ? {
                originalAmount: data.campaignInfo.originalPrice,
                discountPercent: parseInt(data.campaignInfo.discountPercent),
                description: data.campaignInfo.description
              } : undefined
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch price info:', error);
      } finally {
        setIsLoadingPrice(false);
      }
    }

    fetchLatestPrice();
  }, [product.id]);

  // Use campaign price if available, otherwise fallback to static price
  const displayPrice = priceInfo?.amount 
    ? Math.round(priceInfo.amount / 100) 
    : product.price;
  
  const isCampaign = priceInfo?.isCampaign;
  const campaignInfo = priceInfo?.campaignInfo;
  const originalPrice = campaignInfo?.originalAmount 
    ? Math.round(campaignInfo.originalAmount / 100) 
    : product.price;

  // Track product view when component mounts
  useEffect(() => {
    analytics.trackProductView(product.id, product.name, 'gym_product', displayPrice);
  }, [product.id, product.name, displayPrice]);

  const handlePurchaseClick = () => {
    // Track add to cart with actual price (campaign or standard)
    analytics.trackAddToCart(product.id, product.name, 1, displayPrice);
    
    // Also track CTA click
    analytics.trackCTAClick(`Köp ${product.name}`, 'product_purchase', 'products_page', product.id);
    
    onPurchase(product);
  };

  return (
    <Card padding="md">
      <div className={styles.card}>
        {/* Campaign Badge */}
        {isCampaign && campaignInfo && !isLoadingPrice && (
          <div className={styles.campaignBadge}>
            <Badge variant="accent">{campaignInfo.discountPercent}% rabatt</Badge>
          </div>
        )}

        <div className={styles.imageWrapper}>
          <img src={product.image} alt={product.name} className={styles.image} />
          <div className={styles.imageOverlay}></div>
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.description}>{product.description}</p>
          
          <div className={styles.priceSection}>
            <div className={styles.price}>
              {isCampaign && campaignInfo ? (
                <>
                  <span className={styles.originalPrice}>{originalPrice}</span>
                  <span className={styles.priceAmount}>{displayPrice}</span>
                  <span className={styles.priceCurrency}>kr</span>
                </>
              ) : (
                <>
                  <span className={styles.priceAmount}>{displayPrice}</span>
                  <span className={styles.priceCurrency}>kr</span>
                </>
              )}
            </div>
          </div>
          
          <Button 
            fullWidth 
            onClick={handlePurchaseClick}
            disabled={loading}
            analyticsEvent="product_purchase"
            analyticsData={{ 
              productId: product.id,
              productName: product.name,
              price: displayPrice,
              location: 'products_page',
              isCampaign: isCampaign || false,
              originalPrice: isCampaign ? originalPrice : displayPrice
            }}
          >
            {loading ? "Bearbetar..." : "Köp nu"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
