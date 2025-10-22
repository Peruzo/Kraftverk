"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";
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
  const handlePurchaseClick = () => {
    // Track product purchase attempt
    analytics.trackCTAClick('product_purchase', `Köp ${product.name}`, 'products_page');
    analytics.trackMembershipAction('product_purchase_attempt', product.id);
    
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
