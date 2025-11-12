"use client";

import React, { useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
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

export default function ProductCard({ product, onPurchase, loading = false }: ProductCardProps) {
  // Track product view when component mounts (match TRAFIKKALLOR guide for Product Purchase Funnel)
  useEffect(() => {
    analytics.trackProductView(product.id, product.name, 'gym_product', product.price);
  }, [product]);

  const handlePurchaseClick = () => {
    // Track add to cart (match TRAFIKKALLOR guide for Product Purchase Funnel)
    analytics.trackAddToCart(product.id, product.name, 1, product.price);
    
    // Also track CTA click
    analytics.trackCTAClick(`Köp ${product.name}`, 'product_purchase', 'products_page', product.id);
    
    onPurchase(product);
  };

  return (
    <Card padding="md">
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <img src={product.image} alt={product.name} className={styles.image} />
          <div className={styles.imageOverlay}></div>
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.description}>{product.description}</p>
          
          <div className={styles.priceSection}>
            <div className={styles.price}>
              <span className={styles.priceAmount}>{product.price}</span>
              <span className={styles.priceCurrency}>kr</span>
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
              price: product.price,
              location: 'products_page'
            }}
          >
            {loading ? "Bearbetar..." : "Köp nu"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
